import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { error } = await supabaseServer
      .from("Users")
      .insert({
        full_name: body.full_name,
        phone: body.phone,
        login_code: body.login_code,
        vehicle_type: body.vehicle_type,
        vehicle_number: body.vehicle_number,
        status: true,
        is_admin: body.role === "admin",
        is_captain: body.role === "captain",
        is_producer: body.role === "producer",
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}