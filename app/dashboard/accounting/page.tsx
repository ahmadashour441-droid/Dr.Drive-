import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function CaptainAccountingPage({
  searchParams,
}: {
  searchParams: Promise<{
    withdrawal?: string;
  }>;
}) {
  const params = await searchParams;

  const cookieStore = await cookies();

  const session = cookieStore.get("drdrive_session");

  if (!session) {
    redirect("/");
  }

  const user = JSON.parse(session.value);

  /* =========================
     CURRENT USER
  ========================= */

  const { data: currentUser } = await supabaseServer
    .from("Users")
    .select(
      "id, full_name, is_captain, is_producer, wallet_balance"
    )
    .eq("id", user.id)
    .single();

  if (!currentUser) {
    redirect("/");
  }

  const isProducer = Boolean(currentUser.is_producer);

  const isCaptain = Boolean(currentUser.is_captain);

  /* =========================
     ORDERS
  ========================= */

  const { data: orders } = await supabaseServer
    .from("Orders")
    .select("*")
    .eq(
      isCaptain
        ? "captain_id"
        : "producer_id",
      user.id
    )
    .order("created_at", {
      ascending: false,
    });

  /* =========================
     WITHDRAWAL REQUESTS
  ========================= */

  const { data: withdrawalRequests } =
    await supabaseServer
      .from("WithdrawalRequests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

  /* =========================
     FINANCIAL TRANSACTIONS
  ========================= */

  const { data: balanceTransactions } =
    await supabaseServer
      .from("BalanceTransactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

  const allOrders = orders ?? [];
  const allWithdrawals = withdrawalRequests ?? [];
  const allTransactions = balanceTransactions ?? [];

  /* =========================
     STATISTICS
  ========================= */

  const totalOrders = allOrders.length;

  const totalEarnings = allOrders.reduce(
    (sum: number, order: any) =>
      sum + Number(order.amount ?? 0),
    0
  );

  /* =========================
     WALLET
  ========================= */

  const walletBalance = Number(
    currentUser.wallet_balance ?? 0
  );

  const producerDue =
    isProducer
      ? Math.max(0, walletBalance)
      : 0;

  const unpaidCaptainDue =
    isCaptain
      ? Math.max(0, -walletBalance)
      : 0;

  const unpaidOrders =
    isCaptain
      ? allOrders.filter(
          (order: any) => !order.is_settled
        ).length
      : 0;

  /* =========================
     PENDING WITHDRAWAL
  ========================= */

  const pendingWithdrawal =
    isProducer
      ? allWithdrawals.find(
          (request: any) =>
            request.status === "pending"
        )
      : null;

  const hasPendingWithdrawal =
    Boolean(pendingWithdrawal);

  /*
   * طالما يوجد طلب معلق،
   * لا يمكن إنشاء طلب جديد.
   */

  const availableForWithdrawal =
    isProducer && !hasPendingWithdrawal
      ? Math.max(0, walletBalance)
      : 0;

  /* =========================
     WITHDRAWAL ACTION
  ========================= */

  async function requestWithdrawal(
    formData: FormData
  ) {
    "use server";

    const cookieStore = await cookies();

    const session = cookieStore.get(
      "drdrive_session"
    );

    if (!session) {
      redirect("/");
    }

    const sessionUser = JSON.parse(
      session.value
    );

    /* =========================
       التأكد من المستخدم
    ========================= */

    const {
      data: dbUser,
      error: userError,
    } = await supabaseServer
      .from("Users")
      .select(
        "id, is_producer, wallet_balance"
      )
      .eq("id", sessionUser.id)
      .single();

    if (userError || !dbUser) {
      console.error(
        "Withdrawal user error:",
        userError
      );

      redirect(
        "/dashboard/accounting?withdrawal=error"
      );
    }

    /* =========================
       السحب للمنتج فقط
    ========================= */

    if (!dbUser.is_producer) {
      redirect(
        "/dashboard/accounting?withdrawal=not-available"
      );
    }

    /* =========================
       التأكد من عدم وجود
       طلب سحب معلق
    ========================= */

    const {
      data: existingPendingRequest,
      error: pendingCheckError,
    } = await supabaseServer
      .from("WithdrawalRequests")
      .select("id")
      .eq("user_id", sessionUser.id)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();

    if (pendingCheckError) {
      console.error(
        "Pending withdrawal check error:",
        pendingCheckError
      );

      redirect(
        "/dashboard/accounting?withdrawal=error"
      );
    }

    if (existingPendingRequest) {
      redirect(
        "/dashboard/accounting?withdrawal=pending"
      );
    }

    /* =========================
       قراءة المبلغ
    ========================= */

    const amount = Number(
      formData.get("amount")
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      redirect(
        "/dashboard/accounting?withdrawal=invalid"
      );
    }

    const withdrawalAmount = Number(
      amount.toFixed(3)
    );

    /* =========================
       قراءة الرصيد الحالي
    ========================= */

    const currentWalletBalance = Number(
      dbUser.wallet_balance ?? 0
    );

    if (
      withdrawalAmount >
      currentWalletBalance
    ) {
      redirect(
        "/dashboard/accounting?withdrawal=insufficient"
      );
    }

    /* =========================
       إنشاء طلب السحب

       لا يتم خصم الرصيد هنا.

       الخصم يتم فقط عند موافقة
       الإدارة.
    ========================= */

    const {
      error: withdrawalError,
    } = await supabaseServer
      .from("WithdrawalRequests")
      .insert({
        user_id: sessionUser.id,
        amount: withdrawalAmount,
        status: "pending",
      });

    if (withdrawalError) {
      console.error(
        "Withdrawal request error:",
        withdrawalError
      );

      redirect(
        "/dashboard/accounting?withdrawal=error"
      );
    }

    /* =========================
       نجاح
    ========================= */

    redirect(
      "/dashboard/accounting?withdrawal=success"
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#EEF3F9] px-4 py-8 text-[#13294B] sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">

        <div className="mb-8">
          <h1 className="text-3xl font-black">
            كشف الحساب
          </h1>

          <p className="mt-2 text-gray-500">
            جميع مستحقاتك وطلباتك.
          </p>
        </div>

        {/* =========================
            WITHDRAWAL SUCCESS MESSAGE
        ========================= */}

        {params.withdrawal === "success" && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800 shadow-sm">
            <h3 className="font-black">
              تم إرسال طلب السحب بنجاح
            </h3>

            <p className="mt-2">
              سيتم تحويل مستحقاتك بعد تدقيق الإدارة والموافقة على الطلب.
            </p>
          </div>
        )}

        {/* =========================
            PENDING WITHDRAWAL MESSAGE
        ========================= */}

        {params.withdrawal === "pending" && (
          <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-yellow-800 shadow-sm">
            <h3 className="font-black">
              لديك طلب سحب قيد المراجعة
            </h3>

            <p className="mt-2">
              لا يمكنك إرسال طلب سحب جديد حتى تقوم الإدارة بالموافقة أو رفض الطلب الحالي.
            </p>
          </div>
        )}

        {/* =========================
            STATISTICS
        ========================= */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">
              عدد الطلبات
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {totalOrders}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">
              إجمالي الأرباح
            </p>

            <h2 className="mt-3 text-3xl font-bold text-blue-600">
              {totalEarnings.toFixed(3)} JD
            </h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">

            <p className="text-gray-500">
              {isProducer
                ? "المستحقات غير المسحوبة"
                : "المستحقات غير المسددة"}
            </p>

            <h2
              className={`mt-3 text-3xl font-bold ${
                isProducer
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {isProducer
                ? producerDue.toFixed(3)
                : unpaidCaptainDue.toFixed(3)}{" "}
              JD
            </h2>

            {!isProducer &&
              unpaidOrders > 0 && (
                <p className="mt-2 text-sm text-gray-400">
                  {unpaidOrders} طلب غير مسدد
                </p>
              )}

          </div>

          <div className="rounded-xl bg-white p-6 shadow">

            <p className="text-gray-500">
              رصيد المحفظة
            </p>

            <h2
              className={`mt-3 text-3xl font-bold ${
                walletBalance >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
              dir="ltr"
            >
              {walletBalance.toFixed(3)} JD
            </h2>

            {isProducer && (
              <p className="mt-2 text-sm text-gray-400">
                هذا هو رصيدك الحالي.
              </p>
            )}

          </div>

        </div>

        {/* =========================
            WITHDRAWAL
        ========================= */}

        <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#102F59] to-[#071E3D] p-6 text-white shadow-xl">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-2xl font-black">
                طلب سحب المستحقات
              </h2>

              <p className="mt-2 text-sm text-white/70">
                {isProducer
                  ? hasPendingWithdrawal
                    ? "لديك طلب سحب قيد المراجعة حالياً."
                    : "سيتم خصم الرصيد وتحويل المستحقات بعد موافقة الإدارة على الطلب."
                  : "الكابتن لا يسحب من المحفظة."}
              </p>

              <div className="mt-5">

                <p className="text-sm text-white/60">
                  {hasPendingWithdrawal
                    ? "المبلغ في الطلب الحالي"
                    : "المتاح للسحب"}
                </p>

                <div
                  className="mt-1 text-4xl font-black"
                  dir="ltr"
                >
                  {hasPendingWithdrawal
                    ? Number(
                        pendingWithdrawal?.amount ?? 0
                      ).toFixed(3)
                    : availableForWithdrawal.toFixed(3)}

                  <span className="mr-2 text-lg">
                    JD
                  </span>
                </div>

              </div>

            </div>

            <form
              action={
                isProducer && !hasPendingWithdrawal
                  ? requestWithdrawal
                  : undefined
              }
              className="w-full max-w-md rounded-2xl bg-white/10 p-5 backdrop-blur"
            >

              <label className="mb-2 block text-sm font-bold">
                المبلغ المطلوب سحبه
              </label>

              <div className="flex gap-3">

                <input
                  type="number"
                  name="amount"
                  min="0.001"
                  max={availableForWithdrawal}
                  step="0.001"
                  placeholder="مثال: 10.000"
                  required
                  disabled={
                    !isProducer ||
                    hasPendingWithdrawal ||
                    availableForWithdrawal <= 0
                  }
                  className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white px-4 py-3 text-left font-bold text-[#13294B] outline-none focus:border-[#F5B82E] disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={
                    !isProducer ||
                    hasPendingWithdrawal ||
                    availableForWithdrawal <= 0
                  }
                  className="rounded-xl bg-[#F5B82E] px-5 py-3 font-black text-[#071E3D] transition hover:bg-[#ffc94d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {hasPendingWithdrawal
                    ? "طلب قيد المراجعة"
                    : "طلب السحب"}
                </button>

              </div>

              {isProducer &&
                hasPendingWithdrawal && (
                  <p className="mt-3 text-sm font-bold text-yellow-300">
                    يوجد لديك طلب سحب قيد المراجعة. لا يمكنك إرسال طلب جديد حتى يتم اتخاذ قرار بشأنه.
                  </p>
                )}

              {isProducer &&
                !hasPendingWithdrawal &&
                availableForWithdrawal <= 0 && (
                  <p className="mt-3 text-sm font-bold text-red-300">
                    لا يوجد رصيد متاح للسحب حالياً.
                  </p>
                )}

              {isCaptain && (
                <p className="mt-3 text-sm font-bold text-white/70">
                  رصيد المحفظة لا يتحول إلى طلب سحب.
                </p>
              )}

            </form>

          </div>
        </div>

        {/* =========================
            WITHDRAWALS
        ========================= */}

        {allWithdrawals.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">

            <div className="border-b p-5">
              <h2 className="text-xl font-black">
                طلبات السحب السابقة
              </h2>
            </div>

            <div className="overflow-x-auto">

              <table className="min-w-[800px] w-full">

                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-4 text-right">
                      المبلغ
                    </th>
                    <th className="p-4 text-right">
                      الحالة
                    </th>
                    <th className="p-4 text-right">
                      التاريخ
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {allWithdrawals.map(
                    (request: any) => (
                      <tr
                        key={request.id}
                        className="border-t"
                      >

                        <td className="p-4 font-bold">
                          {Number(
                            request.amount ?? 0
                          ).toFixed(3)} JD
                        </td>

                        <td className="p-4">

                          {request.status === "pending" && (
                            <span className="font-bold text-yellow-600">
                              قيد المراجعة
                            </span>
                          )}

                          {request.status === "approved" && (
                            <span className="font-bold text-green-600">
                              تمت الموافقة
                            </span>
                          )}

                          {request.status === "rejected" && (
                            <span className="font-bold text-red-600">
                              مرفوض
                            </span>
                          )}

                        </td>

                        <td className="p-4 text-gray-500">
                          {new Intl.DateTimeFormat(
                            "ar-JO",
                            {
                              timeZone: "Asia/Amman",
                              dateStyle: "medium",
                              timeStyle: "short",
                            }
                          ).format(
                            new Date(request.created_at)
                          )}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          </div>
        )}

        {/* =========================
            ORDERS
        ========================= */}

        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">

          <div className="border-b p-5">

            <h2 className="text-xl font-black">
              الطلبات
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              جميع الطلبات الحالية والسابقة.
              إغلاق الأسبوع لا يحذف الطلبات.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="min-w-[1200px] w-full">

              <thead className="bg-slate-100">
                <tr>
                  <th className="p-4 text-right">#</th>
                  <th className="p-4 text-right">النوع</th>
                  <th className="p-4 text-right">قيمة الطلب</th>
                  <th className="p-4 text-right">
                    {isCaptain
                      ? "عمولة الكابتن"
                      : "مستحق المنتج"}
                  </th>
                  <th className="p-4 text-right">الحالة</th>
                  <th className="p-4 text-right">الأسبوع</th>
                </tr>
              </thead>

              <tbody>

                {allOrders.map(
                  (order: any) => (
                    <tr
                      key={order.id}
                      className="border-t"
                    >

                      <td className="p-4">
                        {order.id}
                      </td>

                      <td className="p-4">
                        {order.order_type}
                      </td>

                      <td className="p-4 font-bold">
                        {Number(
                          order.amount ?? 0
                        ).toFixed(3)} JD
                      </td>

                      <td
                        className={`p-4 font-semibold ${
                          isProducer
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {isProducer
                          ? Number(
                              order.net_producer_commission ?? 0
                            ).toFixed(3)
                          : Number(
                              order.captain_due ?? 0
                            ).toFixed(3)} JD
                      </td>

                      <td className="p-4">

                        {order.is_settled ? (
                          <span className="font-bold text-green-600">
                            تم إغلاق الأسبوع
                          </span>
                        ) : (
                          <span className="font-bold text-yellow-600">
                            الأسبوع الحالي
                          </span>
                        )}

                      </td>

                      <td className="p-4">
                        {order.week_start}
                      </td>

                    </tr>
                  )
                )}

                {allOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-10 text-center text-gray-500"
                    >
                      لا توجد طلبات.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>
        </div>

        {/* =========================
            FINANCIAL TRANSACTIONS
        ========================= */}

        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">

          <div className="border-b p-5">

            <h2 className="text-xl font-black">
              العمليات المالية
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              جميع الحركات المسجلة على الحساب.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="min-w-[1000px] w-full">

              <thead className="bg-slate-100">
                <tr>
                  <th className="p-4 text-right">التاريخ</th>
                  <th className="p-4 text-right">الوصف</th>
                  <th className="p-4 text-right">النوع</th>
                  <th className="p-4 text-right">القيمة</th>
                  <th className="p-4 text-right">الأسبوع</th>
                </tr>
              </thead>

              <tbody>

                {allTransactions.map(
                  (trx: any) => (
                    <tr
                      key={trx.id}
                      className="border-t"
                    >

                      <td className="p-4 text-gray-500">
                        {new Intl.DateTimeFormat(
                          "ar-JO",
                          {
                            timeZone: "Asia/Amman",
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        ).format(
                          new Date(trx.created_at)
                        )}
                      </td>

                      <td className="p-4">
                        {trx.description ?? "-"}
                      </td>

                      <td
                        className={`p-4 font-bold ${
                          trx.type === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {trx.type === "credit"
                          ? "دائن"
                          : "مدين"}
                      </td>

                      <td className="p-4 font-bold">
                        {Number(
                          trx.amount ?? 0
                        ).toFixed(3)} JD
                      </td>

                      <td className="p-4">
                        {trx.week_start ?? "-"}
                      </td>

                    </tr>
                  )
                )}

                {allTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-gray-500"
                    >
                      لا توجد عمليات مالية.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>
        </div>

      </div>
    </main>
  );
}