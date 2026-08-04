"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import Sidebar from "@/app/components/dashboard/Sidebar";
import Navbar from "@/app/components/dashboard/Navbar";

type User = {
  id: number;
  full_name: string;
};

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [captains, setCaptains] = useState<User[]>([]);
  const [producers, setProducers] = useState<User[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [captainId, setCaptainId] = useState("");
  const [producerId, setProducerId] = useState("");

  const [orderType, setOrderType] = useState("Passenger");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [
      captainsRes,
      producersRes,
      orderRes,
    ] = await Promise.all([
      supabase
        .from("Users")
        .select("id,full_name")
        .eq("is_captain", true),

      supabase
        .from("Users")
        .select("id,full_name")
        .eq("is_producer", true),

      supabase
        .from("Orders")
        .select("*")
        .eq("id", params.id)
        .single(),
    ]);

    setCaptains(captainsRes.data || []);
    setProducers(producersRes.data || []);

    if (orderRes.data) {
      const order = orderRes.data;

      setCustomerName(order.customer_name);
      setCustomerPhone(order.customer_phone || "");
      setCaptainId(String(order.captain_id));
      setProducerId(String(order.producer_id));
      setOrderType(order.order_type);
      setAmount(String(order.amount));
    }

    setLoading(false);
  }

  async function updateOrder() {
    setSaving(true);

    const total = Number(amount);

    let producerCommission = 0;
    let adminCommission = 0;
    let netProducerCommission = 0;

    if (orderType === "Passenger") {
      producerCommission = total * 0.15;
    } else {
      producerCommission = total * 0.20;
    }

    adminCommission = total * 0.02;

    netProducerCommission =
      producerCommission - adminCommission;
          const { error } = await supabase
      .from("Orders")
      .update({
        customer_name: customerName,
        customer_phone: customerPhone,
        captain_id: Number(captainId),
        producer_id: Number(producerId),
        order_type: orderType,
        amount: total,
        producer_commission: producerCommission,
        admin_commission: adminCommission,
        net_producer_commission:
          netProducerCommission,
      })
      .eq("id", params.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("تم تحديث الطلب بنجاح");

    router.push("/orders/list");
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl font-bold">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Navbar fullName="Administrator" />

        <main className="p-6">

          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">

            <h1 className="text-3xl font-bold mb-8">
              تعديل الطلب
            </h1>

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="font-medium">
                  اسم العميل
                </label>

                <input
                  className="w-full mt-2 border rounded-lg p-3"
                  value={customerName}
                  onChange={(e) =>
                    setCustomerName(e.target.value)
                  }
                />
              </div>

              <div>
                <label className="font-medium">
                  رقم العميل
                </label>

                <input
                  className="w-full mt-2 border rounded-lg p-3"
                  value={customerPhone}
                  onChange={(e) =>
                    setCustomerPhone(e.target.value)
                  }
                />
              </div>

              <div>
                <label className="font-medium">
                  المنتج
                </label>

                <select
                  className="w-full mt-2 border rounded-lg p-3"
                  value={producerId}
                  onChange={(e) =>
                    setProducerId(e.target.value)
                  }
                >
                  {producers.map((producer) => (
                    <option
                      key={producer.id}
                      value={producer.id}
                    >
                      {producer.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium">
                  الكابتن
                </label>

                <select
                  className="w-full mt-2 border rounded-lg p-3"
                  value={captainId}
                  onChange={(e) =>
                    setCaptainId(e.target.value)
                  }
                >
                  {captains.map((captain) => (
                    <option
                      key={captain.id}
                      value={captain.id}
                    >
                      {captain.full_name}
                    </option>
                  ))}
                </select>
              </div>
                            <div>
                <label className="font-medium">
                  نوع الطلب
                </label>

                <select
                  className="w-full mt-2 border rounded-lg p-3"
                  value={orderType}
                  onChange={(e) =>
                    setOrderType(e.target.value)
                  }
                >
                  <option value="Passenger">
                    راكب
                  </option>

                  <option value="Order">
                    طلب
                  </option>
                </select>
              </div>

              <div>
                <label className="font-medium">
                  قيمة الطلب
                </label>

                <input
                  type="number"
                  className="w-full mt-2 border rounded-lg p-3"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                />
              </div>

            </div>

            <div className="mt-10 flex justify-end gap-3">

              <button
                onClick={() => router.push("/orders/list")}
                className="px-6 py-3 rounded-xl border hover:bg-gray-100"
              >
                إلغاء
              </button>

              <button
                onClick={updateOrder}
                disabled={saving}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "جاري الحفظ..."
                  : "حفظ التعديلات"}
              </button>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}