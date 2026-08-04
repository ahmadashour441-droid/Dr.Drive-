import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        {
          error: "معرف المستخدم غير موجود",
        },
        {
          status: 400,
        }
      );
    }

    const { error } = await supabase
  .from("Users")
  .delete()
  .eq("id", id);

console.log("DELETE ERROR:", error);

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
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
        error: err.message ?? "حدث خطأ",
      },
      {
        status: 500,
      }
    );

  }
}