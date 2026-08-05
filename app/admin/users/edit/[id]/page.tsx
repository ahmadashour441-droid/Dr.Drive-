"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loginCode, setLoginCode] = useState("");

  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [role, setRole] = useState("captain");
  const [status, setStatus] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !data) {
      alert("المستخدم غير موجود");
      router.push("/admin/users");
      return;
    }

    setFullName(data.full_name);
    setPhone(data.phone || "");
    setLoginCode(data.login_code);
    setVehicleType(data.vehicle_type || "");
    setVehicleNumber(data.vehicle_number || "");
    setStatus(data.status);

    if (data.is_admin) {
      setRole("admin");
    } else if (data.is_producer) {
      setRole("producer");
    } else {
      setRole("captain");
    }

    setLoading(false);
  }

  async function updateUser() {
    if (!fullName || !loginCode) {
      alert("يرجى تعبئة الحقول المطلوبة");
      return;
    }

    setSaving(true);

    const result = await supabase
  .from("Users")
  .update({
    full_name: fullName,
    phone: phone,
    login_code: loginCode,
    vehicle_type: vehicleType,
    vehicle_number: vehicleNumber,
    status: status,
    is_admin: role === "admin",
    is_captain: role === "captain",
    is_producer: role === "producer",
  })
  .eq("id", params.id)
  .select();

console.log(result);

const error = result.error;

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("تم تحديث المستخدم");

    router.push("/admin/users");
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl font-bold">
        Loading...
      </div>
    );
  }

  return (
  <div className="p-8">

    <main>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">

            <h1 className="text-3xl font-bold mb-8">
              تعديل المستخدم
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

              <div>
                <label className="font-medium">
                  حالة المستخدم
                </label>

                <select
                  className="w-full mt-2 border rounded-lg p-3"
                  value={status ? "active" : "inactive"}
                  onChange={(e) =>
                    setStatus(
                      e.target.value === "active"
                    )
                  }
                >
                  <option value="active">
                    نشط
                  </option>

                  <option value="inactive">
                    موقوف
                  </option>

                </select>
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
                onClick={updateUser}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl disabled:opacity-50"
              >
                {saving
                  ? "جاري الحفظ..."
                  : "حفظ التعديلات"}
              </button>

            </div>

          </div>

              </main>

  </div>
  );
}
