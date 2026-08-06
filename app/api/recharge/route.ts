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

    const sessionUser = JSON.parse(session.value);

    // قراءة البيانات القادمة من الصفحة
    const { amount, receipt_image } = await req.json();

    if (!amount || !receipt_image) {
      return NextResponse.json(
        { error: "البيانات غير مكتملة" },
        { status: 400 }
      );
    }

    // جلب بيانات المستخدم من جدول Users
    const { data: user, error: userError } = await supabase
      .from("Users")
      .select("id, full_name, phone")
      .eq("id", sessionUser.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "تعذر العثور على بيانات المستخدم" },
        { status: 404 }
      );
    }

    // حفظ طلب الشحن
    const { error: insertError } = await supabase
      .from("RechargeRequests")
      .insert({
        user_id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        amount: Number(amount),
        receipt_image,
        status: "pending",
      });

    if (insertError) {
      console.error(insertError);

      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم إرسال طلب الشحن بنجاح",
    });

  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        error: err.message || "حدث خطأ غير متوقع",
      },
      {
        status: 500,
      }
    );
  }
}