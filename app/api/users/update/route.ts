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
  try {
    // =========================
    // حماية الـ API
    // =========================

    const authHeader =
      req.headers.get("authorization");

    if (
      !authHeader ||
      authHeader !==
        `Bearer ${process.env.BOT_SECRET}`
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const orderId = Number(body.orderId);
    const producerId = Number(body.producerId);
    const captainId = Number(body.captainId);
    const amount = Number(body.amount);

    const customerName = String(
      body.customerName ?? ""
    ).trim();

    const customerPhone = String(
      body.customerPhone ?? ""
    ).trim();

    const orderType = String(
      body.orderType ?? "راكب"
    );

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0 ||
      !Number.isInteger(producerId) ||
      !Number.isInteger(captainId) ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "بيانات التعديل غير صحيحة",
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
          error:
            "نوع الطلب غير صحيح",
        },
        { status: 400 }
      );
    }

    // =========================
    // جلب الطلب القديم
    // =========================

    const {
      data: oldOrder,
      error: oldOrderError,
    } = await supabase
      .from("Orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (
      oldOrderError ||
      !oldOrder
    ) {
      return NextResponse.json(
        {
          error:
            "الطلب غير موجود",
        },
        { status: 404 }
      );
    }

    if (
      oldOrder.status ===
      "cancelled"
    ) {
      return NextResponse.json(
        {
          error:
            "لا يمكن تعديل طلب ملغي",
        },
        { status: 400 }
      );
    }

    if (
      oldOrder.is_settled === true
    ) {
      return NextResponse.json(
        {
          error:
            "لا يمكن تعديل طلب تمت تسويته ماليًا",
        },
        { status: 400 }
      );
    }

    // =========================
    // جلب الحركات القديمة
    // =========================

    const {
      data: oldTransactions,
      error:
        oldTransactionsError,
    } = await supabase
      .from("BalanceTransactions")
      .select("*")
      .eq("order_id", orderId)
      .eq("wallet_deducted", true);

    if (
      oldTransactionsError
    ) {
      return NextResponse.json(
        {
          error:
            oldTransactionsError.message,
        },
        { status: 500 }
      );
    }

    const settledTransaction =
      (
        oldTransactions ?? []
      ).find(
        (transaction) =>
          transaction.is_settled ===
          true
      );

    if (
      settledTransaction
    ) {
      return NextResponse.json(
        {
          error:
            "لا يمكن تعديل طلب يحتوي على حركة مالية مسوّاة",
        },
        { status: 400 }
      );
    }

    // =========================
    // جلب الكابتن الجديد
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
          error:
            "الكابتن غير موجود",
        },
        { status: 404 }
      );
    }

    // =========================
    // جلب المنتج الجديد
    // =========================

    const {
      data: producer,
      error: producerError,
    } = await supabase
      .from("Users")
      .select(
        "id, full_name, is_producer, wallet_balance"
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
          error:
            "المنتج غير موجود",
        },
        { status: 404 }
      );
    }

    const {
      weekStartText,
      weekEndText,
    } = getJordanWeek();

    // =========================
    // حساب العمولة الجديدة
    // =========================

    const commissionPercent =
      orderType === "راكب"
        ? PASSENGER_COMMISSION
        : ORDER_COMMISSION;

    const producerCommission = Number(
      (
        (amount *
          commissionPercent) /
        100
      ).toFixed(2)
    );

    const adminCommission = Number(
      (
        (amount *
          ADMIN_COMMISSION) /
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
    // تحديد الأرضية الجديدة
    // =========================

    const captainIsActive =
      captain.status === true ||
      captain.status === "true" ||
      captain.status === 1 ||
      captain.status === "1";

    let floorApplied = false;

    if (captainIsActive) {
      const {
        data: floorRows,
        error: floorError,
      } = await supabase
        .from(
          "BalanceTransactions"
        )
        .select(
          "id, order_id, wallet_deducted"
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
        .eq(
          "is_settled",
          false
        )
        .eq(
          "wallet_deducted",
          true
        )
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

      floorApplied =
        !floorRows ||
        floorRows.length === 0;
    }

    const captainDeduction =
      Number(
        (
          producerCommission +
          (floorApplied
            ? FLOOR_AMOUNT
            : 0)
        ).toFixed(2)
      );

    // =========================
    // عكس الحركات القديمة
    // =========================

    for (
      const transaction
      of oldTransactions ?? []
    ) {
      const amountToReverse =
        Number(
          transaction.amount
        );

      if (
        !Number.isFinite(
          amountToReverse
        ) ||
        amountToReverse <= 0
      ) {
        continue;
      }

      if (
        transaction.type ===
        "debit"
      ) {
        const {
          error,
        } = await supabase.rpc(
          "deduct_wallet_balance",
          {
            p_user_id:
              transaction.user_id,
            p_amount:
              -amountToReverse,
          }
        );

        if (error) {
          throw new Error(
            `فشل عكس حركة الكابتن: ${error.message}`
          );
        }
      }

      if (
        transaction.type ===
        "credit"
      ) {
        const {
          error,
        } = await supabase.rpc(
          "add_wallet_balance",
          {
            p_user_id:
              transaction.user_id,
            p_amount:
              -amountToReverse,
          }
        );

        if (error) {
          throw new Error(
            `فشل عكس حركة المنتج: ${error.message}`
          );
        }
      }
    }

    // =========================
    // تسجيل الحركات العكسية
    // =========================

    const reversalTransactions =
      (
        oldTransactions ?? []
      ).map(
        (transaction) => ({
          user_id:
            transaction.user_id,

          order_id:
            orderId,

          type:
            transaction.type ===
            "debit"
              ? "credit"
              : "debit",

          amount:
            Number(
              transaction.amount
            ),

          description:
            `عكس تعديل الطلب #${orderId} - ${
              transaction.description ??
              ""
            }`,

          week_start:
            transaction.week_start,

          week_end:
            transaction.week_end,

          is_settled:
            false,

          wallet_deducted:
            true,
        })
      );

    if (
      reversalTransactions.length >
      0
    ) {
      const {
        error,
      } = await supabase
        .from(
          "BalanceTransactions"
        )
        .insert(
          reversalTransactions
        );

      if (error) {
        throw new Error(
          `فشل تسجيل الحركات العكسية: ${error.message}`
        );
      }
    }

    // =========================
    // تطبيق الحركات الجديدة
    // =========================

    const newTransactions: any[] =
      [];

    if (floorApplied) {
      newTransactions.push({
        user_id:
          captainId,

        order_id:
          orderId,

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
          true,
      });
    }

    newTransactions.push({
      user_id:
        captainId,

      order_id:
        orderId,

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

    newTransactions.push({
      user_id:
        producerId,

      order_id:
        orderId,

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
        true,
    });

    // =========================
    // خصم الكابتن الجديد
    // =========================

    const {
      error:
        captainWalletError,
    } = await supabase.rpc(
      "deduct_wallet_balance",
      {
        p_user_id:
          captainId,

        p_amount:
          captainDeduction,
      }
    );

    if (
      captainWalletError
    ) {
      throw new Error(
        `تعذر خصم المبلغ الجديد من الكابتن: ${captainWalletError.message}`
      );
    }

    // =========================
    // إضافة عمولة المنتج الجديد
    // =========================

    const {
      error:
        producerWalletError,
    } = await supabase.rpc(
      "add_wallet_balance",
      {
        p_user_id:
          producerId,

        p_amount:
          netProducerCommission,
      }
    );

    if (
      producerWalletError
    ) {
      throw new Error(
        `تعذر إضافة عمولة المنتج: ${producerWalletError.message}`
      );
    }

    // =========================
    // تسجيل الحركات الجديدة
    // =========================

    const {
      error:
        newTransactionsError,
    } = await supabase
      .from(
        "BalanceTransactions"
      )
      .insert(
        newTransactions
      );

    if (
      newTransactionsError
    ) {
      throw new Error(
        `تعذر تسجيل الحركات الجديدة: ${newTransactionsError.message}`
      );
    }

    // =========================
    // تحديث الطلب
    // =========================

    const {
      data: updatedOrder,
      error:
        updateError,
    } = await supabase
      .from("Orders")
      .update({
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

        captain_commission:
          producerCommission,

        admin_commission:
          adminCommission,

        net_producer_commission:
          netProducerCommission,

        captain_due:
          producerCommission,

        week_start:
          weekStartText,

        week_end:
          weekEndText,

        status:
          "completed",
      })
      .eq(
        "id",
        orderId
      )
      .select()
      .single();

    if (
      updateError ||
      !updatedOrder
    ) {
      throw new Error(
        updateError?.message ??
          "تعذر تحديث الطلب"
      );
    }

    return NextResponse.json({
      success: true,

      order:
        updatedOrder,

      message:
        "تم تعديل الطلب وعكس الحركات القديمة وتطبيق الحركات الجديدة",
    });

  } catch (error: any) {
    console.error(
      "Update order error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ??
          "حدث خطأ أثناء تعديل الطلب",
      },
      { status: 500 }
    );
  }
}