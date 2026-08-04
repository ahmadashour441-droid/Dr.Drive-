"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [passengerCommission, setPassengerCommission] = useState("");
  const [orderCommission, setOrderCommission] = useState("");
  const [adminCommission, setAdminCommission] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data, error } = await supabase
  .from("Settings")
  .select("*")
  .limit(1)
  .maybeSingle();

    if (error) {
      alert(error.message);
      return;
    }

    setPassengerCommission(
      String(data.passenger_commission)
    );

    setOrderCommission(
      String(data.order_commission)
    );

    setAdminCommission(
      String(data.admin_commission)
    );

    setLoading(false);
  }

  async function saveSettings() {
    const { error } = await supabase
      .from("Settings")
      .update({
        passenger_commission:
          Number(passengerCommission),

        order_commission:
          Number(orderCommission),

        admin_commission:
          Number(adminCommission),
      })
      .eq("id", 1);

    if (error) {
      alert(error.message);
      return;
    }

    alert("تم حفظ الإعدادات بنجاح");
  }

  if (loading) {
    return (
      <div className="p-10 text-center">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">
        إعدادات العمولات
      </h1>

      <div className="space-y-5">

        <div>
          <label className="block mb-2">
            عمولة الراكب (%)
          </label>

          <input
            type="number"
            className="border rounded-lg p-3 w-full"
            value={passengerCommission}
            onChange={(e)=>
              setPassengerCommission(e.target.value)
            }
          />
        </div>

        <div>
          <label className="block mb-2">
            عمولة الأوردر (%)
          </label>

          <input
            type="number"
            className="border rounded-lg p-3 w-full"
            value={orderCommission}
            onChange={(e)=>
              setOrderCommission(e.target.value)
            }
          />
        </div>
                <div>
          <label className="block mb-2">
            عمولة الإدارة (%)
          </label>

          <input
            type="number"
            className="border rounded-lg p-3 w-full"
            value={adminCommission}
            onChange={(e) =>
              setAdminCommission(e.target.value)
            }
          />
        </div>

        <button
          onClick={saveSettings}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3"
        >
          حفظ الإعدادات
        </button>

      </div>

    </div>
  );
}