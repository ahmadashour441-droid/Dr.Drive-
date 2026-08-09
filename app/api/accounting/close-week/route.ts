import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

  const weekStart =
    current.toISOString().split("T")[0];

  current.setUTCDate(
    current.getUTCDate() + 6
  );

  const weekEnd =
    current.toISOString().split("T")[0];

  return {
    weekStart,
    weekEnd,
  };
}

export async function POST() {
  try {
    const {
      weekStart,
      weekEnd,
    } = getJordanWeek();

    /*
     * ==========================================
     * 1) إغلاق الحركات المالية
     * ==========================================
     *
     * نستخدم week_start فقط حتى نضمن إغلاق
     * جميع حركات الأسبوع الحالي.
     */

    const {
      data: currentTransactions,
      error: transactionFetchError,
    } = await supabase
      .from("BalanceTransactions")
      .select("id")
      .eq("is_settled", false)
      .eq("week_start", weekStart);

    if (transactionFetchError) {
      return NextResponse.json(
        {
          error:
            transactionFetchError.message,
        },
        { status: 500 }
      );
    }

    let transactionsClosed = 0;

    if (
      currentTransactions &&
      currentTransactions.length > 0
    ) {
      const transactionIds =
        currentTransactions.map(
          (transaction) =>
            transaction.id
        );

      const {
        error: transactionUpdateError,
      } = await supabase
        .from("BalanceTransactions")
        .update({
          is_settled: true,
        })
        .in(
          "id",
          transactionIds
        );

      if (transactionUpdateError) {
        return NextResponse.json(
          {
            error:
              transactionUpdateError.message,
          },
          { status: 500 }
        );
      }

      transactionsClosed =
        currentTransactions.length;
    }

    /*
     * ==========================================
     * 2) إغلاق الطلبات
     * ==========================================
     */

    const {
      data: currentOrders,
      error: orderFetchError,
    } = await supabase
      .from("Orders")
      .select("id")
      .eq("is_settled", false)
      .eq("week_start", weekStart);

    if (orderFetchError) {
      return NextResponse.json(
        {
          error:
            orderFetchError.message,
        },
        { status: 500 }
      );
    }

    let ordersClosed = 0;

    if (
      currentOrders &&
      currentOrders.length > 0
    ) {
      const orderIds =
        currentOrders.map(
          (order) => order.id
        );

      const {
        error: orderUpdateError,
      } = await supabase
        .from("Orders")
        .update({
          is_settled: true,
        })
        .in(
          "id",
          orderIds
        );

      if (orderUpdateError) {
        return NextResponse.json(
          {
            error:
              orderUpdateError.message,
          },
          { status: 500 }
        );
      }

      ordersClosed =
        currentOrders.length;
    }

    /*
     * ==========================================
     * مهم جدًا
     * ==========================================
     *
     * لا نلمس wallet_balance.
     *
     * لا نرجع أي مبلغ.
     *
     * لا نغير العمولة.
     *
     * لا نغير الأرباح.
     *
     * فقط نغلق طلبات وحركات الأسبوع.
     *
     * بعد الإغلاق، create-order يبحث عن
     * أرضية غير مغلقة.
     *
     * لذلك أول طلب جديد سيأخذ 1 JD أرضية.
     */

    return NextResponse.json({
      success: true,
      weekStart,
      weekEnd,
      transactionsClosed,
      ordersClosed,
      walletChanged: false,
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.message ??
          "تعذر إغلاق الأسبوع",
      },
      { status: 500 }
    );
  }
}