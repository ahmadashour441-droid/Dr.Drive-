"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 overflow-hidden">
      <div className="text-center animate-pulse">

        <div className="w-36 h-36 mx-auto rounded-full bg-white flex items-center justify-center shadow-2xl animate-bounce">
          <span className="text-5xl">🚖</span>
        </div>

        <h1 className="mt-10 text-5xl font-extrabold text-white tracking-wide">
          Dr. Drive
        </h1>

        <p className="mt-4 text-2xl text-blue-100 font-semibold">
          وصلني الآن
        </p>

        <div className="mt-12 flex justify-center gap-2">
          <span className="w-3 h-3 bg-white rounded-full animate-bounce"></span>
          <span
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></span>
          <span
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></span>
        </div>
      </div>
    </main>
  );
}