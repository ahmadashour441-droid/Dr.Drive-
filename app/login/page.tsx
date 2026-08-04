"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!phone.trim() || !code.trim()) {
      alert("يرجى إدخال رقم الهاتف وكود الدخول");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.trim(),
          code: code.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error);
        return;
      }

      router.refresh();

      if (result.user.is_admin) {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  }

  return (
  <main className="min-h-screen bg-slate-100">

    <div className="flex min-h-screen items-center justify-center p-6">

  <form
    onSubmit={handleLogin}
    className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
  >

    <Image
      src="/login-vip.png"
      alt="DR.Drive"
      width={450}
      height={280}
      className="mb-6 w-full rounded-2xl object-cover"
      priority
    />

          <h1 className="text-center text-4xl font-extrabold text-blue-600">
            DR.Drive وصلني الآن
          </h1>

          <p className="mt-2 mb-8 text-center text-gray-500">
            مرحباً بك، سجل الدخول للمتابعة
          </p>

          <label className="mb-2 block font-semibold">
            رقم الهاتف
          </label>

          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="079xxxxxxxx"
            className="mb-5 w-full rounded-xl border p-3 outline-none focus:border-blue-600"
          />

          <label className="mb-2 block font-semibold">
            رمز الدخول
          </label>

          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="1234"
            className="mb-8 w-full rounded-xl border p-3 outline-none focus:border-blue-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "جاري تسجيل الدخول..."
              : "تسجيل الدخول"}
          </button>

            </form>

  </div>

</main>
  );
}