import { supabaseServer } from "@/lib/supabaseServer";

export default async function NegativeBalancesPage() {
  const { data: users, error } =
    await supabaseServer
      .from("Users")
      .select(
        "id, full_name, phone, wallet_balance"
      )
      .lt("wallet_balance", 0)
      .order("wallet_balance", {
        ascending: true,
      });

  const negativeUsers = users ?? [];

  const totalNegativeBalance =
    negativeUsers.reduce(
      (sum, user) =>
        sum +
        Math.abs(
          Number(
            user.wallet_balance ?? 0
          )
        ),
      0
    );

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#EEF3F9] px-4 py-8 text-[#13294B] sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1200px]">

        <div className="mb-8">
          <h1 className="text-3xl font-black">
            الأرصدة السالبة
          </h1>

          <p className="mt-2 text-gray-500">
            قائمة المستخدمين الذين لديهم رصيد مستحق بالسالب.
          </p>
        </div>

        {/* الإحصائيات */}

        <div className="mb-8 grid gap-5 md:grid-cols-2">

          <div className="rounded-2xl bg-white p-6 shadow">

            <p className="text-gray-500">
              عدد المستخدمين
            </p>

            <h2 className="mt-3 text-4xl font-black">
              {negativeUsers.length}
            </h2>

          </div>

          <div className="rounded-2xl bg-white p-6 shadow">

            <p className="text-gray-500">
              إجمالي الأرصدة المستحقة
            </p>

            <h2 className="mt-3 text-4xl font-black text-red-600">
              {totalNegativeBalance.toFixed(3)} JD
            </h2>

          </div>

        </div>

        {/* رسالة الخطأ */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-5 py-4 font-bold text-red-700">
            حدث خطأ أثناء تحميل الأرصدة السالبة:
            {" "}
            {error.message}
          </div>
        )}

        {/* الجدول */}

        <div className="overflow-hidden rounded-2xl bg-white shadow">

          <div className="border-b p-6">

            <h2 className="text-xl font-black">
              المستخدمون أصحاب الرصيد السالب
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              بمجرد شحن المستخدم وعودة رصيده إلى صفر أو أكثر،
              سيختفي تلقائياً من هذه القائمة.
            </p>

          </div>

          {negativeUsers.length === 0 ? (

            <div className="p-12 text-center">

              <div className="text-2xl font-black text-green-600">
                لا توجد أرصدة سالبة حالياً
              </div>

              <p className="mt-2 text-gray-500">
                جميع المستخدمين لديهم رصيد صفر أو أعلى.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-[800px] w-full">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="p-4 text-right">
                      #
                    </th>

                    <th className="p-4 text-right">
                      اسم المستخدم
                    </th>

                    <th className="p-4 text-right">
                      رقم الهاتف
                    </th>

                    <th className="p-4 text-right">
                      الرصيد المستحق
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {negativeUsers.map(
                    (user, index) => {

                      const balance =
                        Number(
                          user.wallet_balance ?? 0
                        );

                      return (
                        <tr
                          key={user.id}
                          className="border-t transition hover:bg-slate-50"
                        >

                          <td className="p-4 font-bold">
                            {index + 1}
                          </td>

                          <td className="p-4 font-black">
                            {user.full_name || "-"}
                          </td>

                          <td
                            className="p-4"
                            dir="ltr"
                          >
                            {user.phone || "-"}
                          </td>

                          <td className="p-4">

                            <span className="inline-flex rounded-xl bg-red-100 px-4 py-2 font-black text-red-700">
                              {Math.abs(
                                balance
                              ).toFixed(3)} JD
                            </span>

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