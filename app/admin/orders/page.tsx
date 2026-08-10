"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  id: number;
  full_name: string;
  phone: string | null;
  is_captain: boolean;
  is_producer: boolean;
  status: boolean;
};

type Order = {
  id: number;
  customer_name: string;
  customer_phone: string | null;
  producer_id: number | null;
  captain_id: number | null;
  order_type: string;
  amount: number;
  producer_commission: number;
  captain_commission: number;
  admin_commission: number;
  net_producer_commission: number;
  status: string | null;
  created_at: string;
  week_start: string | null;
  week_end: string | null;
  is_settled: boolean;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [captains, setCaptains] = useState<User[]>([]);
  const [producers, setProducers] = useState<User[]>([]);

  const [producerId, setProducerId] = useState("");
  const [captainId, setCaptainId] = useState("");
  const [producerPhone, setProducerPhone] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [orderType, setOrderType] = useState("راكب");
  const [amount, setAmount] = useState("");

  const [saving, setSaving] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  // =========================
  // EDIT
  // =========================

  const [editingOrder, setEditingOrder] =
    useState<Order | null>(null);

  const [editSaving, setEditSaving] =
    useState(false);

  // =========================
  // CANCEL
  // =========================

  const [cancellingId, setCancellingId] =
    useState<number | null>(null);

  // =========================
  // LOAD
  // =========================

  useEffect(() => {
    loadUsers();
    loadOrders();
  }, []);

  async function loadUsers() {
    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .order("full_name");

    if (error) {
      alert(error.message);
      return;
    }

    setCaptains(
      (data ?? []).filter(
        (user) => user.is_captain
      )
    );

    setProducers(
      (data ?? []).filter(
        (user) => user.is_producer
      )
    );
  }

  async function loadOrders() {
    setLoadingOrders(true);

    const { data, error } = await supabase
      .from("Orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      alert(error.message);
      setLoadingOrders(false);
      return;
    }

    setOrders(
      (data ?? []).map((order) => ({
        ...order,
        amount: Number(order.amount ?? 0),
        producer_commission: Number(
          order.producer_commission ?? 0
        ),
        captain_commission: Number(
          order.captain_commission ?? 0
        ),
        admin_commission: Number(
          order.admin_commission ?? 0
        ),
        net_producer_commission: Number(
          order.net_producer_commission ?? 0
        ),
      }))
    );

    setLoadingOrders(false);
  }

  // =========================
  // ADD ORDER
  // =========================

  async function saveOrder() {
    if (saving) return;

    if (
      !producerId ||
      !captainId ||
      !amount
    ) {
      alert("يرجى تعبئة جميع الحقول");
      return;
    }

    const value = Number(amount);

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      alert(
        "يرجى إدخال قيمة طلب صحيحة"
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/orders/create",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            producerId:
              Number(producerId),
            captainId:
              Number(captainId),
            orderType,
            amount: value,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.error ??
            "تعذر حفظ الطلب"
        );
        return;
      }

      const deduction = Number(
        result.deduction ?? 0
      );

      const walletBalance =
        Number(
          result.walletBalance ?? 0
        );

      alert(
        `تم حفظ الطلب بنجاح.\n\nتم خصم ${deduction.toFixed(
          2
        )} JD من محفظة الكابتن.\n\nالرصيد الحالي: ${walletBalance.toFixed(
          2
        )} JD`
      );

      setProducerId("");
      setCaptainId("");
      setProducerPhone("");
      setCaptainPhone("");
      setAmount("");
      setOrderType("راكب");

      await loadOrders();
    } catch (error: any) {
      alert(
        error?.message ??
          "حدث خطأ أثناء حفظ الطلب"
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // OPEN EDIT
  // =========================

  function openEditOrder(order: Order) {
    if (order.status === "cancelled") {
      alert("لا يمكن تعديل طلب ملغي");
      return;
    }

    if (order.is_settled) {
      alert(
        "لا يمكن تعديل طلب تمت تسويته ماليًا"
      );
      return;
    }

    setEditingOrder({
      ...order,
    });
  }

  // =========================
  // UPDATE ORDER
  // =========================

  async function updateOrder() {
    if (!editingOrder || editSaving) {
      return;
    }

    const value = Number(
      editingOrder.amount
    );

    if (
      !editingOrder.customer_name.trim() ||
      !editingOrder.customer_phone?.trim() ||
      !editingOrder.producer_id ||
      !editingOrder.captain_id ||
      !Number.isFinite(value) ||
      value <= 0
    ) {
      alert(
        "يرجى تعبئة بيانات التعديل بشكل صحيح"
      );
      return;
    }

    setEditSaving(true);

    try {
      const response = await fetch(
        "/api/orders/update",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            orderId:
              editingOrder.id,

            customerName:
              editingOrder.customer_name,

            customerPhone:
              editingOrder.customer_phone,

            producerId:
              Number(
                editingOrder.producer_id
              ),

            captainId:
              Number(
                editingOrder.captain_id
              ),

            orderType:
              editingOrder.order_type,

            amount: value,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.error ??
            "تعذر تعديل الطلب"
        );
        return;
      }

      alert(
        "تم تعديل الطلب بنجاح"
      );

      setEditingOrder(null);

      await loadOrders();
    } catch (error: any) {
      alert(
        error?.message ??
          "حدث خطأ أثناء تعديل الطلب"
      );
    } finally {
      setEditSaving(false);
    }
  }

  // =========================
  // CANCEL ORDER
  // =========================

  async function cancelOrder(
    order: Order
  ) {
    if (cancellingId !== null) {
      return;
    }

    if (order.status === "cancelled") {
      alert("الطلب ملغي بالفعل");
      return;
    }

    if (order.is_settled) {
      alert(
        "لا يمكن إلغاء طلب تمت تسويته ماليًا"
      );
      return;
    }

    const confirmed =
      window.confirm(
        `هل أنت متأكد من إلغاء الطلب #${order.id}؟\n\nسيبقى الطلب محفوظًا كملغي، وستنعكس الحركات المالية المرتبطة به.`
      );

    if (!confirmed) {
      return;
    }

    setCancellingId(order.id);

    try {
      const response = await fetch(
        "/api/orders/cancel",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            orderId: order.id,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.error ??
            "تعذر إلغاء الطلب"
        );
        return;
      }

      alert(
        "تم إلغاء الطلب وعكس الحركات المالية بنجاح"
      );

      await loadOrders();
    } catch (error: any) {
      alert(
        error?.message ??
          "حدث خطأ أثناء إلغاء الطلب"
      );
    } finally {
      setCancellingId(null);
    }
  }

  // =========================
  // FILTER
  // =========================

  const filteredOrders = useMemo(() => {
    const text =
      search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ||
        order.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!text) {
        return true;
      }

      const producer =
        producers.find(
          (user) =>
            user.id ===
            order.producer_id
        );

      const captain =
        captains.find(
          (user) =>
            user.id ===
            order.captain_id
        );

      const searchable = [
        String(order.id),
        order.customer_name,
        order.customer_phone ?? "",
        producer?.full_name ?? "",
        producer?.phone ?? "",
        captain?.full_name ?? "",
        captain?.phone ?? "",
        order.order_type,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(text);
    });
  }, [
    orders,
    search,
    statusFilter,
    producers,
    captains,
  ]);

  // =========================
  // SUMMARY
  // =========================

  const summary = useMemo(() => {
    const completed = orders.filter(
      (order) =>
        order.status === "completed"
    );

    const cancelled = orders.filter(
      (order) =>
        order.status === "cancelled"
    );

    const totalAmount =
      completed.reduce(
        (sum, order) =>
          sum + Number(order.amount),
        0
      );

    const captainCommission =
      completed.reduce(
        (sum, order) =>
          sum +
          Number(
            order.captain_commission
          ),
        0
      );

    const producerCommission =
      completed.reduce(
        (sum, order) =>
          sum +
          Number(
            order.producer_commission
          ),
        0
      );

    return {
      total: orders.length,
      completed: completed.length,
      cancelled: cancelled.length,
      totalAmount,
      captainCommission,
      producerCommission,
    };
  }, [orders]);

  // =========================
  // HELPERS
  // =========================

  function getUserName(
    id: number | null,
    users: User[]
  ) {
    if (!id) return "-";

    return (
      users.find(
        (user) => user.id === id
      )?.full_name ?? "-"
    );
  }

  function formatDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleString("ar-JO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  // =========================
  // UI
  // =========================

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#EEF3F9] px-5 py-8 text-[#13294B] sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-[1600px]">

        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl font-black">
            إدارة الطلبات
          </h1>

          <p className="mt-2 text-gray-500">
            ملخص ومتابعة وإدارة جميع الطلبات
          </p>
        </div>

        {/* SUMMARY */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              إجمالي الطلبات
            </p>

            <p className="mt-2 text-3xl font-black text-blue-600">
              {summary.total}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              المكتملة
            </p>

            <p className="mt-2 text-3xl font-black text-green-600">
              {summary.completed}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              الملغاة
            </p>

            <p className="mt-2 text-3xl font-black text-red-600">
              {summary.cancelled}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              قيمة الطلبات
            </p>

            <p className="mt-2 text-2xl font-black">
              {summary.totalAmount.toFixed(2)}
              {" "}
              JD
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              عمولات الكباتن
            </p>

            <p className="mt-2 text-2xl font-black text-purple-600">
              {summary.captainCommission.toFixed(
                2
              )}
              {" "}
              JD
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              عمولات المنتجات
            </p>

            <p className="mt-2 text-2xl font-black text-orange-600">
              {summary.producerCommission.toFixed(
                2
              )}
              {" "}
              JD
            </p>
          </div>

        </div>

        {/* ADD ORDER */}

        <div className="mb-8 rounded-2xl bg-white p-6 shadow">

          <h2 className="mb-6 text-xl font-black">
            إضافة طلب جديد
          </h2>

          <div className="grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">

            <select
              className="rounded-lg border p-3"
              value={producerId}
              onChange={(e) => {
                const id =
                  e.target.value;

                setProducerId(id);

                const selected =
                  producers.find(
                    (producer) =>
                      String(
                        producer.id
                      ) === id
                  );

                setProducerPhone(
                  selected?.phone ?? ""
                );
              }}
              disabled={saving}
            >
              <option value="">
                اختر المنتج
              </option>

              {producers.map(
                (producer) => (
                  <option
                    key={producer.id}
                    value={producer.id}
                  >
                    {producer.full_name}
                  </option>
                )
              )}
            </select>

            <div className="rounded-lg border bg-slate-50 p-3">
              <div className="text-sm font-semibold text-slate-500">
                رقم هاتف المنتج
              </div>

              <div className="mt-1 font-bold">
                {producerPhone ||
                  "اختر المنتج أولاً"}
              </div>
            </div>

            <select
              className="rounded-lg border p-3"
              value={captainId}
              onChange={(e) => {
                const id =
                  e.target.value;

                setCaptainId(id);

                const selected =
                  captains.find(
                    (captain) =>
                      String(
                        captain.id
                      ) === id
                  );

                setCaptainPhone(
                  selected?.phone ?? ""
                );
              }}
              disabled={saving}
            >
              <option value="">
                اختر الكابتن
              </option>

              {captains.map(
                (captain) => (
                  <option
                    key={captain.id}
                    value={captain.id}
                  >
                    {captain.full_name}
                    {!captain.status
                      ? " - غير فعّال"
                      : ""}
                  </option>
                )
              )}
            </select>

            <div className="rounded-lg border bg-slate-50 p-3">
              <div className="text-sm font-semibold text-slate-500">
                رقم هاتف الكابتن
              </div>

              <div className="mt-1 font-bold">
                {captainPhone ||
                  "اختر الكابتن أولاً"}
              </div>
            </div>

            <select
              className="rounded-lg border p-3"
              value={orderType}
              onChange={(e) =>
                setOrderType(
                  e.target.value
                )
              }
              disabled={saving}
            >
              <option value="راكب">
                راكب
              </option>

              <option value="اوردر">
                أوردر
              </option>
            </select>

            <input
              type="number"
              min="0.01"
              step="0.01"
              className="rounded-lg border p-3"
              placeholder="قيمة الطلب"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
              disabled={saving}
            />

            <button
              onClick={saveOrder}
              disabled={saving}
              className="rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
            >
              {saving
                ? "جاري حفظ الطلب..."
                : "حفظ الطلب"}
            </button>

          </div>
        </div>

        {/* FILTERS */}

        <div className="mb-5 rounded-2xl bg-white p-5 shadow">

          <div className="grid gap-4 md:grid-cols-2">

            <input
              type="text"
              placeholder="ابحث برقم الطلب، الكابتن، المنتج أو الهاتف..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="rounded-lg border p-3 outline-none focus:border-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="rounded-lg border p-3"
            >
              <option value="all">
                جميع الحالات
              </option>

              <option value="completed">
                مكتمل
              </option>

              <option value="cancelled">
                ملغي
              </option>
            </select>

          </div>
        </div>

        {/* ORDERS */}

        <div className="overflow-hidden rounded-2xl bg-white shadow">

          <div className="border-b p-5">
            <h2 className="text-xl font-black">
              جميع الطلبات
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              عدد النتائج:{" "}
              {filteredOrders.length}
            </p>
          </div>

          {loadingOrders ? (
            <div className="p-10 text-center text-gray-500">
              جاري تحميل الطلبات...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              لا توجد طلبات مطابقة.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1350px] text-right">

                <thead className="bg-slate-100 text-sm">

                  <tr>

                    <th className="p-4">
                      #
                    </th>

                    <th className="p-4">
                      المنتج
                    </th>

                    <th className="p-4">
                      الكابتن
                    </th>

                    <th className="p-4">
                      النوع
                    </th>

                    <th className="p-4">
                      القيمة
                    </th>

                    <th className="p-4">
                      عمولة الكابتن
                    </th>

                    <th className="p-4">
                      عمولة المنتج
                    </th>

                    <th className="p-4">
                      الحالة
                    </th>

                    <th className="p-4">
                      التاريخ
                    </th>

                    <th className="p-4">
                      الإجراءات
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredOrders.map(
                    (order) => (

                      <tr
                        key={order.id}
                        className="border-t hover:bg-slate-50"
                      >

                        <td className="p-4 font-bold">
                          #{order.id}
                        </td>

                        <td className="p-4">

                          <div className="font-bold">
                            {getUserName(
                              order.producer_id,
                              producers
                            )}
                          </div>

                          <div className="text-xs text-gray-400">
                            {order.customer_phone ??
                              "-"}
                          </div>

                        </td>

                        <td className="p-4 font-bold">
                          {getUserName(
                            order.captain_id,
                            captains
                          )}
                        </td>

                        <td className="p-4">

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                            {order.order_type}
                          </span>

                        </td>

                        <td className="p-4 font-bold">
                          {Number(
                            order.amount
                          ).toFixed(2)}{" "}
                          JD
                        </td>

                        <td className="p-4 font-bold text-purple-600">
                          {Number(
                            order.captain_commission
                          ).toFixed(2)}{" "}
                          JD
                        </td>

                        <td className="p-4 font-bold text-orange-600">
                          {Number(
                            order.producer_commission
                          ).toFixed(2)}{" "}
                          JD
                        </td>

                        <td className="p-4">

                          {order.status ===
                          "cancelled" ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                              ملغي
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                              مكتمل
                            </span>
                          )}

                        </td>

                        <td className="p-4 text-sm text-gray-500">
                          {formatDate(
                            order.created_at
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="p-4">

                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEditOrder(
                                  order
                                )
                              }
                              disabled={
                                order.status ===
                                  "cancelled" ||
                                order.is_settled
                              }
                              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              ✏️ تعديل
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                cancelOrder(
                                  order
                                )
                              }
                              disabled={
                                order.status ===
                                  "cancelled" ||
                                order.is_settled ||
                                cancellingId ===
                                  order.id
                              }
                              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {cancellingId ===
                              order.id
                                ? "جاري الإلغاء..."
                                : "❌ إلغاء"}
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* =========================
          EDIT MODAL
      ========================= */}

      {editingOrder && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div
            dir="rtl"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-black">
                  تعديل الطلب #
                  {editingOrder.id}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  عدّل بيانات الطلب ثم احفظ
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingOrder(null)
                }
                disabled={editSaving}
                className="rounded-lg bg-gray-100 px-4 py-2 text-xl font-bold hover:bg-gray-200"
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <div className="grid gap-4 md:grid-cols-2">

              {/* CUSTOMER */}

              <div>

                <label className="mb-1 block text-sm font-bold">
                  اسم العميل
                </label>

                <input
                  type="text"
                  value={
                    editingOrder.customer_name
                  }
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      customer_name:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* PHONE */}

              <div>

                <label className="mb-1 block text-sm font-bold">
                  رقم العميل
                </label>

                <input
                  type="text"
                  value={
                    editingOrder.customer_phone ??
                    ""
                  }
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      customer_phone:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* PRODUCER */}

              <div>

                <label className="mb-1 block text-sm font-bold">
                  المنتج
                </label>

                <select
                  value={
                    editingOrder.producer_id ??
                    ""
                  }
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      producer_id:
                        e.target.value
                          ? Number(
                              e.target.value
                            )
                          : null,
                    })
                  }
                  className="w-full rounded-lg border p-3"
                >

                  <option value="">
                    اختر المنتج
                  </option>

                  {producers.map(
                    (producer) => (

                      <option
                        key={producer.id}
                        value={producer.id}
                      >
                        {producer.full_name}
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* CAPTAIN */}

              <div>

                <label className="mb-1 block text-sm font-bold">
                  الكابتن
                </label>

                <select
                  value={
                    editingOrder.captain_id ??
                    ""
                  }
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      captain_id:
                        e.target.value
                          ? Number(
                              e.target.value
                            )
                          : null,
                    })
                  }
                  className="w-full rounded-lg border p-3"
                >

                  <option value="">
                    اختر الكابتن
                  </option>

                  {captains.map(
                    (captain) => (

                      <option
                        key={captain.id}
                        value={captain.id}
                      >
                        {captain.full_name}
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* TYPE */}

              <div>

                <label className="mb-1 block text-sm font-bold">
                  نوع الطلب
                </label>

                <select
                  value={
                    editingOrder.order_type
                  }
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      order_type:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border p-3"
                >

                  <option value="راكب">
                    راكب
                  </option>

                  <option value="اوردر">
                    أوردر
                  </option>

                </select>

              </div>

              {/* AMOUNT */}

              <div>

                <label className="mb-1 block text-sm font-bold">
                  قيمة الطلب
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    editingOrder.amount
                  }
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      amount:
                        Number(
                          e.target.value
                        ),
                    })
                  }
                  className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                />

              </div>

            </div>

            {/* BUTTONS */}

            <div className="mt-7 flex gap-3">

              <button
                type="button"
                onClick={updateOrder}
                disabled={editSaving}
                className="flex-1 rounded-lg bg-blue-600 p-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editSaving
                  ? "جاري حفظ التعديل..."
                  : "💾 حفظ التعديل"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setEditingOrder(null)
                }
                disabled={editSaving}
                className="rounded-lg bg-gray-200 px-6 py-3 font-bold hover:bg-gray-300 disabled:opacity-50"
              >
                إغلاق
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}