import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

async function updateWithdrawalStatus(formData: FormData) {
  "use server";

  const requestId = String(
    formData.get("requestId") ?? ""
  );

  const status = String(
    formData.get("status") ?? ""
  );

  if (!requestId) {
    return;
  }

  if (
    status !== "approved" &&
    status !== "rejected"
  ) {
    return;
  }

  // =========================
  // جلب طلب السحب
  // =========================

  const {
    data: request,
    error: requestError,
  } = await supabaseServer
    .from("WithdrawalRequests")
    .select("*")
    .eq("id", requestId)
    .eq("status", "pending")
    .single();

  if (
    requestError ||
    !request
  ) {
    console.error(
      "Withdrawal request error:",
      requestError
    );

    return;
  }

  const userId = Number(
    request.user_id
  );

  const amount = Number(
    request.amount
  );

  if (
    !Number.isInteger(userId) ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    console.error(
      "Invalid withdrawal data"
    );

    return;
  }

  // =========================
  // الرفض
  // =========================

  if (status === "rejected") {
    const {
      error: rejectError,
    } = await supabaseServer
      .from("WithdrawalRequests")
      .update({
        status: "rejected",
        processed_at:
          new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("status", "pending");

    if (rejectError) {
      console.error(
        "Withdrawal rejection error:",
        rejectError
      );

      return;
    }

    revalidatePath(
      "/admin/withdrawals"
    );

    revalidatePath(
      "/admin"
    );

    revalidatePath(
      "/dashboard/accounting"
    );

    return;
  }

  // =========================
  // الموافقة
  // =========================

  const {
    data: user,
    error: userError,
  } = await supabaseServer
    .from("Users")
    .select(
      "id, full_name, wallet_balance"
    )
    .eq("id", userId)
    .single();

  if (
    userError ||
    !user
  ) {
    console.error(
      "User not found:",
      userError
    );

    return;
  }

  const walletBalance = Number(
    user.wallet_balance ?? 0
  );

  // =========================
  // التأكد من توفر الرصيد
  // =========================

  if (
    walletBalance < amount
  ) {
    console.error(
      `الرصيد غير كافٍ. الرصيد: ${walletBalance}, السحب: ${amount}`
    );

    return;
  }

  // =========================
  // خصم المحفظة
  //
  // deduct_wallet_balance
  // تقوم بـ:
  //
  // wallet_balance =
  // wallet_balance - amount
  // =========================

  const {
    data: newWalletBalance,
    error: walletError,
  } = await supabaseServer.rpc(
    "deduct_wallet_balance",
    {
      p_user_id: userId,
      p_amount: amount,
    }
  );

  if (
    walletError ||
    newWalletBalance === null ||
    newWalletBalance === undefined
  ) {
    console.error(
      "Wallet deduction error:",
      walletError
    );

    return;
  }

  const finalWalletBalance =
    Number(
      newWalletBalance
    );

  // =========================
  // تسجيل حركة السحب
  // =========================

  const {
    data: transaction,
    error:
      transactionError,
  } = await supabaseServer
    .from(
      "BalanceTransactions"
    )
    .insert({
      user_id: userId,
      order_id: null,
      type: "debit",
      amount: amount,
      description:
        "سحب مستحقات",
      is_settled: false,
      wallet_deducted: true,
    })
    .select("id")
    .single();

  // =========================
  // إذا فشل تسجيل الحركة
  // نرجع المبلغ للمحفظة
  // =========================

  if (
    transactionError ||
    !transaction
  ) {
    console.error(
      "Withdrawal transaction error:",
      transactionError
    );

    await supabaseServer.rpc(
      "deduct_wallet_balance",
      {
        p_user_id: userId,
        p_amount: -amount,
      }
    );

    return;
  }

  // =========================
  // تحديث حالة طلب السحب
  // =========================

  const {
    data: updatedRequest,
    error:
      updateError,
  } = await supabaseServer
    .from(
      "WithdrawalRequests"
    )
    .update({
      status: "approved",
      processed_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      requestId
    )
    .eq(
      "status",
      "pending"
    )
    .select("id")
    .maybeSingle();

  // =========================
  // إذا فشل تحديث الطلب
  // نرجع كل شيء
  // =========================

  if (
    updateError ||
    !updatedRequest
  ) {
    console.error(
      "Withdrawal approval update error:",
      updateError
    );

    // حذف حركة السحب
    await supabaseServer
      .from(
        "BalanceTransactions"
      )
      .delete()
      .eq(
        "id",
        transaction.id
      );

    // إعادة المبلغ للمحفظة
    await supabaseServer.rpc(
      "deduct_wallet_balance",
      {
        p_user_id: userId,
        p_amount: -amount,
      }
    );

    return;
  }

  // =========================
  // تحديث الصفحات
  // =========================

  revalidatePath(
    "/admin/withdrawals"
  );

  revalidatePath(
    "/admin"
  );

  revalidatePath(
    "/dashboard/accounting"
  );

  revalidatePath(
    "/dashboard"
  );
}

export default async function AdminWithdrawalsPage() {
  const {
    data: requests,
    error,
  } = await supabaseServer
    .from("WithdrawalRequests")
    .select("*")
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    console.error(
      "Withdrawal requests error:",
      error
    );
  }

  const allRequests =
    requests ?? [];

  // =========================
  // جلب أسماء الكباتن
  // =========================

  const userIds = [
    ...new Set(
      allRequests
        .map(
          (request: any) =>
            request.user_id
        )
        .filter(Boolean)
    ),
  ];

  let usersMap: Record<
    string,
    any
  > = {};

  if (
    userIds.length > 0
  ) {
    const {
      data: users,
    } = await supabaseServer
      .from("Users")
      .select(
        "id, full_name"
      )
      .in(
        "id",
        userIds
      );

    for (
      const user of users ?? []
    ) {
      usersMap[
        user.id
      ] = user;
    }
  }

  const pendingCount =
    allRequests.filter(
      (request: any) =>
        request.status ===
        "pending"
    ).length;

  const approvedCount =
    allRequests.filter(
      (request: any) =>
        request.status ===
        "approved"
    ).length;

  const rejectedCount =
    allRequests.filter(
      (request: any) =>
        request.status ===
        "rejected"
    ).length;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#EEF3F9] px-4 py-8 text-[#13294B] sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">

        <div className="mb-8">
          <h1 className="text-3xl font-black">
            طلبات سحب المستحقات
          </h1>

          <p className="mt-2 text-gray-500">
            مراجعة وإدارة طلبات سحب المستحقات الخاصة بالكباتن.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm font-bold text-gray-500">
              قيد المراجعة
            </p>

            <h2 className="mt-2 text-3xl font-black text-yellow-600">
              {pendingCount}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm font-bold text-gray-500">
              تمت الموافقة
            </p>

            <h2 className="mt-2 text-3xl font-black text-green-600">
              {approvedCount}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm font-bold text-gray-500">
              مرفوض
            </p>

            <h2 className="mt-2 text-3xl font-black text-red-600">
              {rejectedCount}
            </h2>
          </div>

        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow">

          <div className="border-b p-5">
            <h2 className="text-xl font-black">
              جميع طلبات السحب
            </h2>
          </div>

          {allRequests.length === 0 ? (

            <div className="p-10 text-center text-gray-500">
              لا توجد طلبات سحب حتى الآن.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-[1100px] w-full">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="p-4 text-right">
                      الكابتن
                    </th>

                    <th className="p-4 text-right">
                      المبلغ
                    </th>

                    <th className="p-4 text-right">
                      تاريخ الطلب
                    </th>

                    <th className="p-4 text-right">
                      الحالة
                    </th>

                    <th className="p-4 text-right">
                      الإجراء
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {allRequests.map(
                    (request: any) => {

                      const user =
                        usersMap[
                          request.user_id
                        ];

                      return (
                        <tr
                          key={
                            request.id
                          }
                          className="border-t"
                        >

                          <td className="p-4">

                            <div className="font-black">
                              {user?.full_name ??
                                "كابتن غير معروف"}
                            </div>

                            <div className="mt-1 text-xs text-gray-400">
                              ID:{" "}
                              {
                                request.user_id
                              }
                            </div>

                          </td>

                          <td className="p-4">

                            <span className="text-lg font-black">
                              {Number(
                                request.amount ??
                                  0
                              ).toFixed(3)}{" "}
                              JD
                            </span>

                          </td>

                          <td className="p-4 text-gray-500">

                            {request.created_at
                              ? new Intl.DateTimeFormat(
                                  "ar-JO",
                                  {
                                    timeZone:
                                      "Asia/Amman",
                                    dateStyle:
                                      "medium",
                                    timeStyle:
                                      "short",
                                  }
                                ).format(
                                  new Date(
                                    request.created_at
                                  )
                                )
                              : "-"}

                          </td>

                          <td className="p-4">

                            {request.status ===
                              "pending" && (
                              <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-sm font-black text-yellow-700">
                                قيد المراجعة
                              </span>
                            )}

                            {request.status ===
                              "approved" && (
                              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-black text-green-700">
                                تمت الموافقة
                              </span>
                            )}

                            {request.status ===
                              "rejected" && (
                              <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-black text-red-700">
                                مرفوض
                              </span>
                            )}

                          </td>

                          <td className="p-4">

                            {request.status ===
                            "pending" ? (

                              <div className="flex flex-wrap gap-2">

                                <form
                                  action={
                                    updateWithdrawalStatus
                                  }
                                >

                                  <input
                                    type="hidden"
                                    name="requestId"
                                    value={
                                      request.id
                                    }
                                  />

                                  <input
                                    type="hidden"
                                    name="status"
                                    value="approved"
                                  />

                                  <button
                                    type="submit"
                                    className="rounded-xl bg-green-600 px-4 py-2 font-black text-white transition hover:bg-green-700"
                                  >
                                    موافقة
                                  </button>

                                </form>

                                <form
                                  action={
                                    updateWithdrawalStatus
                                  }
                                >

                                  <input
                                    type="hidden"
                                    name="requestId"
                                    value={
                                      request.id
                                    }
                                  />

                                  <input
                                    type="hidden"
                                    name="status"
                                    value="rejected"
                                  />

                                  <button
                                    type="submit"
                                    className="rounded-xl bg-red-600 px-4 py-2 font-black text-white transition hover:bg-red-700"
                                  >
                                    رفض
                                  </button>

                                </form>

                              </div>

                            ) : (

                              <span className="text-sm text-gray-400">
                                تمت المعالجة
                              </span>

                            )}

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </main>
  );
}