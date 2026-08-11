import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ==================================================
// SUPABASE
// ==================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==================================================
// BOT AUTH
// ==================================================

function checkBotKey(req: NextRequest) {
  const expectedKey =
    process.env.WHATSAPP_BOT_KEY;

  const receivedKey =
    req.headers.get("x-bot-key");

  if (!expectedKey) {
    return false;
  }

  if (!receivedKey) {
    return false;
  }

  return receivedKey === expectedKey;
}

// ==================================================
// POST
// ==================================================

export async function POST(
  req: NextRequest
) {
  let orderId: number | null = null;

  const appliedWalletChanges: Array<{
    userId: number;
    type: "debit" | "credit";
    amount: number;
  }> = [];

  let insertedReversalIds: number[] = [];

  try {
    // ==================================================
    // SECURITY
    // ==================================================

    if (!checkBotKey(req)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // ==================================================
    // BODY
    // ==================================================

    const body = await req.json();

    orderId = Number(body?.orderId);

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "رقم الطلب غير صحيح",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // READ ORDER
    // ==================================================

    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("Orders")
      .select(
        `
        id,
        producer_id,
        captain_id,
        order_type,
        amount,
        producer_commission,
        captain_commission,
        admin_commission,
        net_producer_commission,
        captain_due,
        status
        `
      )
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      console.error(
        "❌ فشل قراءة الطلب:",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          error: orderError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error:
            "الطلب غير موجود",
        },
        {
          status: 404,
        }
      );
    }

    // ==================================================
    // ALREADY CANCELLED
    // ==================================================

    if (
      order.status === "cancelled"
    ) {
      return NextResponse.json(
        {
          success: true,
          alreadyCancelled: true,
          orderId: order.id,
          status: "cancelled",
          message:
            "الطلب ملغي مسبقًا",
        },
        {
          status: 200,
        }
      );
    }

    // ==================================================
    // MUST HAVE CAPTAIN
    // ==================================================

    if (!order.captain_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "الطلب غير مرتبط بكابتن",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // MUST BE COMPLETED
    // ==================================================

    if (
      order.status !== "completed"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "الطلب ليس في حالة تسمح بالإلغاء",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // READ FINANCIAL TRANSACTIONS
    // ==================================================

    const {
      data: transactions,
      error:
        transactionsError,
    } = await supabase
      .from("BalanceTransactions")
      .select(
        `
        id,
        user_id,
        order_id,
        type,
        amount,
        description,
        week_start,
        week_end,
        is_settled,
        wallet_deducted
        `
      )
      .eq(
        "order_id",
        orderId
      );

    if (transactionsError) {
      console.error(
        "❌ فشل قراءة الحركات المالية:",
        transactionsError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            transactionsError.message,
        },
        {
          status: 500,
        }
      );
    }

    // ==================================================
    // VALIDATE TRANSACTIONS
    // ==================================================

    const validTransactions =
      (transactions ?? []).filter(
        (transaction) => {
          const amount =
            Number(
              transaction.amount
            );

          return (
            Number.isFinite(amount) &&
            amount > 0
          );
        }
      );

    // ==================================================
    // CREATE REVERSAL TRANSACTIONS
    // ==================================================

    const reversalTransactions =
      validTransactions.map(
        (transaction) => {
          const amount =
            Number(
              transaction.amount
            );

          return {
            user_id:
              transaction.user_id,

            order_id:
              orderId,

            type:
              transaction.type ===
              "debit"
                ? "credit"
                : "debit",

            amount,

            description:
              `عكس حركة بسبب إلغاء الطلب #${orderId}`,

            week_start:
              transaction.week_start,

            week_end:
              transaction.week_end,

            is_settled:
              false,

            wallet_deducted:
              true,
          };
        }
      );

    // ==================================================
    // INSERT REVERSAL TRANSACTIONS FIRST
    // ==================================================

    if (
      reversalTransactions.length >
      0
    ) {
      const {
        data:
          insertedReversals,
        error:
          reversalInsertError,
      } =
        await supabase
          .from(
            "BalanceTransactions"
          )
          .insert(
            reversalTransactions
          )
          .select("id");

      if (
        reversalInsertError ||
        !insertedReversals
      ) {
        console.error(
          "❌ فشل تسجيل الحركات العكسية:",
          reversalInsertError
        );

        return NextResponse.json(
          {
            success: false,
            error:
              reversalInsertError?.message ??
              "تعذر تسجيل الحركات العكسية",
          },
          {
            status: 500,
          }
        );
      }

      insertedReversalIds =
        insertedReversals.map(
          (row) =>
            Number(row.id)
        );
    }

    // ==================================================
    // REVERSE WALLET BALANCES
    // ==================================================

    for (
      const transaction of
        validTransactions
    ) {
      const userId =
        Number(
          transaction.user_id
        );

      const amount =
        Number(
          transaction.amount
        );

      // ------------------------------------------
      // ORIGINAL DEBIT
      // نعيد المبلغ للمستخدم
      // ------------------------------------------

      if (
        transaction.type ===
        "debit"
      ) {
        const {
          error:
            restoreError,
        } =
          await supabase.rpc(
            "add_wallet_balance",
            {
              p_user_id:
                userId,

              p_amount:
                amount,
            }
          );

        if (restoreError) {
          console.error(
            "❌ فشل إعادة مبلغ الخصم:",
            restoreError
          );

          throw new Error(
            restoreError.message
          );
        }

        appliedWalletChanges.push({
          userId,

          type: "debit",

          amount,
        });
      }

      // ------------------------------------------
      // ORIGINAL CREDIT
      // نسحب المبلغ الذي تمت إضافته
      // ------------------------------------------

      if (
        transaction.type ===
        "credit"
      ) {
        const {
          error:
            reverseError,
        } =
          await supabase.rpc(
            "deduct_wallet_balance",
            {
              p_user_id:
                userId,

              p_amount:
                amount,
            }
          );

        if (reverseError) {
          console.error(
            "❌ فشل عكس رصيد المنتج:",
            reverseError
          );

          throw new Error(
            reverseError.message
          );
        }

        appliedWalletChanges.push({
          userId,

          type: "credit",

          amount,
        });
      }
    }

    // ==================================================
    // UPDATE ORDER TO CANCELLED
    // ==================================================

    const {
      data:
        cancelledOrder,
      error:
        cancelError,
    } =
      await supabase
        .from("Orders")
        .update({
          status:
            "cancelled",

          captain_id:
            null,

          producer_commission:
            0,

          captain_commission:
            0,

          admin_commission:
            0,

          net_producer_commission:
            0,

          captain_due:
            0,

          is_settled:
            false,

          settled_at:
            null,
        })
        .eq(
          "id",
          orderId
        )
        .eq(
          "status",
          "completed"
        )
        .select(
          `
          id,
          producer_id,
          captain_id,
          order_type,
          amount,
          producer_commission,
          captain_commission,
          admin_commission,
          net_producer_commission,
          captain_due,
          status
          `
        )
        .maybeSingle();

    if (
      cancelError ||
      !cancelledOrder
    ) {
      console.error(
        "❌ فشل تحديث حالة الطلب إلى cancelled:",
        cancelError
      );

      throw new Error(
        cancelError?.message ??
          "تعذر إلغاء الطلب"
      );
    }

    // ==================================================
    // SUCCESS
    // ==================================================

    console.log(
      "\n================================="
    );

    console.log(
      "🚫 BOT CANCEL ORDER"
    );

    console.log(
      "ORDER:",
      orderId
    );

    console.log(
      "STATUS:",
      "cancelled"
    );

    console.log(
      "REVERSED TRANSACTIONS:",
      validTransactions.length
    );

    console.log(
      "WALLET CHANGES:",
      appliedWalletChanges.length
    );

    console.log(
      "=================================\n"
    );

    return NextResponse.json(
      {
        success: true,

        orderId,

        status:
          "cancelled",

        reversedTransactions:
          validTransactions.length,

        message:
          "تم إلغاء الطلب وعكس الحركات المالية",
      },
      {
        status: 200,
      }
    );

  } catch (error: any) {
    console.error(
      "\n❌ BOT CANCEL ERROR:"
    );

    console.error(
      error
    );

    // ==================================================
    // ROLLBACK WALLET CHANGES
    // ==================================================

    for (
      let i =
        appliedWalletChanges.length -
        1;
      i >= 0;
      i--
    ) {
      const change =
        appliedWalletChanges[i];

      try {
        // إذا أعدنا debit سابقًا
        // نرجعه مرة ثانية بالخصم

        if (
          change.type ===
          "debit"
        ) {
          await supabase.rpc(
            "deduct_wallet_balance",
            {
              p_user_id:
                change.userId,

              p_amount:
                change.amount,
            }
          );
        }

        // إذا عكسنا credit بالخصم
        // نعيده مرة ثانية بالإضافة

        if (
          change.type ===
          "credit"
        ) {
          await supabase.rpc(
            "add_wallet_balance",
            {
              p_user_id:
                change.userId,

              p_amount:
                change.amount,
            }
          );
        }

      } catch (
        rollbackError
      ) {
        console.error(
          "❌ WALLET ROLLBACK ERROR:",
          rollbackError
        );
      }
    }

    // ==================================================
    // DELETE REVERSAL TRANSACTIONS
    // ==================================================

    if (
      insertedReversalIds.length >
      0
    ) {
      try {
        await supabase
          .from(
            "BalanceTransactions"
          )
          .delete()
          .in(
            "id",
            insertedReversalIds
          );
      } catch (
        transactionRollbackError
      ) {
        console.error(
          "❌ REVERSAL TRANSACTION ROLLBACK ERROR:",
          transactionRollbackError
        );
      }
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ??
          "حدث خطأ أثناء إلغاء الطلب",
      },
      {
        status: 500,
      }
    );
  }
}