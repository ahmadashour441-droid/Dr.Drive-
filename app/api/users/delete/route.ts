import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const userId = Number(body.userId);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
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

    /*
     * نتأكد أولاً أن المستخدم موجود
     */

    const {
      data: user,
      error: userError,
    } = await supabase
      .from("Users")
      .select(
        "id, full_name, is_admin"
      )
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "المستخدم غير موجود",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * حماية حساب المدير
     */

    if (user.is_admin) {
      return NextResponse.json(
        {
          error:
            "لا يمكن حذف حساب المدير",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * فحص الطلبات غير المغلقة.
     *
     * المستخدم قد يكون:
     * - كابتن
     * - منتج
     */

    const {
      data: openOrders,
      error: ordersError,
    } = await supabase
      .from("Orders")
      .select(
        "id, captain_id, producer_id"
      )
      .eq("is_settled", false)
      .or(
        `captain_id.eq.${userId},producer_id.eq.${userId}`
      );

    if (ordersError) {
      throw ordersError;
    }

    if (
      openOrders &&
      openOrders.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "لا يمكن حذف المستخدم لأنه لديه طلبات غير مغلقة. قم بتسوية أو إغلاق الأسبوع أولاً.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * فحص الحركات المالية غير المغلقة.
     */

    const {
      data: openTransactions,
      error: transactionsError,
    } = await supabase
      .from("BalanceTransactions")
      .select("id")
      .eq("user_id", userId)
      .eq("is_settled", false);

    if (transactionsError) {
      throw transactionsError;
    }

    if (
      openTransactions &&
      openTransactions.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "لا يمكن حذف المستخدم لأنه لديه حركات مالية غير مغلقة.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * حذف المستخدم فقط.
     *
     * الطلبات والحركات المغلقة تبقى محفوظة.
     *
     * بسبب ON DELETE SET NULL
     * سيتم فقط إزالة ارتباط المستخدم
     * من السجلات القديمة.
     */

    const {
      error: deleteError,
    } = await supabase
      .from("Users")
      .delete()
      .eq("id", userId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,

      message:
        "تم حذف المستخدم بنجاح مع الاحتفاظ بالسجل المالي والطلبات المغلقة",
    });

  } catch (error: any) {
    console.error(
      "DELETE USER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ??
          "حدث خطأ أثناء حذف المستخدم",
      },
      {
        status: 500,
      }
    );
  }
}