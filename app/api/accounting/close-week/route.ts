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
     * مهم جدًا:
     *
     * إغلاق الأسبوع لا يلمس:
     * Users.wallet_balance
     *
     * الرصيد يتم تغييره لحظة حدوث الشحن أو الطلب.
     *
     * هنا فقط نغلق طلبات وحركات الأسبوع الحالي.
     */

    /*
     * أولًا: نتأكد أن الحركات التي سنغلقها
     * تخص الأسبوع الحالي بالكامل.
     */
    const {
      data: currentTransactions,
      error: transactionFetchError,
    } = await supabase
      .from("BalanceTransactions")
      .select("id")
      .eq("is_settled", false)
      .eq("week_start", weekStart)
      .eq("week_end", weekEnd);

    if (transactionFetchError) {
      return NextResponse.json(
        {
          error:
            transactionFetchError.message,
        },
        { status: 500 }
      );
    }

    /*
     * ثانيًا: نغلق الحركات.
     */
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
    }

    /*
     * ثالثًا: نغلق طلبات الأسبوع نفسه.
     *
     * لا يتم تعديل amount
     * ولا captain_due
     * ولا wallet_balance.
     */
    const {
      data: currentOrders,
      error: orderFetchError,
    } = await supabase
      .from("Orders")
      .select("id")
      .eq("is_settled", false)
      .eq("week_start", weekStart)
      .eq("week_end", weekEnd);

    if (orderFetchError) {
      return NextResponse.json(
        {
          error:
            orderFetchError.message,
        },
        { status: 500 }
      );
    }

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
        .in("id", orderIds);

      if (orderUpdateError) {
        /*
         * ملاحظة:
         * لا نرجع أي مبلغ للمحفظة هنا.
         *
         * في حالة فشل تحديث الطلبات بعد تحديث
         * الحركات، لا نلمس wallet_balance.
         */
        return NextResponse.json(
          {
            error:
              orderUpdateError.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      weekStart,
      weekEnd,
      transactionsClosed:
        currentTransactions?.length ?? 0,
      ordersClosed:
        currentOrders?.length ?? 0,
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