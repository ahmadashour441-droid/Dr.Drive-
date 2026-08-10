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
  let oldOrder: any = null;

  const reversedTransactions: any[] = [];
  let newTransactionIds: number[] = [];

  const captainWalletReversals: {
    userId: number;
    amount: number;
  }[] = [];

  const producerWalletReversals: {
    userId: number;
    amount: number;
  }[] = [];

  let newCaptainId: number | null = null;
  let newProducerId: number | null = null;

  let newCaptainDeduction = 0;
  let newProducerCredit = 0;

  try {
    const body = await req.json();

    const orderId = Number(body.orderId);

    // اسم ورقم العميل اختياريان
    const customerName =
      String(body.customerName ?? "عميل").trim() ||
      "عميل";

    const customerPhone =
      String(body.customerPhone ?? "").trim();

    const producerId = Number(body.producerId);
    const captainId = Number(body.captainId);

    const orderType = String(
      body.orderType ?? ""
    ).trim();

    const amount = Number(body.amount);

    // =========================
    // التحقق
    // =========================

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return NextResponse.json(
        {
          error: "رقم الطلب غير صحيح",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(producerId) ||
      producerId <= 0
    ) {
      return NextResponse.json(
        {
          error: "المنتج غير صحيح",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(captainId) ||
      captainId <= 0
    ) {
      return NextResponse.json(
        {
          error: "الكابتن غير صحيح",
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

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error: "قيمة الطلب غير صحيحة",
        },
        { status: 400 }
      );
    }

    // =========================
    // جلب الطلب القديم
    // =========================

    const {
      data,
      error: orderError,
    } = await supabase
      .from("Orders")
      .select("*")
      .eq("id", orderId)
      .single();

    oldOrder = data;

    if (orderError || !oldOrder) {
      return NextResponse.json(
        {
          error: "الطلب غير موجود",
        },
        { status: 404 }
      );
    }

    // =========================
    // منع تعديل الملغي
    // =========================

    if (oldOrder.status === "cancelled") {
      return NextResponse.json(
        {
          error: "لا يمكن تعديل طلب ملغي",
        },
        { status: 400 }
      );
    }

    // =========================
    // منع تعديل المسوّى
    // =========================

    if (oldOrder.is_settled === true) {
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
      error: transactionsError,
    } = await supabase
      .from("BalanceTransactions")
      .select("*")
      .eq("order_id", orderId)
      .eq("wallet_deducted", true)
      .order("id", {
        ascending: true,
      });

    if (transactionsError) {
      return NextResponse.json(
        {
          error: transactionsError.message,
        },
        { status: 500 }
      );
    }

    // =========================
    // منع تعديل حركات مسوّاة
    // =========================

    const settledTransaction =
      (oldTransactions ?? []).find(
        (transaction) =>
          transaction.is_settled === true
      );

    if (settledTransaction) {
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
          error: "الكابتن غير موجود",
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
          error: "المنتج غير موجود",
        },
        { status: 404 }
      );
    }

    newCaptainId = captainId;
    newProducerId = producerId;

    // =========================
    // الأسبوع
    // =========================

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

    const netProducerCommission = Number(
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

    // =========================================================
    // 1) عكس الحركات المالية القديمة
    // =========================================================

    for (
      const transaction of oldTransactions ?? []
    ) {
      const transactionAmount = Number(
        transaction.amount ?? 0
      );

      if (
        !Number.isFinite(transactionAmount) ||
        transactionAmount <= 0
      ) {
        continue;
      }

      const userId = Number(
        transaction.user_id
      );

      if (!Number.isInteger(userId)) {
        continue;
      }

      // الحركة القديمة Debit
      if (transaction.type === "debit") {
        const {
          error: reverseError,
        } = await supabase.rpc(
          "add_wallet_balance",
          {
            p_user_id: userId,
            p_amount: transactionAmount,
          }
        );

        if (reverseError) {
          throw new Error(
            `فشل عكس حركة الخصم القديمة: ${reverseError.message}`
          );
        }

        captainWalletReversals.push({
          userId,
          amount: transactionAmount,
        });
      }

      // الحركة القديمة Credit
      if (transaction.type === "credit") {
        const {
          error: reverseError,
        } = await supabase.rpc(
          "deduct_wallet_balance",
          {
            p_user_id: userId,
            p_amount: transactionAmount,
          }
        );

        if (reverseError) {
          throw new Error(
            `فشل عكس حركة الإضافة القديمة: ${reverseError.message}`
          );
        }

        producerWalletReversals.push({
          userId,
          amount: transactionAmount,
        });
      }

      // تسجيل حركة العكس
      reversedTransactions.push({
        user_id: userId,
        order_id: orderId,
        type:
          transaction.type === "debit"
            ? "credit"
            : "debit",
        amount: transactionAmount,
        description:
          `عكس حركة تعديل الطلب #${orderId}`,
        week_start: transaction.week_start,
        week_end: transaction.week_end,
        is_settled: false,
        wallet_deducted: true,
      });

      // تعطيل الحركة القديمة
      const {
        error: oldTransactionUpdateError,
      } = await supabase
        .from("BalanceTransactions")
        .update({
          wallet_deducted: false,
        })
        .eq("id", transaction.id);

      if (oldTransactionUpdateError) {
        throw new Error(
          `فشل تحديث الحركة القديمة: ${oldTransactionUpdateError.message}`
        );
      }
    }

    // =========================
    // حفظ حركات العكس
    // =========================

    if (reversedTransactions.length > 0) {
      const {
        error: reversalInsertError,
      } = await supabase
        .from("BalanceTransactions")
        .insert(reversedTransactions);

      if (reversalInsertError) {
        throw new Error(
          `فشل تسجيل الحركات العكسية: ${reversalInsertError.message}`
        );
      }
    }

    // =========================================================
    // 2) فحص الأرضية للكابتن الجديد
    // =========================================================

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
        .eq("user_id", captainId)
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
        .eq("is_settled", false)
        .eq("wallet_deducted", true)
        .order("id", {
          ascending: true,
        })
        .limit(1);

      if (floorError) {
        throw new Error(
          `فشل فحص الأرضية: ${floorError.message}`
        );
      }

      if (
        floorRows &&
        floorRows.length > 0
      ) {
        existingFloorId = Number(
          floorRows[0].id
        );

        floorApplied = false;
      } else {
        floorApplied = true;
      }
    }

    // =========================
    // إجمالي خصم الكابتن
    // =========================

    const captainDeduction = Number(
      (
        producerCommission +
        (floorApplied
          ? FLOOR_AMOUNT
          : 0)
      ).toFixed(2)
    );

    newCaptainDeduction =
      captainDeduction;

    newProducerCredit =
      netProducerCommission;

    // =========================================================
    // 3) خصم العمولة + الأرضية من الكابتن الجديد
    // =========================================================

    const {
      data: newCaptainWallet,
      error: newCaptainWalletError,
    } = await supabase.rpc(
      "deduct_wallet_balance",
      {
        p_user_id: captainId,
        p_amount: captainDeduction,
      }
    );

    if (newCaptainWalletError) {
      throw new Error(
        `تعذر خصم العمولة من محفظة الكابتن: ${newCaptainWalletError.message}`
      );
    }

    // =========================================================
    // 4) إضافة صافي العمولة للمنتج الجديد
    // =========================================================

    const {
      data: newProducerWallet,
      error: newProducerWalletError,
    } = await supabase.rpc(
      "add_wallet_balance",
      {
        p_user_id: producerId,
        p_amount:
          netProducerCommission,
      }
    );

    if (newProducerWalletError) {
      throw new Error(
        `تعذر إضافة عمولة المنتج: ${newProducerWalletError.message}`
      );
    }

    // =========================================================
    // 5) إنشاء الحركات الجديدة
    // =========================================================

    const newTransactions: any[] = [];

    // الأرضية
    if (floorApplied) {
      newTransactions.push({
        user_id: captainId,
        order_id: orderId,
        type: "debit",
        amount: FLOOR_AMOUNT,
        description:
          "الأرضية الأسبوعية",
        week_start: weekStartText,
        week_end: weekEndText,
        is_settled: false,
        wallet_deducted: true,
      });
    }

    // عمولة الكابتن
    newTransactions.push({
      user_id: captainId,
      order_id: orderId,
      type: "debit",
      amount: producerCommission,
      description:
        `عمولة ${orderType} - المنتج: ${producer.full_name}`,
      week_start: weekStartText,
      week_end: weekEndText,
      is_settled: false,
      wallet_deducted: true,
    });

    // عمولة المنتج
    newTransactions.push({
      user_id: producerId,
      order_id: orderId,
      type: "credit",
      amount: netProducerCommission,
      description:
        `عمولة المنتج - ${customerName}`,
      week_start: weekStartText,
      week_end: weekEndText,
      is_settled: false,
      wallet_deducted: true,
    });

    const {
      data: insertedNewTransactions,
      error: newTransactionsError,
    } = await supabase
      .from("BalanceTransactions")
      .insert(newTransactions)
      .select("id");

    if (
      newTransactionsError ||
      !insertedNewTransactions
    ) {
      throw new Error(
        newTransactionsError?.message ??
          "فشل حفظ الحركات المالية الجديدة"
      );
    }

    newTransactionIds =
      insertedNewTransactions.map(
        (row) => Number(row.id)
      );

    // =========================================================
    // 6) تحديث الطلب
    // =========================================================

    const {
      data: updatedOrder,
      error: updateError,
    } = await supabase
      .from("Orders")
      .update({
        customer_name: customerName,
        customer_phone: customerPhone,
        producer_id: producerId,
        captain_id: captainId,
        order_type: orderType,
        amount: amount,
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
        status: "completed",
        is_settled: false,
      })
      .eq("id", orderId)
      .select()
      .single();

    if (
      updateError ||
      !updatedOrder
    ) {
      throw new Error(
        updateError?.message ??
          "فشل تحديث الطلب"
      );
    }

    // =========================================================
    // النتيجة
    // =========================================================

    return NextResponse.json({
      success: true,

      message:
        "تم تعديل الطلب وعكس الحركات القديمة وتطبيق الحسابات الجديدة",

      order: updatedOrder,

      producerCommission,

      adminCommission,

      netProducerCommission,

      floorApplied,

      captainDeduction,

      walletBalance:
        Number(newCaptainWallet),

      producerWalletBalance:
        Number(newProducerWallet),
    });

  } catch (error: any) {
    console.error(
      "UPDATE ORDER ERROR:",
      error
    );

    // تنظيف الحركات الجديدة
    if (
      newTransactionIds.length > 0
    ) {
      await supabase
        .from("BalanceTransactions")
        .delete()
        .in(
          "id",
          newTransactionIds
        );
    }

    // عكس تأثير الكابتن الجديد
    if (
      newCaptainId !== null &&
      newCaptainDeduction > 0
    ) {
      await supabase.rpc(
        "add_wallet_balance",
        {
          p_user_id:
            newCaptainId,
          p_amount:
            newCaptainDeduction,
        }
      );
    }

    // عكس تأثير المنتج الجديد
    if (
      newProducerId !== null &&
      newProducerCredit > 0
    ) {
      await supabase.rpc(
        "deduct_wallet_balance",
        {
          p_user_id:
            newProducerId,
          p_amount:
            newProducerCredit,
        }
      );
    }

    // إعادة الحركات القديمة
    for (
      const reversal of
        captainWalletReversals
    ) {
      await supabase.rpc(
        "deduct_wallet_balance",
        {
          p_user_id:
            reversal.userId,
          p_amount:
            reversal.amount,
        }
      );
    }

    for (
      const reversal of
        producerWalletReversals
    ) {
      await supabase.rpc(
        "add_wallet_balance",
        {
          p_user_id:
            reversal.userId,
          p_amount:
            reversal.amount,
        }
      );
    }

    // إعادة الحركات القديمة
    if (oldOrder?.id) {
      const {
        data:
          oldTransactionsToRestore,
      } = await supabase
        .from("BalanceTransactions")
        .select("id")
        .eq(
          "order_id",
          oldOrder.id
        )
        .eq(
          "wallet_deducted",
          false
        );

      if (
        oldTransactionsToRestore &&
        oldTransactionsToRestore.length >
          0
      ) {
        await supabase
          .from(
            "BalanceTransactions"
          )
          .update({
            wallet_deducted: true,
          })
          .in(
            "id",
            oldTransactionsToRestore.map(
              (row) => row.id
            )
          );
      }
    }

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