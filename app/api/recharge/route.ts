import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // التحقق من تسجيل الدخول
    const cookieStore = await cookies();
    const session = cookieStore.get("drdrive_session");

    if (!session) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    let sessionUser;

    try {
      sessionUser = JSON.parse(session.value);
    } catch {
      return NextResponse.json(
        { error: "جلسة الدخول غير صالحة" },
        { status: 401 }
      );
    }

    // قراءة البيانات
    const { amount, receipt_image } = await req.json();

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !receipt_image
    ) {
      return NextResponse.json(
        { error: "البيانات غير مكتملة أو غير صحيحة" },
        { status: 400 }
      );
    }

    // جلب بيانات المستخدم
    const { data: user, error: userError } = await supabase
      .from("Users")
      .select("id, full_name, phone")
      .eq("id", sessionUser.id)
      .single();

    if (userError || !user) {
      console.error("User error:", userError);

      return NextResponse.json(
        { error: "تعذر العثور على بيانات المستخدم" },
        { status: 404 }
      );
    }

    // =====================================================
    // منع إرسال طلب شحن جديد إذا يوجد طلب Pending
    // =====================================================

    const { data: pendingRequest, error: pendingError } =
      await supabase
        .from("RechargeRequests")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .limit(1)
        .maybeSingle();

    if (pendingError) {
      console.error("Pending check error:", pendingError);

      return NextResponse.json(
        { error: "تعذر التحقق من طلبات الشحن الحالية" },
        { status: 500 }
      );
    }

    if (pendingRequest) {
      return NextResponse.json(
        {
          error:
            "لديك طلب شحن قيد المراجعة بالفعل، يرجى الانتظار حتى تتم مراجعته.",
        },
        { status: 409 }
      );
    }

    // =====================================================
    // إنشاء طلب الشحن
    // =====================================================

    const { data: newRequest, error: insertError } = await supabase
      .from("RechargeRequests")
      .insert({
        user_id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        amount: numericAmount,
        receipt_image,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Recharge insert error:", insertError);

      return NextResponse.json(
        {
          error: "تعذر إنشاء طلب الشحن، يرجى المحاولة مرة أخرى.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      request_id: newRequest.id,
      message: "تم إرسال طلب الشحن بنجاح",
    });
  } catch (err: any) {
    console.error("Recharge API error:", err);

    return NextResponse.json(
      {
        error: err?.message || "حدث خطأ غير متوقع",
      },
      {
        status: 500,
      }
    );
  }
}