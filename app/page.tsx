"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
  e.preventDefault();

  setLoading(true);

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        code,
      }),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(result.error || "فشل تسجيل الدخول");
      return;
    }

    if (result.user.is_admin) {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  } catch (err) {
    setLoading(false);
    alert("حدث خطأ أثناء تسجيل الدخول");
    console.error(err);
  }
}

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-4xl font-bold text-center text-blue-600">
          DR.Driveوصلني الآن
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          تسجيل الدخول
        </p>

        <label className="block mb-2 font-semibold">
          رقم الهاتف
        </label>

        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="079xxxxxxx"
          className="w-full border rounded-lg p-3 mb-5 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block mb-2 font-semibold">
          كود الدخول
        </label>

        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="1234"
          className="w-full border rounded-lg p-3 mb-8 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
        >
          {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
    </main>
  );
}