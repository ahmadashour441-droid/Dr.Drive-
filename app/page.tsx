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
      {/* =====================================================
          BACKGROUND
          الصورة موجودة في:
          public/login-bg.png
      ===================================================== */}

      <div
        className="fixed left-0 top-0 z-0 w-full bg-[#07192b] bg-top bg-no-repeat"
        style={{
          backgroundImage:
            "url('/login-bg.png')",
          backgroundSize:
            "100% auto",
          height: "min(100vh, 133.33vw)",
        }}
      />

      {/* تدرج بسيط أسفل الصورة حتى تنتقل للخلفية الداكنة */}
      <div
        className="fixed inset-x-0 top-0 z-0 pointer-events-none"
        style={{
          height:
            "min(100vh, 133.33vw)",
          background:
            "linear-gradient(to bottom, transparent 65%, #07192b 100%)",
        }}
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 min-h-screen px-3 pb-8 sm:px-6">

        {/* =================================================
            LOGIN SECTION
        ================================================= */}

        <section
          className="
            mx-auto
            w-full
            max-w-[520px]
            pt-[190px]

            sm:max-w-[560px]
            sm:pt-[280px]

            lg:max-w-[570px]
            lg:pt-[310px]
          "
        >

          <form
            onSubmit={handleLogin}
            className="
              relative
              rounded-[28px]
              border
              border-white/70
              bg-white/[0.96]
              px-4
              pb-5
              pt-14
              shadow-2xl
              backdrop-blur-sm

              sm:rounded-[32px]
              sm:px-8
              sm:pb-7
              sm:pt-20
            "
          >

            {/* =================================================
                CAPTAIN ICON
            ================================================= */}

            <div
              className="
                absolute
                left-1/2
                top-[-48px]
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

                sm:top-[-58px]
                sm:h-28
                sm:w-28
              "
            >
              <span className="text-5xl sm:text-6xl">
                👨‍✈️
              </span>
            </div>

            {/* =================================================
                TITLE
            ================================================= */}

            <div className="text-center">

              <h2
                className="
                  text-3xl
                  font-black
                  text-[#09213a]

                  sm:text-4xl
                "
              >
                مرحبًا بك
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500

                  sm:text-lg
                "
              >
                تسجيل الدخول إلى حسابك
              </p>

            </div>

            {/* =================================================
                PHONE
            ================================================= */}

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

                    sm:text-2xl
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
                    transition
                    placeholder:text-gray-400
                    focus:border-yellow-400
                    focus:ring-2
                    focus:ring-yellow-200

                    sm:h-16
                    sm:text-lg
                  "
                />

              </div>

            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

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

                    sm:text-2xl
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
                    transition
                    placeholder:text-gray-400
                    focus:border-yellow-400
                    focus:ring-2
                    focus:ring-yellow-200

                    sm:h-16
                    sm:text-lg
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
                    text-gray-500

                    sm:text-2xl
                  "
                  aria-label="إظهار كلمة المرور"
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            {/* =================================================
                REMEMBER / FORGOT
            ================================================= */}

            <div
              className="
                mt-3
                flex
                items-center
                justify-between
                gap-3
                text-sm

                sm:text-base
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

            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

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

                sm:h-16
                sm:text-xl
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

            {/* =================================================
                OR
            ================================================= */}

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

            {/* =================================================
                TECHNICAL SUPPORT
            ================================================= */}

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

                sm:text-lg
              "
            >
              <span className="text-xl">
                🎧
              </span>

              تواصل مع الدعم الفني
            </button>

          </form>

        </section>

        {/* =================================================
            FEATURES
        ================================================= */}

        <section
          className="
            mx-auto
            mt-8
            grid
            w-full
            max-w-5xl
            grid-cols-3
            gap-1
            text-center

            sm:mt-12
            sm:gap-6
          "
        >

          {/* SAFE */}

          <div className="text-white">

            <div className="text-3xl sm:text-5xl">
              🛡️
            </div>

            <h3
              className="
                mt-1
                text-xs
                font-black

                sm:text-xl
              "
            >
              آمن وموثوق
            </h3>

            <p
              className="
                mt-1
                hidden
                text-sm
                text-white/80

                sm:block
              "
            >
              حماية بياناتك
              <br />
              تحت أعلى معايير الأمان
            </p>

          </div>

          {/* LIVE */}

          <div className="text-white">

            <div className="text-3xl sm:text-5xl">
              🕐
            </div>

            <h3
              className="
                mt-1
                text-xs
                font-black

                sm:text-xl
              "
            >
              متابعة لحظية
            </h3>

            <p
              className="
                mt-1
                hidden
                text-sm
                text-white/80

                sm:block
              "
            >
              تتبع طلباتك وأرباحك
              <br />
              في الوقت الحقيقي
            </p>

          </div>

          {/* EASY */}

          <div className="text-white">

            <div className="text-3xl sm:text-5xl">
              👛
            </div>

            <h3
              className="
                mt-1
                text-xs
                font-black

                sm:text-xl
              "
            >
              سهولة ومرونة
            </h3>

            <p
              className="
                mt-1
                hidden
                text-sm
                text-white/80

                sm:block
              "
            >
              إدارة رصيدك وطلباتك
              <br />
              بكل سهولة
            </p>

          </div>

        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className="
            mx-auto
            mt-5
            max-w-5xl
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

      {/* =====================================================
          SUPPORT MODAL
      ===================================================== */}

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

              sm:p-7
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

              {/* NUMBER 1 */}

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
                  transition
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

              {/* NUMBER 2 */}

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
                  transition
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

            {/* CLOSE */}

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
                transition
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