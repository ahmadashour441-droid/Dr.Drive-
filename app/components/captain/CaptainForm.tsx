"use client";

import { useState } from "react";

type CaptainFormProps = {
  onSubmit: (captain: {
    full_name: string;
    phone: string;
    login_code: string;
    vehicle_type: string;
    vehicle_number: string;
    status: boolean;
  }) => void;
};

export default function CaptainForm({ onSubmit }: CaptainFormProps) {
  const [full_name, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [login_code, setLoginCode] = useState("");
  const [vehicle_type, setVehicleType] = useState("");
  const [vehicle_number, setVehicleNumber] = useState("");
  const [status, setStatus] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !full_name ||
      !phone ||
      !login_code ||
      !vehicle_type ||
      !vehicle_number
    ) {
      alert("يرجى تعبئة جميع الحقول");
      return;
    }

    onSubmit({
      full_name,
      phone,
      login_code,
      vehicle_type,
      vehicle_number,
      status,
    });

    setFullName("");
    setPhone("");
    setLoginCode("");
    setVehicleType("");
    setVehicleNumber("");
    setStatus(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: "12px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        marginBottom: "20px",
      }}
    >
      <input
        placeholder="الاسم الكامل"
        value={full_name}
        onChange={(e) => setFullName(e.target.value)}
      />

      <input
        placeholder="رقم الهاتف"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        placeholder="كود الدخول"
        value={login_code}
        onChange={(e) => setLoginCode(e.target.value)}
      />

      <input
        placeholder="نوع المركبة"
        value={vehicle_type}
        onChange={(e) => setVehicleType(e.target.value)}
      />

      <input
        placeholder="رقم المركبة"
        value={vehicle_number}
        onChange={(e) => setVehicleNumber(e.target.value)}
      />

      <label>
        <input
          type="checkbox"
          checked={status}
          onChange={(e) => setStatus(e.target.checked)}
        />
        كابتن نشط
      </label>

      <button type="submit">
        إضافة كابتن
      </button>
    </form>
  );
}