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
    try {
      setLoading(true);

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

      setFullName(data.full_name ?? "");
      setPhone(data.phone ?? "");
      setLoginCode(data.login_code ?? "");

      setVehicleType(
        data.vehicle_type ?? ""
      );

      setVehicleNumber(
        data.vehicle_number ?? ""
      );

      setStatus(
        data.status === true
      );

      if (data.is_admin) {
        setRole("admin");
      } else if (data.is_producer) {
        setRole("producer");
      } else {
        setRole("captain");
      }

    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ??
          "حدث خطأ أثناء تحميل المستخدم"
      );

      router.push("/admin/users");

    } finally {
      setLoading(false);
    }
  }

  async function updateUser() {
    if (!fullName.trim()) {
      alert("يرجى إدخال الاسم الكامل");
      return;
    }

    if (!loginCode.trim()) {
      alert("يرجى إدخال رمز الدخول");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/users/update",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: Number(params.id),

            full_name:
              fullName.trim(),

            phone:
              phone.trim(),

            login_code:
              loginCode.trim(),

            vehicle_type:
              vehicleType.trim(),

            vehicle_number:
              vehicleNumber.trim(),

            status,

            is_admin:
              role === "admin",

            is_captain:
              role === "captain",

            is_producer:
              role === "producer",
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result?.error ??
            "تعذر تحديث المستخدم"
        );

        return;
      }

      alert("تم تحديث المستخدم بنجاح");

      router.push("/admin/users");

      router.refresh();

    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ??
          "حدث خطأ أثناء تحديث المستخدم"
      );

    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-100"
      >
        <div className="text-xl font-bold">
          جاري تحميل بيانات المستخدم...
        </div>
      </div>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8"
    >
      <div className="mx-auto max-w-4xl">

        <div className="rounded-2xl bg-white p-5 shadow sm:p-8">

          <div className="mb-8">

            <h1 className="text-2xl font-black text-slate-800 sm:text-3xl">
              تعديل المستخدم
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              يمكنك تعديل بيانات المستخدم وصلاحياته وحالته.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {/* الاسم الكامل */}

            <div>

              <label className="font-bold text-slate-700">
                الاسم الكامل
              </label>

              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                disabled={saving}
              />

            </div>

            {/* رقم الهاتف */}

            <div>

              <label className="font-bold text-slate-700">
                رقم الهاتف
              </label>

              <input
                type="tel"
                className="mt-2 w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                disabled={saving}
              />

            </div>

            {/* رمز الدخول */}

            <div>

              <label className="font-bold text-slate-700">
                رمز الدخول
              </label>

              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={loginCode}
                onChange={(e) =>
                  setLoginCode(e.target.value)
                }
                disabled={saving}
              />

            </div>

            {/* الصلاحية */}

            <div>

              <label className="font-bold text-slate-700">
                الصلاحية
              </label>

              <select
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                disabled={saving}
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

            {/* نوع المركبة */}

            <div>

              <label className="font-bold text-slate-700">
                نوع المركبة
              </label>

              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={vehicleType}
                onChange={(e) =>
                  setVehicleType(e.target.value)
                }
                disabled={saving}
              />

            </div>

            {/* رقم المركبة */}

            <div>

              <label className="font-bold text-slate-700">
                رقم المركبة
              </label>

              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={vehicleNumber}
                onChange={(e) =>
                  setVehicleNumber(e.target.value)
                }
                disabled={saving}
              />

            </div>

            {/* الحالة */}

            <div>

              <label className="font-bold text-slate-700">
                حالة المستخدم
              </label>

              <select
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={
                  status
                    ? "active"
                    : "inactive"
                }
                onChange={(e) =>
                  setStatus(
                    e.target.value ===
                      "active"
                  )
                }
                disabled={saving}
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

          {/* الأزرار */}

          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                router.push("/admin/users")
              }
              disabled={saving}
              className="rounded-xl border border-slate-300 px-6 py-3 font-bold transition hover:bg-slate-100 disabled:opacity-50"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={updateUser}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "جاري الحفظ..."
                : "حفظ التعديلات"}
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}