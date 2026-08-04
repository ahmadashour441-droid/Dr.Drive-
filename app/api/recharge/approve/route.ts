import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  console.log("APPROVE API CALLED");
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
          error: "تم قبول الطلب مسبقاً",
        },
        {
          status: 400,
        }
      );
    }

    const { data: user } =
      await supabase
        .from("Users")
        .select("wallet_balance")
        .eq("id", request.user_id)
        .single();

    const walletResult = await supabase
  .from("Users")
  .update({
    wallet_balance:
      Number(user?.wallet_balance ?? 0) +
      Number(request.amount),
  })
  .eq("id", request.user_id);

console.log("Wallet:", walletResult);

const trxResult = await supabase
  .from("BalanceTransactions")
  .insert({
    user_id: request.user_id,
    order_id: null,
    type: "credit",
    amount: request.amount,
    description: "شحن رصيد",
    is_settled: false,
  });

console.log("Transaction:", trxResult);

const requestResult = await supabase
  .from("RechargeRequests")
  .update({
    status: "approved",
  })
  .eq("id", requestId);

console.log("Recharge:", requestResult);

    return NextResponse.json({
      success: true,
    });

  } catch (err: any) {

    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );

  }
}