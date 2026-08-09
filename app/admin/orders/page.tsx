"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  id: number;
  full_name: string;
  is_captain: boolean;
  is_producer: boolean;
  status: boolean;
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
    admin_commission: 2,
  });

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [producerId, setProducerId] = useState("");
  const [captainId, setCaptainId] = useState("");
  const [orderType, setOrderType] = useState("راكب");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

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

    setCaptains(
      (data ?? []).filter(
        (u) => u.is_captain
      )
    );

    setProducers(
      (data ?? []).filter(
        (u) => u.is_producer
      )
    );
  }

  async function loadSettings() {
    const { data, error } = await supabase
      .from("Settings")
      .select("*")
      .single();

    if (error) {
      console.warn(
        "تعذر تحميل الإعدادات:",
        error.message
      );
      return;
    }

    if (data) {
      setSettings({
        passenger_commission:
          Number(
            data.passenger_commission
          ),
        order_commission:
          Number(
            data.order_commission
          ),
        admin_commission:
          Number(
            data.admin_commission
          ),
      });
    }
  }

  async function saveOrder() {
    if (saving) return;

    if (
      !customerName.trim() ||
      !customerPhone.trim() ||
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
      /*
       * الحسابات المالية لا تتم في الواجهة.
       *
       * الصفحة ترسل الطلب فقط إلى السيرفر،
       * والـAPI هو مصدر الحقيقة للعمولة
       * والأرضية وخصم المحفظة.
       */
      const response = await fetch(
        "/api/orders/create",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            customerName:
              customerName.trim(),
            customerPhone:
              customerPhone.trim(),
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

      if (result.floorApplied) {
        alert(
          `تم حفظ الطلب.\n\nتم خصم ${deduction.toFixed(
            2
          )} JD من محفظة الكابتن، شاملة الأرضية الأسبوعية.\n\nالرصيد الحالي: ${walletBalance.toFixed(
            2
          )} JD`
        );
      } else {
        alert(
          `تم حفظ الطلب.\n\nتم خصم ${deduction.toFixed(
            2
          )} JD من محفظة الكابتن.\n\nالرصيد الحالي: ${walletBalance.toFixed(
            2
          )} JD`
        );
      }

      setCustomerName("");
      setCustomerPhone("");
      setProducerId("");
      setCaptainId("");
      setAmount("");
      setOrderType("راكب");
    } catch (error: any) {
      alert(
        error?.message ??
          "حدث خطأ أثناء حفظ الطلب"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">
        إضافة طلب جديد
      </h1>

      <div className="grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">

        <input
          className="rounded-lg border p-3"
          placeholder="اسم العميل"
          value={customerName}
          onChange={(e) =>
            setCustomerName(
              e.target.value
            )
          }
          disabled={saving}
        />

        <input
          className="rounded-lg border p-3"
          placeholder="رقم الهاتف"
          value={customerPhone}
          onChange={(e) =>
            setCustomerPhone(
              e.target.value
            )
          }
          disabled={saving}
        />

        <select
          className="rounded-lg border p-3"
          value={producerId}
          onChange={(e) =>
            setProducerId(
              e.target.value
            )
          }
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

        <select
          className="rounded-lg border p-3"
          value={captainId}
          onChange={(e) =>
            setCaptainId(
              e.target.value
            )
          }
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

      <div className="mt-8 max-w-4xl rounded-xl border bg-gray-50 p-5">

        <h2 className="mb-4 text-lg font-bold">
          النسب الحالية
        </h2>

        <div className="grid grid-cols-3 gap-4">

          <div className="rounded-lg border bg-white p-4 text-center">

            <div className="text-gray-500">
              راكب
            </div>

            <div className="text-2xl font-bold text-green-600">
              {settings.passenger_commission}%
            </div>

          </div>

          <div className="rounded-lg border bg-white p-4 text-center">

            <div className="text-gray-500">
              أوردر
            </div>

            <div className="text-2xl font-bold text-blue-600">
              {settings.order_commission}%
            </div>

          </div>

          <div className="rounded-lg border bg-white p-4 text-center">

            <div className="text-gray-500">
              الإدارة
            </div>

            <div className="text-2xl font-bold text-red-600">
              {settings.admin_commission}%
            </div>

          </div>

        </div>

        <p className="mt-4 text-sm text-gray-500">
          الحساب الفعلي للعمولة والأرضية
          وخصم المحفظة يتم على السيرفر.
        </p>

      </div>
    </>
  );
}