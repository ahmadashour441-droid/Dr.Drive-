"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            phone,
            code,
          }),
        }
      );

      const result =
        await response.json();

      setLoading(false);

      if (!response.ok) {
        alert(
          result.error ||
            "فشل تسجيل الدخول"
        );
        return;
      }

      if (result.user.is_admin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setLoading(false);

      alert(
        "حدث خطأ أثناء تسجيل الدخول"
      );

      console.error(err);
    }
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#07192b]"
    >
      {/* الخلفية */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/login-bg.png')",
        }}
      />

      {/* طبقة خفيفة فوق الخلفية */}
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 min-h-screen px-4 py-8 sm:px-6 lg:px-10">

        {/* ================= LOGO / HEADER ================= */}

        <div className="mx-auto max-w-6xl text-center">

          <div className="flex items-center justify-center gap-2 text-5xl font-black sm:text-6xl">
            <span className="text-yellow-400">
              Dr.
            </span>

            <span className="text-white">
              Drive
            </span>
          </div>

          <div className="mt-1 text-2xl font-bold text-yellow-400 sm:text-3xl">
            وصلني الآن
          </div>

          <div className="mx-auto mt-8 flex max-w-xl items-center gap-5">
            <div className="h-px flex-1 bg-white/70" />

            <h1 className="text-3xl font-black text-white sm:text-4xl">
              منصة الكباتن
            </h1>

            <div className="h-px flex-1 bg-white/70" />
          </div>

          <p className="mt-3 text-lg text-white/90 sm:text-xl">
            رحلتك معنا ... أكثر أمانًا وأسهل
          </p>

        </div>

        {/* ================= LOGIN CARD ================= */}

        <div className="mx-auto mt-10 w-full max-w-xl">

          <form
            onSubmit={handleLogin}
            className="rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur-md sm:p-10"
          >

            {/* Captain Icon */}

            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-[8px] border-white bg-[#09213a] shadow-xl">

              <div className="text-6xl">
                👨‍✈️
              </div>

            </div>

            <h2 className="mt-7 text-center text-4xl font-black text-[#09213a]">
              مرحبًا بك
            </h2>

            <p className="mt-2 text-center text-lg text-gray-500">
              تسجيل الدخول إلى حسابك
            </p>

            {/* PHONE */}

            <div className="mt-8">

              <div className="relative">

                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-gray-500">
                  👤
                </span>

                <input
                  type="text"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  placeholder="رقم الكابتن"
                  disabled={loading}
                  className="h-16 w-full rounded-2xl border border-gray-300 bg-white px-14 text-lg text-[#09213a] outline-none transition placeholder:text-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 disabled:bg-gray-100"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="mt-5">

              <div className="relative">

                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-gray-500">
                  🔒
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={code}
                  onChange={(e) =>
                    setCode(
                      e.target.value
                    )
                  }
                  placeholder="كلمة المرور"
                  disabled={loading}
                  className="h-16 w-full rounded-2xl border border-gray-300 bg-white px-14 pl-14 text-lg text-[#09213a] outline-none transition placeholder:text-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 disabled:bg-gray-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            {/* REMEMBER / FORGOT */}

            <div className="mt-5 flex items-center justify-between text-sm">

              <button
                type="button"
                onClick={() =>
                  setShowSupport(true)
                }
                className="font-bold text-blue-700 hover:underline"
              >
                نسيت كلمة المرور؟
              </button>

              <label className="flex cursor-pointer items-center gap-2 font-semibold text-gray-700">

                <span>
                  تذكرني
                </span>

                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 accent-yellow-400"
                />

              </label>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-16 w-full items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-xl font-black text-[#09213a] shadow-lg transition hover:scale-[1.01] hover:from-yellow-300 hover:to-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "جاري تسجيل الدخول..."
                : "تسجيل الدخول"}

              {!loading && (
                <span className="text-3xl">
                  ←
                </span>
              )}
            </button>

            {/* OR */}

            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-gray-300" />

              <span className="text-gray-500">
                أو
              </span>

              <div className="h-px flex-1 bg-gray-300" />

            </div>

            {/* SUPPORT */}

            <button
              type="button"
              onClick={() =>
                setShowSupport(true)
              }
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#09213a] bg-white text-lg font-bold text-[#09213a] transition hover:bg-[#09213a] hover:text-white"
            >
              <span className="text-2xl">
                🎧
              </span>

              تواصل مع الدعم الفني
            </button>

          </form>

        </div>

        {/* ================= FEATURES ================= */}

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-8 text-center sm:grid-cols-3">

          <div className="text-white">

            <div className="text-5xl">
              🛡️
            </div>

            <h3 className="mt-3 text-xl font-black">
              آمن وموثوق
            </h3>

            <p className="mt-1 text-sm text-white/80">
              حماية بياناتك
              <br />
              تحت أعلى معايير الأمان
            </p>

          </div>

          <div className="text-white">

            <div className="text-5xl">
              🕐
            </div>

            <h3 className="mt-3 text-xl font-black">
              متابعة لحظية
            </h3>

            <p className="mt-1 text-sm text-white/80">
              تتبع طلباتك وأرباحك
              <br />
              في الوقت الحقيقي
            </p>

          </div>

          <div className="text-white">

            <div className="text-5xl">
              👛
            </div>

            <h3 className="mt-3 text-xl font-black">
              سهولة ومرونة
            </h3>

            <p className="mt-1 text-sm text-white/80">
              إدارة رصيدك وطلباتك
              <br />
              بكل سهولة
            </p>

          </div>

        </div>

        {/* ================= FOOTER ================= */}

        <div className="mx-auto mt-10 max-w-5xl border-t border-white/20 py-5">

          <div className="flex flex-col items-center justify-between gap-3 text-sm text-white/80 sm:flex-row">

            <div className="text-xl font-black">
              <span className="text-yellow-400">
                Dr.
              </span>
              <span className="text-white">
                Drive
              </span>

              <div className="text-xs text-yellow-400">
                وصلني الآن
              </div>
            </div>

            <div>
              © 2025 Dr.Drive -
              جميع الحقوق محفوظة
            </div>

            <div>
              نسخة 1.0.0
            </div>

          </div>

        </div>

      </div>

      {/* ================= SUPPORT MODAL ================= */}

      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">

          <div
            dir="rtl"
            className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"
          >

            <h2 className="text-2xl font-black text-[#09213a]">
              الدعم الفني
            </h2>

            <p className="mt-2 text-gray-500">
              اختر الرقم الذي تريد الاتصال به
            </p>

            <div className="mt-6 space-y-3">

              <a
                href="tel:0792026321"
                className="flex items-center justify-between rounded-2xl border p-4 font-bold text-[#09213a] transition hover:bg-yellow-50"
              >
                <span>
                  0792026321
                </span>

                <span className="text-2xl">
                  📞
                </span>
              </a>

              <a
                href="tel:0792026320"
                className="flex items-center justify-between rounded-2xl border p-4 font-bold text-[#09213a] transition hover:bg-yellow-50"
              >
                <span>
                  0792026320
                </span>

                <span className="text-2xl">
                  📞
                </span>
              </a>

            </div>

            <button
              type="button"
              onClick={() =>
                setShowSupport(false)
              }
              className="mt-5 w-full rounded-2xl bg-[#09213a] py-3 font-bold text-white"
            >
              إغلاق
            </button>

          </div>

        </div>
      )}

    </main>
  );
}