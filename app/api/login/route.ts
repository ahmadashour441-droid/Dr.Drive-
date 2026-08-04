import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "بيانات ناقصة" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .eq("phone", phone.trim())
      .eq("login_code", code.trim())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "رقم الهاتف أو كود الدخول غير صحيح" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: data.id,
        full_name: data.full_name,
        is_admin: data.is_admin,
        is_captain: data.is_captain,
        is_producer: data.is_producer,
      },
    });

    response.cookies.set({
      name: "drdrive_session",
      value: JSON.stringify({
        id: data.id,
        full_name: data.full_name,
        is_admin: data.is_admin,
        is_captain: data.is_captain,
        is_producer: data.is_producer,
      }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}