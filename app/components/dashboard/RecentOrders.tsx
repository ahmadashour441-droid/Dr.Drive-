"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Order = {
  id: number;
  captain_name: string;
  producer_name: string;
  amount: number;
  status: string;
};

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const { data } = await supabase
      .from("Orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(10);

    setOrders((data as Order[]) || []);
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm">

      <div className="border-b p-6">
        <h2 className="text-xl font-bold">
          آخر الطلبات
        </h2>
      </div>

      {loading ? (
        <div className="p-10 text-center">
          Loading...
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr className="text-right">

                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">الكابتن</th>
                <th className="px-6 py-4">المنتج</th>
                <th className="px-6 py-4">القيمة</th>
                <th className="px-6 py-4">الحالة</th>

              </tr>

            </thead>

            <tbody>

              {orders.map((order) => (

                <tr
                  key={order.id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="px-6 py-4 font-semibold">
                    #{order.id}
                  </td>

                  <td className="px-6 py-4">
                    {order.captain_name}
                  </td>

                  <td className="px-6 py-4">
                    {order.producer_name}
                  </td>

                  <td className="px-6 py-4 font-bold text-green-600">
                    {order.amount} JD
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-sm ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}