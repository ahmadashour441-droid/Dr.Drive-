"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import Sidebar from "@/app/components/dashboard/Sidebar";
import Navbar from "@/app/components/dashboard/Navbar";

type Order = {
  id: number;
  customer_name: string;
  customer_phone: string;
  producer_id: number;
  captain_id: number;
  order_type: string;
  amount: number;
  producer_commission: number;
  admin_commission: number;
  net_producer_commission: number;
  captain_commission: number;
  captain_due: number;
  status: string;
  is_settled: boolean;
  created_at: string;
};

type User = {
  id: number;
  full_name: string;
};

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [captains, setCaptains] = useState<User[]>([]);
  const [producers, setProducers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [
      ordersRes,
      captainsRes,
      producersRes,
    ] = await Promise.all([
      supabase
        .from("Orders")
        .select("*")
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("Users")
        .select("id,full_name")
        .eq("is_captain", true),

      supabase
        .from("Users")
        .select("id,full_name")
        .eq("is_producer", true),
    ]);

    setOrders((ordersRes.data as Order[]) || []);
    setCaptains((captainsRes.data as User[]) || []);
    setProducers((producersRes.data as User[]) || []);

    setLoading(false);
  }

  async function deleteOrder(id: number) {
    const confirmDelete = confirm(
      "هل تريد حذف الطلب؟"
    );

    if (!confirmDelete) return;

    await supabase
      .from("Orders")
      .delete()
      .eq("id", id);

    loadData();
  }

  function captainName(id: number) {
    return (
      captains.find((x) => x.id === id)
        ?.full_name || "-"
    );
  }

  function producerName(id: number) {
    return (
      producers.find((x) => x.id === id)
        ?.full_name || "-"
    );
  }

  const filteredOrders = useMemo(() => {
    if (!search) return orders;

    return orders.filter((order) => {
      return (
        order.customer_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        order.customer_phone
          ?.includes(search) ||
        captainName(order.captain_id)
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        producerName(order.producer_id)
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    });
  }, [orders, search]);
    return (
    <div className="min-h-screen bg-slate-100 flex">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Navbar fullName="Administrator" />

        <main className="p-6">

          <div className="bg-white rounded-2xl shadow p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

              <h1 className="text-3xl font-bold">
                جميع الطلبات
              </h1>

              <div className="flex gap-3">

                <input
                  type="text"
                  placeholder="بحث..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="border rounded-xl px-4 py-2 w-72"
                />

                <Link
                  href="/orders"
                  className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700"
                >
                  إضافة طلب
                </Link>

              </div>

            </div>

            {loading ? (

              <div className="text-center py-20">
                Loading...
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="min-w-full">

                  <thead className="bg-slate-100">

                    <tr className="text-right">

                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">العميل</th>
                      <th className="px-4 py-3">الهاتف</th>
                      <th className="px-4 py-3">المنتج</th>
                      <th className="px-4 py-3">الكابتن</th>
                      <th className="px-4 py-3">النوع</th>
                      <th className="px-4 py-3">القيمة</th>
                      <th className="px-4 py-3">المنتج</th>
                      <th className="px-4 py-3">الإدارة</th>
                      <th className="px-4 py-3">الصافي</th>
                      <th className="px-4 py-3">الحالة</th>
                      <th className="px-4 py-3">التسوية</th>
                      <th className="px-4 py-3">الإجراءات</th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredOrders.map((order) => (

                      <tr
                        key={order.id}
                        className="border-b hover:bg-slate-50"
                      >

                        <td className="px-4 py-4 font-semibold">
                          #{order.id}
                        </td>

                        <td className="px-4 py-4">
                          {order.customer_name}
                        </td>

                        <td className="px-4 py-4">
                          {order.customer_phone}
                        </td>

                        <td className="px-4 py-4">
                          {producerName(order.producer_id)}
                        </td>

                        <td className="px-4 py-4">
                          {captainName(order.captain_id)}
                        </td>

                        <td className="px-4 py-4">
                          {order.order_type}
                        </td>

                        <td className="px-4 py-4 font-bold">
                          {order.amount} JD
                        </td>

                        <td className="px-4 py-4 text-green-600 font-semibold">
                          {order.producer_commission} JD
                        </td>

                        <td className="px-4 py-4 text-red-600 font-semibold">
                          {order.admin_commission} JD
                        </td>

                        <td className="px-4 py-4 text-blue-600 font-semibold">
                          {order.net_producer_commission} JD
                        </td>
                                                <td className="px-4 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.status}
                          </span>

                        </td>

                        <td className="px-4 py-4">

                          {order.is_settled ? (

                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                              تمت التسوية
                            </span>

                          ) : (

                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                              غير مسدد
                            </span>

                          )}

                        </td>

                        <td className="px-4 py-4">

                          <div className="flex gap-2">

                            <Link
                              href={`/orders/edit/${order.id}`}
                              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                            >
                              تعديل
                            </Link>

                            <button
                              onClick={() =>
                                deleteOrder(order.id)
                              }
                              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
                            >
                              حذف
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                    {filteredOrders.length === 0 && (

                      <tr>

                        <td
                          colSpan={13}
                          className="text-center py-10 text-gray-500"
                        >
                          لا توجد طلبات
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  );
}