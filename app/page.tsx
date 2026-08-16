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
        min-h-screen
        w-full
        bg-[#071E36]
      "
    >

      {/* =====================================================
          الصفحة الرئيسية
          الصورة الأصلية 2:3
      ===================================================== */}

      <div
        className="
          relative
          mx-auto
          w-full
          overflow-hidden
          bg-[#071E36]
        "
        style={{
          aspectRatio: "2 / 3",
          backgroundImage:
            "url('/login-bg.png')",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >

        {/* =================================================
            LOGIN CARD
        ================================================= */}

        <div
          className="
            absolute
            left-1/2
            top-[37%]
            w-[63%]
            -translate-x-1/2
          "
        >

          <div
            className="
              relative
              rounded-[24px]
              bg-white/95
              px-[6%]
              pb-[5%]
              pt-[10%]
              shadow-2xl
            "
          >

            {/* =================================================
                ICON
            ================================================= */}

            <div
              className="
                absolute
                left-1/2
                top-0
                flex
                h-[78px]
                w-[78px]
                -translate-x-1/2
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border-[5px]
                border-white
                bg-[#071E36]
                shadow-xl
              "
            >
              <span className="text-[42px]">
                👨‍✈️
              </span>
            </div>

            {/* =================================================
                TITLE
            ================================================= */}

            <div className="text-center">

              <h1
                className="
                  text-[22px]
                  font-black
                  leading-tight
                  text-[#071E36]
                "
              >
                مرحباً بك
              </h1>

              <p
                className="
                  mt-1
                  text-[12px]
                  font-semibold
                  text-slate-500
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
              className="mt-4 space-y-2"
            >

              {/* PHONE */}

              <div
                className="
                  flex
                  h-[45px]
                  items-center
                  rounded-[13px]
                  border
                  border-slate-300
                  bg-white
                  px-3
                "
              >

                <span className="ml-2 text-[18px]">
                  👤
                </span>

                <input
                  type="tel"
                  inputMode="tel"
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
                  "
                />

              </div>

              {/* PASSWORD */}

              <div
                className="
                  flex
                  h-[45px]
                  items-center
                  rounded-[13px]
                  border
                  border-slate-300
                  bg-white
                  px-3
                "
              >

                <span className="ml-2 text-[18px]">
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
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="mr-1 text-[18px]"
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
                    items-center
                    gap-1
                    text-[12px]
                    font-semibold
                    text-[#071E36]
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
                  "
                >
                  نسيت كلمة المرور؟
                </button>

              </div>

              {/* LOGIN */}

              <button
                type="submit"
                disabled={loading}
                className="
                  flex
                  h-[50px]
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-[14px]
                  bg-[#F5B82E]
                  text-[18px]
                  font-black
                  text-[#071E36]
                  shadow-lg
                  transition
                  active:scale-[.99]
                  disabled:opacity-60
                "
              >

                <span>
                  {loading
                    ? "جاري الدخول..."
                    : "تسجيل الدخول"}
                </span>

                {!loading && (
                  <span className="text-[22px]">
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
              "
            >

              <div className="h-px flex-1 bg-slate-300" />

              <span
                className="
                  text-[12px]
                  font-semibold
                  text-slate-500
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
                h-[47px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-[13px]
                border-2
                border-[#071E36]
                bg-white
                text-[15px]
                font-black
                text-[#071E36]
                active:scale-[.99]
              "
            >

              <span className="text-[18px]">
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