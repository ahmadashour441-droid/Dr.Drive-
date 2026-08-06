import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    console.log("API RECHARGE CALLED");
  try {

    const cookieStore = await cookies();

    const session =
      cookieStore.get("drdrive_session");

    if (!session) {
      return NextResponse.json(
        {
          error: "يجب تسجيل الدخول",
        },
        {
          status: 401,
        }
      );
    }

    const user = JSON.parse(session.value);

    const body = await req.json();

    const {
      amount,
      receipt_image,
    } = body;
console.log(
  "SERVICE KEY EXISTS:",
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
);
    const { data, error } = await supabase
  .from("RechargeRequests")
  .insert({
    user_id: user.id,
    full_name: user.full_name,
    phone: user.phone,
    amount,
    receipt_image,
    status: "pending",
  })
  .select();

console.log("DATA:", data);
console.log("ERROR:", error);

    if (error) {
  console.error("Recharge Error:", error);

  return NextResponse.json(
  {
    error: error.message,
    details: error,
  },
  {
    status: 500,
  }
);
}

    return NextResponse.json({
      success: true,
    });

  } catch (err: any) {

    return NextResponse.json(
      {
        error:
          err.message ??
          "حدث خطأ",
      },
      {
        status: 500,
      }
    );

  }
}