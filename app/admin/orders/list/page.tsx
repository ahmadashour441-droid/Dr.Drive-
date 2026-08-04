"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Order = {
  id: number;
  customer_name: string;
  customer_phone: string;
  order_type: string;
  amount: number;
  producer_commission: number;
  status: string;
  created_at: string;
};

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const { data, error } = await supabase
      .from("Orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setOrders(data || []);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        جميع الطلبات
      </h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3">#</th>

              <th className="p-3">العميل</th>

              <th className="p-3">الهاتف</th>

              <th className="p-3">النوع</th>

              <th className="p-3">المبلغ</th>

              <th className="p-3">العمولة</th>

              <th className="p-3">الحالة</th>

            </tr>

          </thead>

          <tbody>

            {orders.map((order) => (

              <tr
                key={order.id}
                className="border-t"
              >

                <td className="p-3">{order.id}</td>

                <td className="p-3">{order.customer_name}</td>

                <td className="p-3">{order.customer_phone}</td>

                <td className="p-3">{order.order_type}</td>

                <td className="p-3">{order.amount}</td>

                <td className="p-3">
                  {order.producer_commission}
                </td>

                <td className="p-3">
                  {order.status}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>
    </div>
  );
}