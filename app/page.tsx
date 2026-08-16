"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

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
    window.location.href =
      "tel:0792026321";
  }

  return (
    <main
      dir="rtl"
      className="min-h-[100dvh] w-full bg-black"
    >
      {/* =====================================================
          التصميم الكامل
          النسبة الأصلية للصورة = 2 : 3
          لذلك لن يتم قص الخلفية على الهاتف
      ===================================================== */}

      <div className="flex min-h-[100dvh] w-full items-center justify-center overflow-hidden">

        <div
          className="
            relative
            h-[100dvh]
            w-full
            max-w-[1080px]
            overflow-hidden
            bg-[#071E36]
            bg-[url('/login-bg.png')]
            bg-contain
            bg-center
            bg-no-repeat
            sm:h-[min(100dvh,1536px)]
          "
          style={{
            aspectRatio: "2 / 3",
          }}
        >

          {/* =================================================
              طبقة محتوى الصفحة
          ================================================= */}

          <div className="absolute inset-0">

            {/* =================================================
                كرت تسجيل الدخول
                مثبت في منتصف التصميم
            ================================================= */}

            <div
              className="
                absolute
                left-1/2
                top-[38%]
                w-[78%]
                max-w-[620px]
                -translate-x-1/2
              "
            >

              {/* الكرت الأبيض */}

              <div
                className="
                  relative
                  rounded-[30px]
                  border
                  border-white/70
                  bg-white/95
                  px-[6%]
                  pb-[5%]
                  pt-[9%]
                  shadow-[0_20px_60px_rgba(0,0,0,.25)]
                  backdrop-blur-sm
                "
              >

                {/* =================================================
                    أيقونة الكابتن
                ================================================= */}

                <div
                  className="
                    absolute
                    left-1/2
                    top-0
                    flex
                    h-[105px]
                    w-[105px]
                    -translate-x-1/2
                    -translate-y-1/2
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-full
                    border-[7px]
                    border-white
                    bg-[#071E36]
                    shadow-[0_10px_30px_rgba(0,0,0,.22)]
                    sm:h-[120px]
                    sm:w-[120px]
                  "
                >
                  <span
                    className="
                      text-[58px]
                      leading-none
                      sm:text-[68px]
                    "
                  >
                    👨‍✈️
                  </span>
                </div>

                {/* =================================================
                    العنوان
                ================================================= */}

                <div className="text-center">

                  <h1
                    className="
                      text-[30px]
                      font-black
                      leading-tight
                      text-[#071E36]
                      sm:text-[38px]
                    "
                  >
                    مرحباً بك
                  </h1>

                  <p
                    className="
                      mt-2
                      text-[16px]
                      font-medium
                      text-slate-500
                      sm:text-[20px]
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
                  className="mt-6 space-y-3 sm:mt-7 sm:space-y-4"
                >

                  {/* رقم الهاتف */}

                  <div
                    className="
                      flex
                      h-[58px]
                      items-center
                      rounded-[16px]
                      border
                      border-slate-300
                      bg-white
                      px-4
                      shadow-sm
                      sm:h-[68px]
                    "
                  >

                    <span className="ml-3 text-[25px]">
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
                        text-[17px]
                        font-semibold
                        text-[#071E36]
                        outline-none
                        placeholder:text-slate-400
                        sm:text-[20px]
                      "
                    />

                  </div>

                  {/* كلمة المرور */}

                  <div
                    className="
                      flex
                      h-[58px]
                      items-center
                      rounded-[16px]
                      border
                      border-slate-300
                      bg-white
                      px-4
                      shadow-sm
                      sm:h-[68px]
                    "
                  >

                    <span className="ml-3 text-[25px]">
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
                        text-[17px]
                        font-semibold
                        text-[#071E36]
                        outline-none
                        placeholder:text-slate-400
                        sm:text-[20px]
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
                        mr-2
                        shrink-0
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

                  </div>

                  {/* تذكرني + نسيت كلمة المرور */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      px-1
                    "
                  >

                    <label
                      className="
                        flex
                        cursor-pointer
                        items-center
                        gap-2
                        text-[15px]
                        font-semibold
                        text-[#071E36]
                        sm:text-[18px]
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
                          h-5
                          w-5
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
                        text-[15px]
                        font-bold
                        text-blue-600
                        hover:underline
                        sm:text-[18px]
                      "
                    >
                      نسيت كلمة المرور؟
                    </button>

                  </div>

                  {/* =================================================
                      تسجيل الدخول
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
                      rounded-[18px]
                      bg-[#F5B82E]
                      text-[22px]
                      font-black
                      text-[#071E36]
                      shadow-[0_8px_20px_rgba(245,184,46,.25)]
                      transition
                      hover:bg-[#f8c44e]
                      active:scale-[.99]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      sm:h-[72px]
                      sm:text-[26px]
                    "
                  >

                    <span>
                      {loading
                        ? "جاري تسجيل الدخول..."
                        : "تسجيل الدخول"}
                    </span>

                    {!loading && (
                      <span className="text-[28px]">
                        ←
                      </span>
                    )}

                  </button>

                </form>

                {/* =================================================
                    أو
                ================================================= */}

                <div
                  className="
                    my-4
                    flex
                    items-center
                    gap-4
                    sm:my-5
                  "
                >

                  <div className="h-px flex-1 bg-slate-300" />

                  <span
                    className="
                      text-[15px]
                      font-semibold
                      text-slate-500
                      sm:text-[18px]
                    "
                  >
                    أو
                  </span>

                  <div className="h-px flex-1 bg-slate-300" />

                </div>

                {/* =================================================
                    الدعم الفني
                ================================================= */}

                <button
                  type="button"
                  onClick={callSupport}
                  className="
                    flex
                    h-[58px]
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-[16px]
                    border-[2px]
                    border-[#071E36]
                    bg-white
                    text-[18px]
                    font-black
                    text-[#071E36]
                    transition
                    hover:bg-slate-50
                    active:scale-[.99]
                    sm:h-[66px]
                    sm:text-[21px]
                  "
                >

                  <span>
                    🎧
                  </span>

                  <span>
                    تواصل مع الدعم الفني
                  </span>

                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}