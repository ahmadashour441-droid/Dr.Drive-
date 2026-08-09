"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Transaction = {
  id: number;

  user_id: number;

  order_id: number | null;

  type: "credit" | "debit";

  amount: number;

  description: string | null;

  created_at: string;

  week_start: string | null;

  week_end: string | null;

  is_settled: boolean;

  user: {
    id: number;

    full_name: string;

    phone: string | null;

    status: boolean;

    is_captain: boolean;

    is_producer: boolean;
  } | null;

  order: {
    id: number;

    order_type: string;

    customer_name: string;

    producer_id: number;

    producer: {
      full_name: string;
    } | null;
  } | null;
};

type UserSummary = {
  id: number;

  name: string;

  role: "كابتن" | "منتج";

  phone: string;

  active: boolean;

  credit: number;

  debit: number;

  balance: number;

  transactions: Transaction[];
};

export default function AccountingPage() {

  const [loading, setLoading] =
    useState(true);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [selectedUser, setSelectedUser] =
    useState<UserSummary | null>(null);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [showCloseDialog, setShowCloseDialog] =
    useState(false);

  const [closingWeek, setClosingWeek] =
    useState(false);
      async function loadTransactions() {

    try {

      setLoading(true);

      const { data, error } =
        await supabase

          .from("BalanceTransactions")

          .select(`
  *,
  user:Users(
    id,
    full_name,
    phone,
    status,
    is_captain,
    is_producer
  ),
  order:Orders(
    id,
    order_type,
    producer_id,
    customer_name,
    producer:Users!Orders_producer_id_fkey(
      full_name
    )
  )
`)

          .eq("is_settled", false)

          .order("id", {
  ascending: false,
});

      if (error) throw error;

      setTransactions(
        (data ?? []) as Transaction[]
        
      );

    } catch (err: any) {

      setErrorMessage(
        err.message ??
          "حدث خطأ أثناء تحميل البيانات"
      );

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadTransactions();

  }, []);

    const users = useMemo(() => {

    const map = new Map<number, UserSummary>();

    transactions.forEach((trx) => {

      if (!trx.user) return;

      if (!map.has(trx.user.id)) {

        map.set(trx.user.id, {

          id: trx.user.id,

          name: trx.user.full_name,

          role: trx.user.is_captain
            ? "كابتن"
            : "منتج",

          phone: trx.user.phone ?? "",

          active: trx.user.status,

          credit: 0,

          debit: 0,

          balance: 0,

          transactions: [],

        });

      }

      const user = map.get(trx.user.id)!;

      if (trx.type === "credit") {

        user.credit += Number(trx.amount);

      } else {

        user.debit += Number(trx.amount);

      }

      user.balance =
        user.credit - user.debit;

      user.transactions.push(trx);

    });

    let result =
      Array.from(map.values());

    if (search.trim()) {

      const value =
        search.toLowerCase();

      result = result.filter(
        (u) =>
          u.name
            .toLowerCase()
            .includes(value) ||
          u.phone.includes(search)
      );

    }

    switch (filter) {

      case "captains":

        result = result.filter(
          (u) => u.role === "كابتن"
        );

        break;

      case "producers":

        result = result.filter(
          (u) => u.role === "منتج"
        );

        break;

      case "positive":

        result = result.filter(
          (u) => u.balance > 0
        );

        break;

      case "negative":

        result = result.filter(
          (u) => u.balance < 0
        );

        break;

    }

    return result.sort(
      (a, b) =>
        Math.abs(b.balance) -
        Math.abs(a.balance)
    );

  }, [
    transactions,
    search,
    filter,
  ]);
    const totalCredit = users.reduce(
    (sum, user) =>
      sum + user.credit,
    0
  );

  const totalDebit = users.reduce(
    (sum, user) =>
      sum + user.debit,
    0
  );

  const totalBalance = users.reduce(
    (sum, user) =>
      sum + user.balance,
    0
  );

  const captainsCount =
    users.filter(
      (u) => u.role === "كابتن"
    ).length;

  const producersCount =
    users.filter(
      (u) => u.role === "منتج"
    ).length;
async function settleUser(userId: number) {

  try {

    const trx = transactions.filter(
      (t) => t.user_id === userId
    );

    const orderIds = trx
      .map((t) => t.order_id)
      .filter(
        (id): id is number =>
          id !== null
      );

    const { error: trxError } =
      await supabase
        .from("BalanceTransactions")
        .update({
          is_settled: true,
        })
        .eq("user_id", userId)
        .eq("is_settled", false);

    if (trxError) throw trxError;

    if (orderIds.length > 0) {

      const { error: orderError } =
        await supabase
          .from("Orders")
          .update({
            is_settled: true,
          })
          .in("id", orderIds);

      if (orderError)
        throw orderError;

    }

    setSelectedUser(null);

    setSuccessMessage(
      "تمت التسوية بنجاح"
    );

    await loadTransactions();

  } catch (err: any) {

    setErrorMessage(
      err.message ??
        "تعذر تنفيذ التسوية"
    );

  }

}
async function closeWeek() {

  try {

    setClosingWeek(true);

    /*
     * إغلاق الأسبوع الحالي فقط.
     *
     * مهم:
     * لا نلمس wallet_balance هنا.
     * الخصومات المالية تتم لحظة إنشاء الطلب،
     * وإغلاق الأسبوع فقط يغلق طلبات وحركات هذا الأسبوع
     * حتى تنتقل عملياً إلى سجل الأسابيع السابقة.
     */

    const today = new Date();

    const weekStart = new Date(today);

    weekStart.setDate(
      today.getDate() - today.getDay()
    );

    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);

    weekEnd.setDate(
      weekEnd.getDate() + 6
    );

    const weekStartText =
      weekStart.toISOString().split("T")[0];

    const weekEndText =
      weekEnd.toISOString().split("T")[0];

    /*
     * إغلاق حركات الأسبوع الحالي فقط.
     * لا يوجد أي تعديل على رصيد المحفظة.
     */

    const { error: balanceError } =
      await supabase
        .from("BalanceTransactions")
        .update({
          is_settled: true,
        })
        .eq("is_settled", false)
        .eq("week_start", weekStartText);

    if (balanceError)
      throw balanceError;

    /*
     * إغلاق طلبات الأسبوع الحالي فقط.
     * الطلبات تبقى محفوظة في Orders ويمكن عرضها لاحقاً
     * ضمن الأسابيع السابقة.
     */

    const { error: ordersError } =
      await supabase
        .from("Orders")
        .update({
          is_settled: true,
        })
        .eq("is_settled", false)
        .eq("week_start", weekStartText);

    if (ordersError)
      throw ordersError;

    setShowCloseDialog(false);

    setSuccessMessage(
      `تم إغلاق أسبوع ${weekStartText} إلى ${weekEndText} بنجاح. لم يتم تغيير أرصدة المحافظ.`
    );

    await loadTransactions();

  } catch (err: any) {

    setErrorMessage(
      err.message ??
        "تعذر إغلاق الأسبوع"
    );

  } finally {

    setClosingWeek(false);

  }

}
  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <div className="text-2xl font-bold">

          جاري تحميل البيانات...

        </div>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-slate-100 p-6">

      {successMessage && (

        <div className="mb-5 rounded-xl border border-green-300 bg-green-100 px-5 py-4 text-green-700 font-semibold">

          {successMessage}

        </div>

      )}

      {errorMessage && (

        <div className="mb-5 rounded-xl border border-red-300 bg-red-100 px-5 py-4 text-red-700 font-semibold">

          {errorMessage}

        </div>

      )}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

        <div>

          <h1 className="text-3xl font-bold">

            المحاسبة

          </h1>

          <p className="mt-2 text-gray-500">

            متابعة أرصدة الكباتن والمنتجين

          </p>

        </div>

        <div className="flex gap-3">

          <input

            value={search}

            onChange={(e) =>
              setSearch(e.target.value)
            }

            placeholder="بحث..."

            className="rounded-xl border bg-white px-4 py-3 w-72"

          />

          <select

            value={filter}

            onChange={(e) =>
              setFilter(e.target.value)
            }

            className="rounded-xl border bg-white px-4"

          >

            <option value="all">

              الجميع

            </option>

            <option value="captains">

              الكباتن

            </option>

            <option value="producers">

              المنتجون

            </option>

            <option value="positive">

              لهم مستحقات

            </option>

            <option value="negative">

              عليهم مستحقات

            </option>

          </select>

          <button
  onClick={() => setShowCloseDialog(true)}
  className="rounded-xl bg-red-600 px-6 py-3 text-white font-bold hover:bg-red-700"
