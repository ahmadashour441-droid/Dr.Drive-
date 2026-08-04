"use client";

import { useEffect, useState } from "react";

export type User = {
  id?: number;
  full_name: string;
  phone: string;
  login_code: string;
  is_admin: boolean;
  is_captain: boolean;
  is_producer: boolean;
  vehicle_type: string | null;
  vehicle_number: string | null;
  status: boolean;
};

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}

const emptyUser: User = {
  id: undefined,
  full_name: "",
  phone: "",
  login_code: "",
  is_admin: false,
  is_captain: true,
  is_producer: false,
  vehicle_type: null,
  vehicle_number: null,
  status: true,
};

export default function UserModal({
  open,
  user,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<User>(emptyUser);

  useEffect(() => {
    if (user) {
      setForm(user);
    } else {
      setForm(emptyUser);
    }
  }, [user, open]);

  if (!open) return null;

  function updateField(field: keyof User, value: any) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function submit() {
    if (!form.full_name || !form.phone || !form.login_code) {
      alert("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-2xl font-bold mb-6">
          {user ? "تعديل مستخدم" : "إضافة مستخدم"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            className="border rounded-lg p-3"
            placeholder="الاسم الكامل"
            value={form.full_name}
            onChange={(e) => updateField("full_name", e.target.value)}
          />

          <input
            className="border rounded-lg p-3"
            placeholder="رقم الهاتف"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />

          <input
            className="border rounded-lg p-3"
            placeholder="كود الدخول"
            value={form.login_code}
            onChange={(e) => updateField("login_code", e.target.value)}
          />

          <input
            className="border rounded-lg p-3"
            placeholder="نوع المركبة"
            value={form.vehicle_type ?? ""}
            onChange={(e) => updateField("vehicle_type", e.target.value)}
          />

          <input
            className="border rounded-lg p-3"
            placeholder="رقم المركبة"
            value={form.vehicle_number ?? ""}
            onChange={(e) => updateField("vehicle_number", e.target.value)}
          />

          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.status}
                onChange={(e) => updateField("status", e.target.checked)}
              />
              نشط
            </label>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_admin}
              onChange={(e) => updateField("is_admin", e.target.checked)}
            />
            مدير
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_captain}
              onChange={(e) => updateField("is_captain", e.target.checked)}
            />
            كابتن
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_producer}
              onChange={(e) => updateField("is_producer", e.target.checked)}
            />
            منتج
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            إلغاء
          </button>

          <button
            onClick={submit}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}