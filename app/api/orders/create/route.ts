import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FLOOR_AMOUNT = 1;
const PASSENGER_COMMISSION = 15;
const ORDER_COMMISSION = 20;
const ADMIN_COMMISSION = 2;

function getJordanWeek() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Amman",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(now);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  const weekday = get("weekday");

  const weekdayNumber: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const current = new Date(
    Date.UTC(year, month - 1, day)
  );

  current.setUTCDate(
    current.getUTCDate() -
      (weekdayNumber[weekday] ?? 0)
  );

  const weekStartText =
    current.toISOString().split("T")[0];

  current.setUTCDate(
    current.getUTCDate() + 6
  );

  const weekEndText =
    current.toISOString().split("T")[0];

  return {
    weekStartText,
    weekEndText,
  };
}

export async function POST(req: NextRequest) {
  let createdOrderId: number | null = null;
  let insertedTransactionIds: number[] = [];

  try {
    const body = await req.json();

    const customerName = String(
      body.customerName ?? ""
    ).trim();

    const customerPhone = String(
      body.customerPhone ?? ""
    ).trim();

    const producerId = Number(body.producerId);
    const captainId = Number(body.captainId);

    const orderType = String(
      body.orderType ?? "راكب"
    );

    const amount = Number(body.amount);

    if (
      !customerName ||
      !customerPhone ||
      !Number.isInteger(producerId) ||
      !Number.isInteger(captainId) ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "بيانات الطلب غير مكتملة أو غير صحيحة",
        },
        { status: 400 }
      );
    }

    if (
      orderType !== "راكب" &&
      orderType !== "اوردر"
    ) {
      return NextResponse.json(
        {
          error: "نوع الطلب غير صحيح",
        },
        { status: 400 }
      );
    }

    // =========================
    // الكابتن
    // =========================

    const {
      data: captain,
      error: captainError,
    } = await supabase
      .from("Users")
      .select(
        "id, full_name, status, wallet_balance, is_captain"
      )
      .eq("id", captainId)
      .single();

    if (
      captainError ||
      !captain ||
      !captain.is_captain
    ) {
      return NextResponse.json(
        {
          error: "الكابتن غير موجود",
        },
        { status: 404 }
      );
    }

    // =========================
    // المنتج
    // =========================

    const {
      data: producer,
      error: producerError,
    } = await supabase
      .from("Users")
      .select(
        "id, full_name, is_producer"
      )
      .eq("id", producerId)
      .single();

    if (
      producerError ||
      !producer ||
      !producer.is_producer
    ) {
      return NextResponse.json(
        {
          error: "المنتج غير موجود",
        },
        { status: 404 }
      );
    }

    // =========================
    // الأسبوع
    // =========================

    const {
      weekStartText,
      weekEndText,
    } = getJordanWeek();

    // =========================
    // العمولة
    // =========================

    const commissionPercent =
      orderType === "راكب"
        ? PASSENGER_COMMISSION
        : ORDER_COMMISSION;

    const producerCommission = Number(
      (
        (amount * commissionPercent) /
        100
      ).toFixed(2)
    );

    const adminCommission = Number(
      (
        (amount * ADMIN_COMMISSION) /
        100
      ).toFixed(2)
    );

    const netProducerCommission =
      Number(
        (
          producerCommission -
          adminCommission
        ).toFixed(2)
      );

    // =========================
    // نشاط الكابتن
    // =========================

    const captainIsActive =
      captain.status === true ||
      captain.status === "true" ||
      captain.status === 1 ||
      captain.status === "1";

    // =========================
    // فحص الأرضية
    // =========================

    let floorApplied = false;
    let existingFloorId: number | null = null;

    if (captainIsActive) {
      const {
        data: floorRows,
        error: floorError,
      } = await supabase
        .from("BalanceTransactions")
        .select(
          "id, wallet_deducted"
        )
        .eq(
          "user_id",
          captainId
        )
        .eq(
          "description",
          "الأرضية الأسبوعية"
        )
        .eq(
          "week_start",
          weekStartText
        )
        .eq(
          "week_end",
          weekEndText
        )
        .order("id", {
          ascending: true,
        })
        .limit(1);

      if (floorError) {
        return NextResponse.json(
          {
            error:
              floorError.message,
          },
          { status: 500 }
        );
      }

      if (
        floorRows &&
        floorRows.length > 0
      ) {
        existingFloorId =
          Number(
            floorRows[0].id
          );

        /*
         * إذا الحركة موجودة ولكن
         * wallet_deducted = false
         * فهذا يعني أن الأرضية
         * تسجلت سابقًا ولم تُخصم.
         */
        floorApplied =
          floorRows[0]
            .wallet_deducted === false;
      } else {
        /*
         * لا توجد أرضية لهذا الأسبوع.
         * إذن أول طلب فعّال يضيفها.
         */
        floorApplied = true;
      }
    }

    // =========================
    // إجمالي الخصم
    // =========================

    const deduction = Number(
      (
        producerCommission +
        (floorApplied
          ? FLOOR_AMOUNT
          : 0)
      ).toFixed(2)
    );

    const walletBefore = Number(
      captain.wallet_balance ?? 0
    );

    // =========================
    // إنشاء الطلب
    // =========================

    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("Orders")
      .insert({
        customer_name:
          customerName,

        customer_phone:
          customerPhone,

        producer_id:
          producerId,

        captain_id:
          captainId,

        order_type:
          orderType,

        amount,

        producer_commission:
          producerCommission,

        admin_commission:
          adminCommission,

        net_producer_commission:
          netProducerCommission,

        captain_commission:
          producerCommission,

        captain_due:
          producerCommission,

        week_start:
          weekStartText,

        week_end:
          weekEndText,

        status:
          "completed",

        is_settled:
          false,
      })
      .select()
      .single();

    if (
      orderError ||
      !order
    ) {
      return NextResponse.json(
        {
          error:
            orderError?.message ??
            "تعذر إنشاء الطلب",
        },
        { status: 500 }
      );
    }

    createdOrderId =
      Number(order.id);

    // =========================
    // الحركات المالية
    // =========================

    const transactions: any[] = [];

    /*
     * إذا لا توجد حركة أرضية:
     * ننشئها.
     */
    if (
      floorApplied &&
      existingFloorId === null
    ) {
      transactions.push({
        user_id:
          captainId,

        order_id:
          null,

        type:
          "debit",

        amount:
          FLOOR_AMOUNT,

        description:
          "الأرضية الأسبوعية",

        week_start:
          weekStartText,

        week_end:
          weekEndText,

        is_settled:
          false,

        wallet_deducted:
          false,
      });
    }

    // عمولة الكابتن

    transactions.push({
      user_id:
        captainId,

      order_id:
        order.id,

      type:
        "debit",

      amount:
        producerCommission,

      description:
        `عمولة ${orderType} - المنتج: ${producer.full_name}`,

      week_start:
        weekStartText,

      week_end:
        weekEndText,

      is_settled:
        false,

      wallet_deducted:
        true,
    });

    // مستحق المنتج

    transactions.push({
      user_id:
        producerId,

      order_id:
        order.id,

      type:
        "credit",

      amount:
        netProducerCommission,

      description:
        `عمولة المنتج - ${customerName}`,

      week_start:
        weekStartText,

      week_end:
        weekEndText,

      is_settled:
        false,

      wallet_deducted:
        false,
    });

    const {
      data: insertedTransactions,
      error: transactionError,
    } = await supabase
      .from(
        "BalanceTransactions"
      )
      .insert(
        transactions
      )
      .select("id");

    if (
      transactionError ||
      !insertedTransactions
    ) {
      await supabase
        .from("Orders")
        .delete()
        .eq(
          "id",
          order.id
        );

      return NextResponse.json(
        {
          error:
            transactionError?.message ??
            "تعذر حفظ الحركات المالية",
        },
        { status: 500 }
      );
    }

    insertedTransactionIds =
      insertedTransactions.map(
        (row) =>
          Number(row.id)
      );

    // =========================
    // خصم المحفظة
    // =========================

    const {
      data: newWalletBalance,
      error: walletError,
    } = await supabase.rpc(
      "deduct_wallet_balance",
      {
        p_user_id:
          captainId,

        p_amount:
          deduction,
      }
    );

    if (
      walletError ||
      newWalletBalance === null ||
      newWalletBalance === undefined
    ) {
      if (
        insertedTransactionIds.length >
        0
      ) {
        await supabase
          .from(
            "BalanceTransactions"
          )
          .delete()
          .in(
            "id",
            insertedTransactionIds
          );
      }

      await supabase
        .from("Orders")
        .delete()
        .eq(
          "id",
          order.id
        );

      return NextResponse.json(
        {
          error:
            walletError?.message ??
            "تعذر خصم المبلغ من محفظة الكابتن",
        },
        { status: 500 }
      );
    }

    const finalWalletBalance =
      Number(
        newWalletBalance
      );

    // =========================
    // تحديث حالة الأرضية
    // =========================

    if (
      floorApplied &&
      existingFloorId !== null
    ) {
      const {
        error:
          floorUpdateError,
      } = await supabase
        .from(
          "BalanceTransactions"
        )
        .update({
          wallet_deducted:
            true,
        })
        .eq(
          "id",
          existingFloorId
        );

      if (
        floorUpdateError
      ) {
        return NextResponse.json(
          {
            error:
              floorUpdateError.message,
          },
          { status: 500 }
        );
      }
    }

    /*
     * إذا أنشأنا حركة أرضية جديدة،
     * نحدد أنها أصبحت مخصومة فعليًا.
     */
    if (
      floorApplied &&
      existingFloorId === null
    ) {
      const floorTransaction =
        insertedTransactions.find(
          (_, index) =>
            transactions[index]
              ?.description ===
            "الأرضية الأسبوعية"
        );

      if (
        floorTransaction
      ) {
        await supabase
          .from(
            "BalanceTransactions"
          )
          .update({
            wallet_deducted:
              true,
          })
          .eq(
            "id",
            floorTransaction.id
          );
      }
    }

    return NextResponse.json({
      success: true,

      orderId:
        order.id,

      producerCommission,

      adminCommission,

      netProducerCommission,

      floorApplied,

      deduction,

      walletBefore,

      walletBalance:
        finalWalletBalance,

      captainIsActive,

      weekStart:
        weekStartText,

      weekEnd:
        weekEndText,
    });
  } catch (error: any) {
    if (
      insertedTransactionIds.length >
      0
    ) {
      await supabase
        .from(
          "BalanceTransactions"
        )
        .delete()
        .in(
          "id",
          insertedTransactionIds
        );
    }

    if (
      createdOrderId
    ) {
      await supabase
        .from("Orders")
        .delete()
        .eq(
          "id",
          createdOrderId
        );
    }

    return NextResponse.json(
      {
        error:
          error?.message ??
          "حدث خطأ أثناء حفظ الطلب",
      },
      { status: 500 }
    );
  }
}