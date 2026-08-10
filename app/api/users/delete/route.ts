import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = Number(body.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: "معرف المستخدم غير صحيح" },
        { status: 400 }
      );
    }

    const { data: existing, error: findError } = await supabaseServer
      .from("Users")
      .select("id, full_name")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      return NextResponse.json(
        { error: findError.message },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    // لا نحذف طلبات أو حركات مالية مرتبطة بالمستخدم.
    // إذا كان لديه بيانات محاسبية، نرجع رسالة واضحة بدل تخريب السجلات.
    const { count: transactionCount, error: transactionCheckError } =
      await supabaseServer
        .from("BalanceTransactions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", id);

    if (transactionCheckError) {
      return NextResponse.json(
        { error: transactionCheckError.message },
        { status: 500 }
      );
    }

    const { count: orderCount, error: orderCheckError } =
      await supabaseServer
        .from("Orders")
        .select("id", { count: "exact", head: true })
        .or(`captain_id.eq.${id},producer_id.eq.${id}`);

    if (orderCheckError) {
      return NextResponse.json(
        { error: orderCheckError.message },
        { status: 500 }
      );
    }

    if ((transactionCount ?? 0) > 0 || (orderCount ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            "لا يمكن حذف هذا المستخدم لأنه مرتبط بطلبات أو حركات مالية محفوظة. يمكنك إيقافه بدل حذفه.",
        },
        { status: 409 }
      );
    }

    const { data: deleted, error } = await supabaseServer
      .from("Users")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("DELETE USER ERROR:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!deleted) {
      return NextResponse.json(
        { error: "لم يتم حذف المستخدم" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE USER SERVER ERROR:", error);
    return NextResponse.json(
      { error: error?.message ?? "حدث خطأ أثناء حذف المستخدم" },
      { status: 500 }
    );
  }
}