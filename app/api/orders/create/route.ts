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

  const daysFromSunday = weekdayNumber[weekday] ?? 0;

  current.setUTCDate(
    current.getUTCDate() - daysFromSunday
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
    const body = await req.json();

    const customerName = String(body.customerName ?? "").trim();
    const customerPhone = String(body.customerPhone ?? "").trim();
    const producerId = Number(body.producerId);
    const captainId = Number(body.captainId);
    const orderType = String(body.orderType ?? "راكب");
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
        { error: "بيانات الطلب غير مكتملة أو غير صحيحة" },
        { status: 400 }
      );
    }

    const { data: captain, error: captainError } =
      await supabase
        .from("Users")
        .select("id, full_name, status, wallet_balance, is_captain")
        .eq("id", captainId)
        .single();

    if (captainError || !captain || !captain.is_captain) {
      return NextResponse.json(
        { error: "الكابتن غير موجود" },
        { status: 404 }
      );
    }

    const { data: producer, error: producerError } =
      await supabase
        .from("Users")
        .select("id, full_name, is_producer")
        .eq("id", producerId)
        .single();

    if (producerError || !producer || !producer.is_producer) {
      return NextResponse.json(
        { error: "المنتج غير موجود" },
        { status: 404 }
      );
    }

    const { weekStartText, weekEndText } =
      getJordanWeek();

    const producerPercent =
      orderType === "راكب"
        ? PASSENGER_COMMISSION
        : ORDER_COMMISSION;

    const producerCommission = Number(
      ((amount * producerPercent) / 100).toFixed(2)
    );

    const adminCommission = Number(
      ((amount * ADMIN_COMMISSION) / 100).toFixed(2)
    );

    const netProducerCommission = Number(
      (producerCommission - adminCommission).toFixed(2)
    );

    /*
     * الأرضية:
     * فقط للكابتن الفعّال، وعلى أول طلب له في الأسبوع.
     *
     * وجود حركة أرضية لنفس الكابتن ونفس week_start
     * يعني أن الأرضية احتُسبت بالفعل.
     */
    let floorApplied = false;

    if (captain.status === true) {
      const { data: floorRows, error: floorError } =
        await supabase
          .from("BalanceTransactions")
          .select("id")
          .eq("user_id", captainId)
          .eq("description", "الأرضية الأسبوعية")
          .eq("week_start", weekStartText)
          .limit(1);

      if (floorError) {
        return NextResponse.json(
          { error: floorError.message },
          { status: 500 }
        );
      }

      floorApplied = !floorRows || floorRows.length === 0;
    }

    const deduction = Number(
      (producerCommission +
        (floorApplied ? FLOOR_AMOUNT : 0)
      ).toFixed(2)
    );

    const currentWallet = Number(
      captain.wallet_balance ?? 0
    );

    const newWalletBalance = Number(
      (currentWallet - deduction).toFixed(3)
    );

    /*
     * 1) إنشاء الطلب.
     */
    const { data: order, error: orderError } =
      await supabase
        .from("Orders")
        .insert({
          customer_name: customerName,
          customer_phone: customerPhone,
          producer_id: producerId,
          captain_id: captainId,
          order_type: orderType,
          amount,
          producer_commission: producerCommission,
          admin_commission: adminCommission,
          net_producer_commission: netProducerCommission,
          captain_commission: producerCommission,
          captain_due: producerCommission,
          week_start: weekStartText,
          week_end: weekEndText,
          status: "completed",
          is_settled: false,
        })
        .select()
        .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          error:
            orderError?.message ??
            "تعذر إنشاء الطلب",
        },
        { status: 500 }
      );
    }

    /*
     * 2) تسجيل الحركات المالية.
     */
    const transactions: any[] = [];

    if (floorApplied) {
      transactions.push({
        user_id: captainId,
        order_id: null,
        type: "debit",
        amount: FLOOR_AMOUNT,
        description: "الأرضية الأسبوعية",
        week_start: weekStartText,
        week_end: weekEndText,
        is_settled: false,
      });
    }

    transactions.push({
      user_id: captainId,
      order_id: order.id,
      type: "debit",
      amount: producerCommission,
      description: `عمولة ${orderType} - المنتج: ${producer.full_name}`,
      week_start: weekStartText,
      week_end: weekEndText,
      is_settled: false,
    });

    transactions.push({
      user_id: producerId,
      order_id: order.id,
      type: "credit",
      amount: netProducerCommission,
      description: `عمولة المنتج - ${customerName}`,
      week_start: weekStartText,
      week_end: weekEndText,
      is_settled: false,
    });

    const { error: transactionError } =
      await supabase
        .from("BalanceTransactions")
        .insert(transactions);

    if (transactionError) {
      await supabase
        .from("Orders")
        .delete()
        .eq("id", order.id);

      return NextResponse.json(
        { error: transactionError.message },
        { status: 500 }
      );
    }

    /*
     * 3) تحديث محفظة الكابتن من السيرفر.
     * يسمح بالرصيد السالب.
     */
    const { error: walletError } =
      await supabase
        .from("Users")
        .update({
          wallet_balance: newWalletBalance,
        })
        .eq("id", captainId);

    if (walletError) {
      await supabase
        .from("BalanceTransactions")
        .delete()
        .eq("order_id", order.id);

      await supabase
        .from("BalanceTransactions")
        .delete()
        .eq("user_id", captainId)
        .eq("description", "الأرضية الأسبوعية")
        .eq("week_start", weekStartText)
        .eq("order_id", null);

      await supabase
        .from("Orders")
        .delete()
        .eq("id", order.id);

      return NextResponse.json(
        { error: walletError.message },
        { status: 500 }
      );
    }

    /*
     * الإدارة: قيمة العمولة تُحفظ داخل الطلب كـ admin_commission.
     * لا يوجد في الجداول الحالية التي وصلتنا معرف مستخدم إداري
     * واضح يمكن إضافة حركة له، لذلك لا نخمن حسابًا إداريًا.
     */
    return NextResponse.json({
      success: true,
      orderId: order.id,
      producerCommission,
      adminCommission,
      netProducerCommission,
      floorApplied,
      deduction,
      walletBalance: newWalletBalance,
      weekStart: weekStartText,
      weekEnd: weekEndText,
    });
  } catch (error: any) {
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