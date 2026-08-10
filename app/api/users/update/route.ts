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

    const { data: existing, error: findError } =
      await supabaseServer
        .from("Users")
        .select("id, is_admin")
        .eq("id", id)
        .single();

    if (findError || !existing) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    const fullName = String(
      body.full_name ?? ""
    ).trim();

    const phone = String(
      body.phone ?? ""
    ).trim();

    const loginCode = String(
      body.login_code ?? ""
    ).trim();

    const vehicleType = String(
      body.vehicle_type ?? ""
    ).trim();

    const vehicleNumber = String(
      body.vehicle_number ?? ""
    ).trim();

    if (!fullName || !phone) {
      return NextResponse.json(
        {
          error:
            "الاسم ورقم الهاتف مطلوبان",
        },
        { status: 400 }
      );
    }

    const { error } =
      await supabaseServer
        .from("Users")
        .update({
          full_name: fullName,
          phone,
          login_code: loginCode,
          vehicle_type: vehicleType,
          vehicle_number: vehicleNumber,

          status:
            body.status === true ||
            body.status === "true" ||
            body.status === 1 ||
            body.status === "1",

          /*
           * لا نغير صلاحية الأدمن
           */
          is_admin: Boolean(
            existing.is_admin
          ),

          /*
           * كل مستخدم يتم تعديله
           * يبقى كابتن + منتج
           */
          is_captain: true,
          is_producer: true,
        })
        .eq("id", id);

    if (error) {
      console.error(
        "Update user error:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "تم تعديل بيانات المستخدم بنجاح",
    });
  } catch (error: any) {
    console.error(
      "Update user API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ??
          "حدث خطأ أثناء تعديل المستخدم",
      },
      { status: 500 }
    );
  }
}