>
  إغلاق الأسبوع
</button>


        </div>

      </div>

      <div className="grid gap-5 md:grid-cols-5 mb-8">

        <div className="rounded-2xl bg-white p-6 shadow">

          <p className="text-gray-500">

            إجمالي الدائن

          </p>

          <h2 className="mt-3 text-3xl font-bold text-green-600">

            {totalCredit.toFixed(2)} JD

          </h2>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow">

          <p className="text-gray-500">

            إجمالي المدين

          </p>

          <h2 className="mt-3 text-3xl font-bold text-red-600">

            {totalDebit.toFixed(2)} JD

          </h2>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow">

          <p className="text-gray-500">

            صافي الرصيد

          </p>

          <h2 className="mt-3 text-3xl font-bold text-blue-600">

            {totalBalance.toFixed(2)} JD

          </h2>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow">

          <p className="text-gray-500">

            الكباتن

          </p>

          <h2 className="mt-3 text-3xl font-bold">

            {captainsCount}

          </h2>

        </div>

        <div className="rounded-2xl bg-white p-6 shadow">

          <p className="text-gray-500">

            المنتجون

          </p>

          <h2 className="mt-3 text-3xl font-bold">

            {producersCount}

          </h2>

        </div>

      </div>
            <div className="overflow-hidden rounded-2xl bg-white shadow">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-right">
                الاسم
              </th>

              <th className="text-center">
                النوع
              </th>

              <th className="text-center">
                الهاتف
              </th>

              <th className="text-center">
                دائن
              </th>

              <th className="text-center">
                مدين
              </th>

              <th className="text-center">
                الرصيد
              </th>

              <th className="text-center">
                الحالة
              </th>

              <th className="text-center">
                الإجراءات
              </th>

            </tr>

          </thead>

          <tbody>

            {users.map((user) => (

              <tr
                key={user.id}
                className="border-t hover:bg-slate-50"
              >

                <td className="p-4 font-semibold">

                  {user.name}

                </td>

                <td className="text-center">

                  {user.role}

                </td>

                <td className="text-center">

                  {user.phone || "-"}

                </td>

                <td className="text-center font-bold text-green-600">

                  {user.credit.toFixed(2)}

                </td>

                <td className="text-center font-bold text-red-600">

                  {user.debit.toFixed(2)}

                </td>

                <td
                  className={`text-center font-bold ${
                    user.balance >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >

                  {user.balance.toFixed(2)} JD

                </td>

                <td className="text-center">

                  {user.active ? (

                    <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">

                      نشط

                    </span>

                  ) : (

                    <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">

                      موقوف

                    </span>

                  )}

                </td>

                <td className="text-center">

                  <div className="flex justify-center gap-2">

                    <button

                      onClick={() =>
                        setSelectedUser(user)
                      }

                      className="rounded-lg bg-blue-600 px-4 py-2 text-white"

                    >

                      التفاصيل

                    </button>

                    <button

                      onClick={() => settleUser(user.id)}
className="rounded-lg bg-green-600 px-4 py-2 text-white"

                    >

                      تسوية

                    </button>

                  </div>

                </td>

              </tr>

            ))}

            {users.length === 0 && (

              <tr>

                <td
                  colSpan={8}
                  className="p-10 text-center text-gray-500"
                >

                  لا توجد بيانات

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>
            {selectedUser && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">

          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">

            <div className="flex items-center justify-between border-b p-6">

              <div>

                <h2 className="text-2xl font-bold">

                  {selectedUser.name}

                </h2>

                <p className="text-gray-500 mt-2">

                  {selectedUser.role}

                </p>

              </div>

              <button

                onClick={() =>
                  setSelectedUser(null)
                }

                className="rounded-xl bg-red-600 px-5 py-2 text-white"

              >

                إغلاق

              </button>

            </div>

            <div className="grid md:grid-cols-3 gap-5 p-6">

              <div className="rounded-xl bg-green-50 p-5">

                <p className="text-gray-500">

                  إجمالي الدائن

                </p>

                <h2 className="mt-3 text-3xl font-bold text-green-600">

                  {selectedUser.credit.toFixed(2)} JD

                </h2>

              </div>

              <div className="rounded-xl bg-red-50 p-5">

                <p className="text-gray-500">

                  إجمالي المدين

                </p>

                <h2 className="mt-3 text-3xl font-bold text-red-600">

                  {selectedUser.debit.toFixed(2)} JD

                </h2>

              </div>

              <div className="rounded-xl bg-blue-50 p-5">

                <p className="text-gray-500">

                  الرصيد الحالي

                </p>

                <h2 className={`mt-3 text-3xl font-bold ${selectedUser.balance >= 0 ? "text-green-600" : "text-red-600"}`}>

                  {selectedUser.balance.toFixed(2)} JD

                </h2>

              </div>

            </div>

            <div className="px-6 pb-6 overflow-auto max-h-[450px]">

              <table className="w-full">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="p-3 text-right">

                      التاريخ

                    </th>

                    <th className="text-center">

                      الطلب

                    </th>

                    <th className="text-center">

                      الوصف

                    </th>

                    <th className="text-center">

                      النوع

                    </th>

                    <th className="text-center">

                      القيمة

                    </th>

                  </tr>

                </thead>

                <tbody>

                  {selectedUser.transactions.map((trx) => (

                    <tr
                      key={trx.id}
                      className="border-t"
                    >

                      <td className="p-3">

                        {new Date(
                          trx.created_at
                        ).toLocaleString("ar-JO")}

                      </td>

                      <td className="text-center">

                        {trx.order
  ? `${trx.order.order_type} | ${trx.order.producer?.full_name ?? "-"}`
  : trx.description}

                      </td>

                      <td className="text-center">

                        {trx.description}

                      </td>

                      <td className={`text-center font-bold ${trx.type === "credit" ? "text-green-600" : "text-red-600"}`}>

                        {trx.type === "credit"
                          ? "دائن"
                          : "مدين"}

                      </td>

                      <td className="text-center">

                        {Number(trx.amount).toFixed(2)} JD

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      )}
            {showCloseDialog && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-8 w-full max-w-md">

            <h2 className="text-2xl font-bold mb-4">

              إغلاق الأسبوع

            </h2>

            <p className="text-gray-600 leading-8">

              سيتم إغلاق طلبات وحركات الأسبوع الحالي
              فقط ونقلها عملياً إلى سجل الأسابيع السابقة.
              لن يتم تغيير أرصدة المحافظ أو إعادة خصم أي مبلغ.

            </p>

            <div className="flex justify-end gap-3 mt-8">

              <button

                onClick={() =>
                  setShowCloseDialog(false)
                }

                className="px-5 py-2 rounded-xl border"

              >

                إلغاء

              </button>

              <button

                disabled={closingWeek}

                onClick={closeWeek}

                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-xl"

              >

                {closingWeek
                  ? "جاري التنفيذ..."
                  : "تأكيد"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}