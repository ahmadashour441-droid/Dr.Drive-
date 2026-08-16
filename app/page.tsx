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
        min-h-[100svh]
        w-full
        overflow-hidden
        bg-[#071E36]
      "
    >
      <div
        className="
          relative
          min-h-[100svh]
          w-full
          overflow-hidden
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

        {/* =====================================================
            LOGIN CONTAINER
        ===================================================== */}

        <div
          className="
            absolute
            left-1/2
            top-[45%]
            w-[88%]
            -translate-x-1/2
            -translate-y-1/2

            sm:top-[47%]
            sm:w-[72%]

            md:top-[48%]
            md:w-[58%]
            md:max-w-[620px]

            lg:w-[54%]
            lg:max-w-[620px]
          "
        >

          {/* ===================================================
              CAPTAIN ICON
              منفصلة تماماً عن الكارد
          =================================================== */}

          <div
            className="
              absolute
              left-1/2
              top-[-82px]
              z-30
              -translate-x-1/2

              sm:top-[-92px]

              md:top-[-100px]
            "
          >
            <div
              className="
                flex
                h-[118px]
                w-[118px]
                items-center
                justify-center
                rounded-full
                border-[7px]
                border-white
                bg-[#071E36]
                shadow-[0_12px_35px_rgba(0,0,0,.32)]

                sm:h-[130px]
                sm:w-[130px]

                md:h-[140px]
                md:w-[140px]
              "
            >
              <span
                className="
                  select-none
                  text-[58px]
                  leading-none

                  sm:text-[65px]

                  md:text-[70px]
                "
              >
                👨‍✈️
              </span>
            </div>
          </div>

          {/* ===================================================
              WHITE CARD
          =================================================== */}

          <section
            className="
              relative
              w-full
              rounded-[28px]
              border
              border-white/80
              bg-white/[0.96]
              px-5
              pb-6
              pt-[82px]
              shadow-[0_25px_70px_rgba(0,0,0,.30)]
              backdrop-blur-[4px]

              sm:rounded-[30px]
              sm:px-7
              sm:pb-7
              sm:pt-[88px]

              md:px-8
              md:pb-8
              md:pt-[94px]
            "
          >

            {/* =================================================
                TITLE
            ================================================= */}

            <div className="mb-6 text-center">

              <h1
                className="
                  text-[30px]
                  font-black
                  leading-none
                  text-[#102F59]

                  sm:text-[34px]

                  md:text-[38px]
                "
              >
                مرحباً بك
              </h1>

              <p
                className="
                  mt-3
                  text-[15px]
                  font-semibold
                  text-slate-500

                  sm:text-[17px]

                  md:text-[18px]
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
                space-y-3
              "
            >

              {/* =================================================
                  PHONE
              ================================================= */}

              <div
                className="
                  flex
                  h-[60px]
                  w-full
                  items-center
                  rounded-[17px]
                  border
                  border-slate-300
                  bg-white
                  px-4
                  shadow-sm
                  transition

                  focus-within:border-[#F5B82E]
                  focus-within:ring-4
                  focus-within:ring-[#F5B82E]/15

                  sm:h-[64px]

                  md:h-[66px]
                "
              >

                <span
                  className="
                    ml-3
                    select-none
                    text-[25px]
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
                    text-[16px]
                    font-semibold
                    text-[#071E36]
                    outline-none
                    placeholder:text-slate-400

                    sm:text-[18px]
                  "
                />

              </div>

              {/* =================================================
                  PASSWORD
              ================================================= */}

              <div
                className="
                  flex
                  h-[60px]
                  w-full
                  items-center
                  rounded-[17px]
                  border
                  border-slate-300
                  bg-white
                  px-4
                  shadow-sm
                  transition

                  focus-within:border-[#F5B82E]
                  focus-within:ring-4
                  focus-within:ring-[#F5B82E]/15

                  sm:h-[64px]

                  md:h-[66px]
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="
                    ml-3
                    shrink-0
                    select-none
                    text-[24px]
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
                    text-[16px]
                    font-semibold
                    text-[#071E36]
                    outline-none
                    placeholder:text-slate-400

                    sm:text-[18px]
                  "
                />

                <span
                  className="
                    mr-2
                    select-none
                    text-[24px]
                  "
                >
                  🔒
                </span>

              </div>

              {/* =================================================
                  REMEMBER / FORGOT
              ================================================= */}

              <div
                className="
                  flex
                  min-h-[35px]
                  items-center
                  justify-between
                  gap-3
                  px-1
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "لإعادة تعيين كلمة المرور، يرجى التواصل مع الدعم الفني."
                    )
                  }
                  className="
                    text-[13px]
                    font-bold
                    text-blue-600
                    hover:text-blue-700

                    sm:text-[16px]
                  "
                >
                  نسيت كلمة المرور؟
                </button>

                <label
                  className="
                    flex
                    cursor-pointer
                    items-center
                    gap-2
                    text-[14px]
                    font-bold
                    text-[#071E36]

                    sm:text-[16px]
                  "
                >

                  تذكرني

                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) =>
                      setRemember(
                        e.target.checked
                      )
                    }
                    className="
                      h-5
                      w-5
                      cursor-pointer
                      accent-[#F5B82E]
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
                  flex
                  h-[62px]
                  w-full
                  items-center
                  justify-center
                  gap-4
                  rounded-[17px]
                  bg-[#F5B82E]
                  text-[21px]
                  font-black
                  text-[#071E36]
                  shadow-[0_9px_24px_rgba(245,184,46,.27)]
                  transition
                  hover:bg-[#F8C13A]
                  active:scale-[.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  sm:h-[66px]
                  sm:text-[23px]
                "
              >

                <span>
                  {loading
                    ? "جاري الدخول..."
                    : "تسجيل الدخول"}
                </span>

                {!loading && (
                  <span
                    className="
                      text-[27px]
                      leading-none
                    "
                  >
                    ←
                  </span>
                )}

              </button>

            </form>

            {/* =================================================
                DIVIDER
            ================================================= */}

            <div
              className="
                my-4
                flex
                items-center
                gap-3

                sm:my-5
              "
            >

              <div className="h-px flex-1 bg-slate-300" />

              <span
                className="
                  text-[14px]
                  font-semibold
                  text-slate-400

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
                h-[60px]
                w-full
                items-center
                justify-center
                gap-3
                rounded-[17px]
                border-2
                border-[#102F59]
                bg-white
                text-[17px]
                font-black
                text-[#102F59]
                transition
                hover:bg-slate-50
                active:scale-[.99]

                sm:h-[64px]
                sm:text-[20px]
              "
            >

              <span
                className="
                  select-none
                  text-[23px]
                "
              >
                🎧
              </span>

              تواصل مع الدعم الفني

            </button>

          </section>
        </div>
      </div>
    </main>
  );
}