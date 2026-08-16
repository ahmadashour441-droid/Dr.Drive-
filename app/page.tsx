"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedPhone = localStorage.getItem(
      "drdrive_remember_phone"
    );

    if (savedPhone) {
      setPhone(savedPhone);
      setRemember(true);
    }
  }, []);

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    if (!phone.trim() || !code.trim()) {
      alert("يرجى إدخال رقم الهاتف وكلمة المرور");
      return;
    }

    setLoading(true);

    try {
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
        alert(
          result?.error ??
            "فشل تسجيل الدخول"
        );
        return;
      }

      if (remember) {
        localStorage.setItem(
          "drdrive_remember_phone",
          phone.trim()
        );
      } else {
        localStorage.removeItem(
          "drdrive_remember_phone"
        );
      }

      if (result?.user?.is_admin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
  console.error(error);
  alert("حدث خطأ أثناء تسجيل الدخول");
} finally {
      setLoading(false);
    }
  }

  function callSupport() {
    window.location.href = "tel:0792026321";
  }

  return (
    <main
      dir="rtl"
      className="
        min-h-[100dvh]
        w-full
        overflow-visible
        bg-[#071E36]
      "
    >

      {/* =====================================================
          BACKGROUND
          تغطي الشاشة كاملة بدون فراغ كحلي أسفل الصورة
      ===================================================== */}

      <div
        className="
          relative
          min-h-[100dvh]
          w-full
          overflow-visible
          bg-[#071E36]
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundImage:
            "url('/login-bg.png')",
        }}
      >

        {/* =================================================
            LOGIN CARD
        ================================================= */}

        <div
  className="
    absolute
    left-1/2
    top-[45%]
    w-[63%]
    max-w-[620px]
    -translate-x-1/2
  "
>

          <div
            className="
              relative
              w-full
              rounded-[26px]
              border
              border-white/70
              bg-white/95
              px-[6%]
              pb-[5%]
              pt-[17%]
              shadow-[0_20px_60px_rgba(0,0,0,.28)]
              backdrop-blur-sm
            "
          >

            {/* =================================================
                CAPTAIN ICON
                مرفوعة فوق الكرت
            ================================================= */}

            <div
              className="
                absolute
                left-1/2
                top-0
                z-20
                flex
                h-[82px]
                w-[82px]
                -translate-x-1/2
                -translate-y-[105%]
                items-center
                justify-center
                rounded-full
                border-[6px]
                border-white
                bg-[#071E36]
                shadow-[0_10px_30px_rgba(0,0,0,.30)]
                sm:h-[110px]
                sm:w-[110px]
                sm:-translate-y-[95%]
              "
            >

              <span
                className="
                  text-[43px]
                  leading-none
                  sm:text-[58px]
                "
              >
                👨‍✈️
              </span>

            </div>

            {/* =================================================
                TITLE
            ================================================= */}

            <div
              className="
                text-center
              "
            >

              <h1
                className="
                  text-[23px]
                  font-black
                  leading-tight
                  text-[#071E36]
                  sm:text-[34px]
                "
              >
                مرحباً بك
              </h1>

              <p
                className="
                  mt-2
                  text-[13px]
                  font-semibold
                  text-slate-500
                  sm:text-[18px]
                "
              >
                تسجيل الدخول إلى حسابك
              </p>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleLogin}
              className="
                mt-5
                space-y-2.5
                sm:mt-6
                sm:space-y-3
              "
            >

              {/* PHONE */}

              <div
                className="
                  flex
                  h-[48px]
                  w-full
                  items-center
                  rounded-[14px]
                  border
                  border-slate-300
                  bg-white
                  px-3
                  shadow-sm
                  sm:h-[60px]
                "
              >

                <span
                  className="
                    ml-2
                    text-[19px]
                    sm:text-[23px]
                  "
                >
                  👤
                </span>

                <input
                  type="tel"
                  inputMode="tel"
                  dir="rtl"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="رقم الكابتن"
                  autoComplete="tel"
                  disabled={loading}
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    text-right
                    text-[14px]
                    font-semibold
                    text-[#071E36]
                    outline-none
                    placeholder:text-slate-400
                    sm:text-[18px]
                  "
                />

              </div>

              {/* PASSWORD */}

              <div
                className="
                  flex
                  h-[48px]
                  w-full
                  items-center
                  rounded-[14px]
                  border
                  border-slate-300
                  bg-white
                  px-3
                  shadow-sm
                  sm:h-[60px]
                "
              >

                <span
                  className="
                    ml-2
                    text-[18px]
                    sm:text-[23px]
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
                    setCode(e.target.value)
                  }
                  placeholder="كلمة المرور"
                  autoComplete="current-password"
                  disabled={loading}
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    text-right
                    text-[14px]
                    font-semibold
                    text-[#071E36]
                    outline-none
                    placeholder:text-slate-400
                    sm:text-[18px]
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="
                    mr-1
                    shrink-0
                    text-[18px]
                    sm:text-[22px]
                  "
                  aria-label={
                    showPassword
                      ? "إخفاء كلمة المرور"
                      : "إظهار كلمة المرور"
                  }
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

              {/* REMEMBER / FORGOT */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-2
                  px-1
                "
              >

                <label
                  className="
                    flex
                    cursor-pointer
                    items-center
                    gap-1.5
                    text-[12px]
                    font-semibold
                    text-[#071E36]
                    sm:text-[16px]
                  "
                >

                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) =>
                      setRemember(
                        e.target.checked
                      )
                    }
                    className="
                      h-4
                      w-4
                      accent-[#F5B82E]
                      sm:h-5
                      sm:w-5
                    "
                  />

                  تذكرني

                </label>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "لإعادة تعيين كلمة المرور، يرجى التواصل مع الدعم الفني."
                    )
                  }
                  className="
                    text-[12px]
                    font-bold
                    text-blue-600
                    sm:text-[16px]
                  "
                >
                  نسيت كلمة المرور؟
                </button>

              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="
                  flex
                  h-[52px]
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-[15px]
                  bg-[#F5B82E]
                  text-[19px]
                  font-black
                  text-[#071E36]
                  shadow-[0_8px_20px_rgba(245,184,46,.25)]
                  transition
                  active:scale-[.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:h-[64px]
                  sm:text-[23px]
                "
              >

                <span>
                  {loading
                    ? "جاري الدخول..."
                    : "تسجيل الدخول"}
                </span>

                {!loading && (
                  <span className="text-[24px]">
                    ←
                  </span>
                )}

              </button>

            </form>

            {/* =================================================
                OR
            ================================================= */}

            <div
              className="
                my-3
                flex
                items-center
                gap-2
                sm:my-4
              "
            >

              <div className="h-px flex-1 bg-slate-300" />

              <span
                className="
                  text-[12px]
                  font-semibold
                  text-slate-500
                  sm:text-[16px]
                "
              >
                أو
              </span>

              <div className="h-px flex-1 bg-slate-300" />

            </div>

            {/* =================================================
                SUPPORT
            ================================================= */}

            <button
              type="button"
              onClick={callSupport}
              className="
                flex
                h-[49px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-[15px]
                border-[2px]
                border-[#071E36]
                bg-white
                text-[15px]
                font-black
                text-[#071E36]
                transition
                active:scale-[.99]
                sm:h-[61px]
                sm:text-[20px]
              "
            >

              <span className="text-[18px] sm:text-[22px]">
                🎧
              </span>

              <span>
                تواصل مع الدعم الفني
              </span>

            </button>

          </div>

        </div>

      </div>

    </main>
  );
}