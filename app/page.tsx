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
      className="min-h-screen overflow-x-hidden bg-[#07192b]"
    >
      {/* =========================
          BACKGROUND
      ========================= */}

      <div
        className="fixed inset-x-0 top-0 z-0 bg-[#07192b] bg-top bg-no-repeat"
        style={{
          backgroundImage:
            "url('/login-bg.png')",
          backgroundSize:
            "100% auto",
          height:
            "min(100vh, 133.33vw)",
        }}
      />

      {/* تدرج أسفل الصورة */}

      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0"
        style={{
          height:
            "min(100vh, 133.33vw)",
          background:
            "linear-gradient(to bottom, transparent 65%, #07192b 100%)",
        }}
      />

      {/* =========================
          CONTENT
      ========================= */}

      <div className="relative z-10 min-h-screen px-3 pb-8">

        {/* =========================
            LOGIN CARD
        ========================= */}

        <section
          className="
            mx-auto
            flex
            w-full
            max-w-[400px]
            justify-center
            pt-[190px]

            sm:max-w-[430px]
            sm:pt-[270px]

            lg:max-w-[440px]
            lg:pt-[300px]
          "
        >

          <form
            onSubmit={handleLogin}
            className="
              relative
              w-full
              rounded-[28px]
              border
              border-white/70
              bg-white/[0.96]
              px-4
              pb-5
              pt-14
              shadow-2xl
              backdrop-blur-sm

              sm:rounded-[30px]
              sm:px-6
              sm:pb-6
              sm:pt-16
            "
          >

            {/* =========================
                CAPTAIN ICON
            ========================= */}

            <div
              className="
                absolute
                left-1/2
                top-[-45px]
                flex
                h-24
                w-24
                -translate-x-1/2
                items-center
                justify-center
                rounded-full
                border-[6px]
                border-white
                bg-[#09213a]
                shadow-xl

                sm:top-[-52px]
                sm:h-26
                sm:w-26
              "
            >
              <span className="text-5xl">
                👨‍✈️
              </span>
            </div>

            {/* =========================
                TITLE
            ========================= */}

            <div className="text-center">

              <h2
                className="
                  text-3xl
                  font-black
                  text-[#09213a]
                "
              >
                مرحبًا بك
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                  sm:text-base
                "
              >
                تسجيل الدخول إلى حسابك
              </p>

            </div>

            {/* =========================
                PHONE
            ========================= */}

            <div className="mt-5">

              <div className="relative">

                <span
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-xl
                    text-gray-400
                  "
                >
                  👤
                </span>

                <input
                  type="text"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  placeholder="رقم الكابتن"
                  disabled={loading}
                  className="
                    h-14
                    w-full
                    rounded-2xl
                    border
                    border-gray-300
                    bg-white
                    px-12
                    text-base
                    text-[#09213a]
                    outline-none
                    placeholder:text-gray-400
                    focus:border-yellow-400
                    focus:ring-2
                    focus:ring-yellow-200
                  "
                />

              </div>

            </div>

            {/* =========================
                PASSWORD
            ========================= */}

            <div className="mt-3">

              <div className="relative">

                <span
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-xl
                    text-gray-400
                  "
                >
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
                  className="
                    h-14
                    w-full
                    rounded-2xl
                    border
                    border-gray-300
                    bg-white
                    px-12
                    pl-12
                    text-base
                    text-[#09213a]
                    outline-none
                    placeholder:text-gray-400
                    focus:border-yellow-400
                    focus:ring-2
                    focus:ring-yellow-200
                  "
                />

                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-xl
                  "
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            {/* =========================
                REMEMBER / FORGOT
            ========================= */}

            <div
              className="
                mt-3
                flex
                items-center
                justify-between
                gap-3
                text-sm
              "
            >

              <button
                type="button"
                onClick={() =>
                  setShowSupport(true)
                }
                className="
                  font-bold
                  text-blue-700
                  hover:underline
                "
              >
                نسيت كلمة المرور؟
              </button>

              <label
                className="
                  flex
                  shrink-0
                  cursor-pointer
                  items-center
                  gap-2
                  font-semibold
                  text-gray-700
                "
              >
                <span>
                  تذكرني
                </span>

                <input
                  type="checkbox"
                  className="
                    h-5
                    w-5
                    accent-yellow-400
                  "
                />
              </label>

            </div>

            {/* =========================
                LOGIN BUTTON
            ========================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                mt-4
                flex
                h-14
                w-full
                items-center
                justify-center
                gap-4
                rounded-2xl
                bg-yellow-400
                text-lg
                font-black
                text-[#09213a]
                shadow-lg
                transition
                hover:bg-yellow-300
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading
                ? "جاري تسجيل الدخول..."
                : "تسجيل الدخول"}

              {!loading && (
                <span className="text-2xl">
                  ←
                </span>
              )}
            </button>

            {/* =========================
                OR
            ========================= */}

            <div
              className="
                my-4
                flex
                items-center
                gap-3
              "
            >

              <div className="h-px flex-1 bg-gray-300" />

              <span className="text-sm text-gray-500">
                أو
              </span>

              <div className="h-px flex-1 bg-gray-300" />

            </div>

            {/* =========================
                SUPPORT
            ========================= */}

            <button
              type="button"
              onClick={() =>
                setShowSupport(true)
              }
              className="
                flex
                h-14
                w-full
                items-center
                justify-center
                gap-3
                rounded-2xl
                border-2
                border-[#09213a]
                bg-white
                text-base
                font-bold
                text-[#09213a]
                transition
                hover:bg-[#09213a]
                hover:text-white
              "
            >
              <span className="text-xl">
                🎧
              </span>

              تواصل مع الدعم الفني
            </button>

          </form>

        </section>

        {/* =========================
            FOOTER ONLY
        ========================= */}

        <footer
          className="
            mx-auto
            mt-6
            max-w-[500px]
            border-t
            border-white/20
            py-4
            text-center
            text-xs
            text-white/80

            sm:mt-10
            sm:text-sm
          "
        >

          <div className="font-black">

            <span
              dir="ltr"
              className="text-white"
            >
              Dr.
            </span>

            <span
              dir="ltr"
              className="text-yellow-400"
            >
              Drive
            </span>

            <span className="mr-2 text-yellow-400">
              وصلني الآن
            </span>

          </div>

          <div className="mt-1">
            © 2025 Dr.Drive - جميع الحقوق محفوظة
          </div>

          <div className="mt-1">
            نسخة 1.0.0
          </div>

        </footer>

      </div>

      {/* =========================
          SUPPORT MODAL
      ========================= */}

      {showSupport && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/60
            p-4
          "
        >

          <div
            dir="rtl"
            className="
              w-full
              max-w-md
              rounded-3xl
              bg-white
              p-6
              shadow-2xl
            "
          >

            <h2
              className="
                text-2xl
                font-black
                text-[#09213a]
              "
            >
              الدعم الفني
            </h2>

            <p className="mt-2 text-gray-500">
              اختر الرقم الذي تريد الاتصال به
            </p>

            <div className="mt-6 space-y-3">

              <a
                href="tel:0792026321"
                className="
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  p-4
                  font-bold
                  text-[#09213a]
                  hover:bg-yellow-50
                "
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
                className="
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  p-4
                  font-bold
                  text-[#09213a]
                  hover:bg-yellow-50
                "
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
              className="
                mt-5
                w-full
                rounded-2xl
                bg-[#09213a]
                py-3
                font-bold
                text-white
                hover:bg-[#132f50]
              "
            >
              إغلاق
            </button>

          </div>

        </div>
      )}

    </main>
  );
}