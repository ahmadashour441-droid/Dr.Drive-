"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  id: number;
  full_name: string;
  is_captain: boolean;
  is_producer: boolean;
};

type Settings = {
  passenger_commission: number;
  order_commission: number;
  admin_commission: number;
};

export default function OrdersPage() {
  const [captains, setCaptains] = useState<User[]>([]);
  const [producers, setProducers] = useState<User[]>([]);

  const [settings, setSettings] = useState<Settings>({
    passenger_commission: 15,
    order_commission: 20,
    admin_commission: 3,
  });

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [producerId, setProducerId] = useState("");
  const [captainId, setCaptainId] = useState("");
  const [orderType, setOrderType] = useState("راكب");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    loadUsers();
    loadSettings();
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

    setCaptains(data.filter((u) => u.is_captain));
    setProducers(data.filter((u) => u.is_producer));
  }

  async function loadSettings() {
    const { data } = await supabase
      .from("Settings")
      .select("*")
      .single();

    if (data) {
      setSettings(data);
    }
  }
  async function saveOrder() {

  if (
    !customerName ||
    !customerPhone ||
    !producerId ||
    !captainId ||
    !amount
  ) {
    alert("يرجى تعبئة جميع الحقول");
    return;
  }

  const value = Number(amount);

  const producerPercent =
    orderType === "راكب"
      ? settings.passenger_commission
      : settings.order_commission;

  const producerCommission = Number(
    (value * producerPercent / 100).toFixed(2)
  );

  const adminCommission = Number(
    (value * settings.admin_commission / 100).toFixed(2)
  );

  const netProducerCommission = Number(
    (producerCommission - adminCommission).toFixed(2)
  );

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

  // التحقق هل الأرضية احتسبت هذا الأسبوع

  const {
    data: floorRows,
    error: floorError,
  } = await supabase
    .from("BalanceTransactions")
    .select("id")
    .eq("user_id", Number(captainId))
    .eq(
      "description",
      "الأرضية الأسبوعية"
    )
    .eq(
      "week_start",
      weekStartText
    );

  if (floorError) {
    alert(floorError.message);
    return;
  }

  const firstOrderThisWeek =
    !floorRows ||
    floorRows.length === 0;
      // إنشاء الطلب

  const { data: order, error: orderError } =
    await supabase
      .from("Orders")
      .insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        producer_id: Number(producerId),
        captain_id: Number(captainId),
        order_type: orderType,
        amount: value,
        producer_commission: producerCommission,
        admin_commission: adminCommission,
        net_producer_commission: netProducerCommission,
        captain_commission: producerCommission,
        captain_due: producerCommission,
        week_start: weekStartText,
        week_end: weekEndText,
        status: "completed",
        is_settled: false,
      })
      .select()
      .single();

  if (orderError) {
    alert(orderError.message);
    return;
  }
  const producer = producers.find(
  (p) => p.id === Number(producerId)
);

  const transactions = [];

  // الأرضية (مرة واحدة فقط)

  if (firstOrderThisWeek) {

    transactions.push({
      user_id: Number(captainId),
      order_id: null,
      type: "debit",
      amount: 1,
      description: "الأرضية الأسبوعية",
      week_start: weekStartText,
      week_end: weekEndText,
      is_settled: false,
    });

  }

  // مستحق الكابتن

  transactions.push({
    user_id: Number(captainId),
    order_id: order.id,
    type: "debit",
    amount: producerCommission,
    description: `عمولة ${orderType} - المنتج: ${producer?.full_name ?? ""}`,
    week_start: weekStartText,
    week_end: weekEndText,
    is_settled: false,
  });

  // مستحق المنتج

  transactions.push({
    user_id: Number(producerId),
    order_id: order.id,
    type: "credit",
    amount: netProducerCommission,
    description: `عمولة المنتج - ${customerName}`,
    week_start: weekStartText,
    week_end: weekEndText,
    is_settled: false,
  });
    // حفظ الحركات

  const { error: trxError } =
    await supabase
      .from("BalanceTransactions")
      .insert(transactions);

  if (trxError) {
    alert(trxError.message);
    return;
  }

  // تحميل رصيد الكابتن الحالي

  const { data: captain, error: captainError } =
    await supabase
      .from("Users")
      .select("wallet_balance")
      .eq("id", Number(captainId))
      .single();

  if (captainError || !captain) {
    alert("تعذر تحميل رصيد الكابتن");
    return;
  }

  // مقدار الخصم

  let deduction = producerCommission;

  if (firstOrderThisWeek) {
    deduction += 1;
  }

  // تحديث المحفظة

  const { error: walletError } =
    await supabase
      .from("Users")
      .update({
        wallet_balance:
          Number(captain.wallet_balance) -
          deduction,
      })
      .eq("id", Number(captainId));

  if (walletError) {
    alert(walletError.message);
    return;
  }

  alert("تم حفظ الطلب بنجاح");

  setCustomerName("");
  setCustomerPhone("");
  setProducerId("");
  setCaptainId("");
  setAmount("");
  setOrderType("راكب");

}

return (
  <main className="p-8">

    <h1 className="text-3xl font-bold mb-8">
      إضافة طلب جديد
    </h1>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">

      <input
        className="border rounded-lg p-3"
        placeholder="اسم العميل"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />

      <input
        className="border rounded-lg p-3"
        placeholder="رقم الهاتف"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
      />

      <select
        className="border rounded-lg p-3"
        value={producerId}
        onChange={(e) => setProducerId(e.target.value)}
      >
        <option value="">اختر المنتج</option>

        {producers.map((producer) => (
          <option
            key={producer.id}
            value={producer.id}
          >
            {producer.full_name}
          </option>
        ))}

      </select>

      <select
        className="border rounded-lg p-3"
        value={captainId}
        onChange={(e) => setCaptainId(e.target.value)}
      >
        <option value="">اختر الكابتن</option>

        {captains.map((captain) => (
          <option
            key={captain.id}
            value={captain.id}
          >
            {captain.full_name}
          </option>
        ))}

      </select>

      <select
        className="border rounded-lg p-3"
        value={orderType}
        onChange={(e) => setOrderType(e.target.value)}
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
        className="border rounded-lg p-3"
        placeholder="قيمة الطلب"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button
        onClick={saveOrder}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 md:col-span-2"
      >
        حفظ الطلب
      </button>

    </div>

    <div className="mt-8 bg-gray-50 border rounded-xl p-5 max-w-4xl">

      <h2 className="font-bold text-lg mb-4">
        النسب الحالية
      </h2>

      <div className="grid grid-cols-3 gap-4">

        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-gray-500">
            راكب
          </div>

          <div className="text-2xl font-bold text-green-600">
            {settings.passenger_commission}%
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-gray-500">
            أوردر
          </div>

          <div className="text-2xl font-bold text-blue-600">
            {settings.order_commission}%
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-gray-500">
            الإدارة
          </div>

          <div className="text-2xl font-bold text-red-600">
            {settings.admin_commission}%
          </div>
        </div>

      </div>

    </div>

  </main>
);
}