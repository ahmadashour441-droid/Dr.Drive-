import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {

    const { requestId } = await req.json();

    const { data: request, error } =
      await supabase
        .from("RechargeRequests")
        .select("*")
        .eq("id", requestId)
        .single();

    if (error || !request) {
      return NextResponse.json(
        {
          error: "الطلب غير موجود",
        },
        {
          status: 404,
        }
      );
    }

    if (request.status === "approved") {
      return NextResponse.json(
        {
          error: "لا يمكن رفض طلب تم قبوله",
        },
        {
          status: 400,
        }
      );
    }

    if (request.status === "rejected") {
      return NextResponse.json(
        {
          error: "تم رفض الطلب مسبقاً",
        },
        {
          status: 400,
        }
      );
    }

    const { error: updateError } =
      await supabase
        .from("RechargeRequests")
        .update({
          status: "rejected",
        })
        .eq("id", requestId);

    if (updateError) {
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