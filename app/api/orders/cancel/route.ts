import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const changedWallets: {
    userId: number;
    type: "debit" | "credit";
    amount: number;
  }[] = [];

  let insertedReversalIds: number[] = [];
  let originalTransactionIds: number[] = [];

  try {
    // =========================
    // قراءة البيانات
    // =========================

    const body = await req.json();

    const orderId = Number(
      body.orderId
    );

    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "رقم الطلب غير صحيح",
        },
        { status: 400 }
      );
    }

    // =========================
    // جلب الطلب
    // =========================

    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("Orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (
      orderError ||
      !order
    ) {
      return NextResponse.json(
        {
          error:
            "الطلب غير موجود",
        },
        { status: 404 }
      );
    }

    // =========================
    // منع الإلغاء مرتين
    // =========================

    if (
      order.status ===
      "cancelled"
    ) {
      return NextResponse.json(
        {
          error:
            "الطلب ملغي بالفعل",
        },
        { status: 400 }
      );
    }

    // =========================
    // منع إلغاء طلب مسوّى
    // =========================

    if (
      order.is_settled === true
    ) {
      return NextResponse.json(
        {
          error:
            "لا يمكن إلغاء طلب تمت تسويته ماليًا",
        },
        { status: 400 }
      );
    }

    // =========================
    // جلب الحركات المالية
    // =========================

    const {
      data: transactions,
      error:
        transactionsError,
    } = await supabase
      .from(
        "BalanceTransactions"
      )
      .select(`
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
      `)
      .eq(
        "order_id",
        orderId
      )
      .eq(
        "wallet_deducted",
        true
      )
      .order("id", {
        ascending: true,
      });

    if (
      transactionsError
    ) {
      return NextResponse.json(
        {
          error:
            transactionsError.message,
        },
        { status: 500 }
      );
    }

    // =========================
    // منع إلغاء طلب عليه تسوية
    // =========================

    const settledTransaction =
      (
        transactions ?? []
      ).find(
        (transaction) =>
          transaction.is_settled ===
          true
      );

    if (
      settledTransaction
    ) {
      return NextResponse.json(
        {
          error:
            "لا يمكن إلغاء طلب تمت تسويته ماليًا",
        },
        { status: 400 }
      );
    }

    // =========================
    // حفظ IDs الحركات الأصلية
    // =========================

    originalTransactionIds =
      (transactions ?? []).map(
        (transaction) =>
          Number(transaction.id)
      );

    // =========================
    // عكس الحركات المالية
    // =========================

    for (
      const transaction of
        transactions ?? []
    ) {
      const userId =
        Number(
          transaction.user_id
        );

      const amount =
        Number(
          transaction.amount
        );

      if (
        !Number.isInteger(
          userId
        ) ||
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) {
        throw new Error(
          "بيانات الحركة المالية غير صحيحة"
        );
      }

      // =========================
      // debit
      // كان المبلغ مخصومًا
      // نرجعه للمستخدم
      // =========================

      if (
        transaction.type ===
        "debit"
      ) {
        const {
          data: newBalance,
          error,
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

        if (
          error ||
          newBalance ===
            null ||
          newBalance ===
            undefined
        ) {
          throw new Error(
            error?.message ??
              "تعذر إرجاع المبلغ إلى المحفظة"
          );
        }

        changedWallets.push({
          userId,
          type: "debit",
          amount,
        });
      }

      // =========================
      // credit
      // كان المبلغ مضافًا
      // نخصمه لإلغاء الإضافة
      // =========================

      else if (
        transaction.type ===
        "credit"
      ) {
        const {
          data: newBalance,
          error,
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

        if (
          error ||
          newBalance ===
            null ||
          newBalance ===
            undefined
        ) {
          throw new Error(
            error?.message ??
              "تعذر عكس عمولة المنتج"
          );
        }

        changedWallets.push({
          userId,
          type: "credit",
          amount,
        });
      }

      else {
        throw new Error(
          `نوع حركة غير معروف: ${transaction.type}`
        );
      }
    }

    // =========================
    // إنشاء الحركات العكسية
    // =========================

    const reversalTransactions =
      (
        transactions ?? []
      ).map(
        (transaction) => ({
          user_id:
            transaction.user_id,

          order_id:
            orderId,

          type:
            transaction.type ===
            "debit"
              ? "credit"
              : "debit",

          amount:
            Number(
              transaction.amount
            ),

          description:
            `عكس إلغاء الطلب #${orderId} - ${
              transaction.description ??
              ""
            }`,

          week_start:
            transaction.week_start,

          week_end:
            transaction.week_end,

          is_settled:
            false,

          wallet_deducted:
            true,
        })
      );

    if (
      reversalTransactions.length >
      0
    ) {
      const {
        data:
          insertedReversals,
        error:
          reversalError,
      } = await supabase
        .from(
          "BalanceTransactions"
        )
        .insert(
          reversalTransactions
        )
        .select("id");

      if (
        reversalError ||
        !insertedReversals
      ) {
        throw new Error(
          reversalError?.message ??
            "تعذر تسجيل الحركات العكسية"
        );
      }

      insertedReversalIds =
        insertedReversals.map(
          (row) =>
            Number(row.id)
        );
    }

    // =========================
    // تعطيل الحركات الأصلية
    // =========================

    if (
      originalTransactionIds.length >
      0
    ) {
      const {
        error:
          originalUpdateError,
      } = await supabase
        .from(
          "BalanceTransactions"
        )
        .update({
          wallet_deducted:
            false,
        })
        .in(
          "id",
          originalTransactionIds
        );

      if (
        originalUpdateError
      ) {
        throw new Error(
          `تعذر تحديث الحركات الأصلية: ${originalUpdateError.message}`
        );
      }
    }

    // =========================
    // تحويل الطلب إلى cancelled
    // =========================

    const {
      data:
        cancelledOrder,
      error:
        cancelError,
    } = await supabase
      .from("Orders")
      .update({
        status:
          "cancelled",
      })
      .eq(
        "id",
        orderId
      )
      .select()
      .single();

    if (
      cancelError ||
      !cancelledOrder
    ) {
      throw new Error(
        cancelError?.message ??
          "تعذر إلغاء الطلب"
      );
    }

    // =========================
    // النجاح
    // =========================

    return NextResponse.json({
      success:
        true,

      orderId,

      status:
        "cancelled",

      message:
        "تم إلغاء الطلب وعكس الحركات المالية",
    });

  } catch (error: any) {
    console.error(
      "CANCEL ORDER ERROR:",
      error
    );

    // =========================
    // حذف الحركات العكسية
    // =========================

    if (
      insertedReversalIds.length >
      0
    ) {
      await supabase
        .from(
          "BalanceTransactions"
        )
        .delete()
        .in(
          "id",
          insertedReversalIds
        );
    }

    // =========================
    // إعادة المحافظ
    // =========================

    for (
      const change of
        changedWallets
    ) {
      try {
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
        } else {
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
          "Wallet rollback error:",
          rollbackError
        );
      }
    }

    // =========================
    // إعادة الحركات الأصلية
    // =========================

    if (
      originalTransactionIds.length >
      0
    ) {
      await supabase
        .from(
          "BalanceTransactions"
        )
        .update({
          wallet_deducted:
            true,
        })
        .in(
          "id",
          originalTransactionIds
        );
    }

    return NextResponse.json(
      {
        error:
          error?.message ??
          "حدث خطأ أثناء إلغاء الطلب",
      },
      { status: 500 }
    );
  }
}