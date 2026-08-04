"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


export default function AddUserPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loginCode, setLoginCode] = useState("");

  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [role, setRole] = useState("captain");

  async function saveUser() {
    if (
      !fullName ||
      !phone ||
      !loginCode
    ) {
      alert("يرجى تعبئة جميع الحقول");
      return;
    }

    setLoading(true);

const response = await fetch("/api/users/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    full_name: fullName,
    phone,
    login_code: loginCode,
    vehicle_type: vehicleType,
    vehicle_number: vehicleNumber,
    role,
  }),
});

const result = await response.json();

setLoading(false);

if (!response.ok) {
  alert(result.error);
  return;
}

alert("تم إضافة المستخدم");

router.push("/admin/users");
  }

  return (
  <div className="p-8">
    <main>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">

            <h1 className="text-3xl font-bold mb-8">
              إضافة مستخدم جديد
            </h1>
                        <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="font-medium">
                  الاسم الكامل
                </label>

                <input
                  className="w-full mt-2 border rounded-lg p-3"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                />
              </div>

              <div>
                <label className="font-medium">
                  رقم الهاتف
                </label>

                <input
                  className="w-full mt-2 border rounded-lg p-3"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                />
              </div>

              <div>
                <label className="font-medium">
                  رمز الدخول
                </label>

                <input
                  className="w-full mt-2 border rounded-lg p-3"
                  value={loginCode}
                  onChange={(e) =>
                    setLoginCode(e.target.value)
                  }
                />
              </div>

              <div>
                <label className="font-medium">
                  الصلاحية
                </label>

                <select
                  className="w-full mt-2 border rounded-lg p-3"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                >
                  <option value="captain">
                    كابتن
                  </option>

                  <option value="producer">
                    منتج
                  </option>

                  <option value="admin">
                    مدير
                  </option>

                </select>
              </div>

              <div>
                <label className="font-medium">
                  نوع المركبة
                </label>

                <input
                  className="w-full mt-2 border rounded-lg p-3"
                  value={vehicleType}
                  onChange={(e) =>
                    setVehicleType(e.target.value)
                  }
                />
              </div>

              <div>
                <label className="font-medium">
                  رقم المركبة
                </label>

                <input
                  className="w-full mt-2 border rounded-lg p-3"
                  value={vehicleNumber}
                  onChange={(e) =>
                    setVehicleNumber(e.target.value)
                  }
                />
              </div>

            </div>

            <div className="mt-10 flex justify-end gap-3">

              <button
                onClick={() =>
                  router.push("/admin/users")
                }
                className="border px-6 py-3 rounded-xl hover:bg-gray-100"
              >
                إلغاء
              </button>

              <button
                onClick={saveUser}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl disabled:opacity-50"
              >
                {loading
                  ? "جاري الحفظ..."
                  : "حفظ المستخدم"}
              </button>

            </div>

          </div>

              </main>
  </div>
  );
}