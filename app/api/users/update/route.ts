import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const id = Number(body.id);

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

    const status =
      body.status === true ||
      body.status === "true";

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return NextResponse.json(
        {
          error: "معرف المستخدم غير صحيح",
        },
        {
          status: 400,
        }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        {
          error: "يرجى إدخال اسم المستخدم",
        },
        {
          status: 400,
        }
      );
    }

    if (!loginCode) {
      return NextResponse.json(
        {
          error: "يرجى إدخال رمز الدخول",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: existingUser,
      error: existingError,
    } = await supabaseServer
      .from("Users")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        {
          error: existingError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!existingUser) {
      return NextResponse.json(
        {
          error: "المستخدم غير موجود",
        },
        {
          status: 404,
        }
      );
    }

    const {
      data: updatedUser,
      error: updateError,
    } = await supabaseServer
      .from("Users")
      .update({
        full_name: fullName,
        phone: phone || null,
        login_code: loginCode,
        vehicle_type:
          vehicleType || null,
        vehicle_number:
          vehicleNumber || null,
        status,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      console.error(
        "UPDATE USER ERROR:",
        updateError
      );

      return NextResponse.json(
        {
          error: updateError.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });

  } catch (error: any) {
    console.error(
      "UPDATE USER SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ??
          "حدث خطأ أثناء تعديل المستخدم",
      },
      {
        status: 500,
      }
    );
  }
}