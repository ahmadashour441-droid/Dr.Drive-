"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RechargePage() {
  const [amount, setAmount] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // تصغير صورة الوصل قبل رفعها لتسريع العملية
  async function compressImage(file: File): Promise<File> {
    if (!file.type.startsWith("image/")) {
      return file;
    }

    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const maxWidth = 1600;
        const maxHeight = 1600;

        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(
            maxWidth / width,
            maxHeight / height
          );

          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, "") + ".jpg",
              {
                type: "image/jpeg",
                lastModified: Date.now(),
              }
            );

            resolve(compressedFile);
          },
          "image/jpeg",
          0.82
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  }

  async function sendRequest() {
    // حماية من الضغط أكثر من مرة
    if (isSubmitting) {
      return;
    }

    if (!amount) {
      alert("أدخل المبلغ");
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      alert("أدخل مبلغ صحيح");
      return;
    }

    if (!receipt) {
      alert("أرفق صورة الوصل");
      return;
    }

    // إغلاق الزر فورًا قبل بدء أي عملية
    setIsSubmitting(true);

    try {
      // تصغير صورة الوصل
      const optimizedReceipt = await compressImage(receipt);

      const fileName = `${crypto.randomUUID()}.jpg`;

      // رفع صورة الوصل
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, optimizedReceipt, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/jpeg",
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert(uploadError.message);
        return;
      }

      // الحصول على رابط الصورة
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);

      console.log("Sending recharge request...");

      // إرسال طلب الشحن إلى API
      const response = await fetch("/api/recharge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: numericAmount,
          receipt_image: publicUrl,
        }),
      });

      const result = await response.json();

      console.log("Response:", response.status);
      console.log("Result:", result);

      if (!response.ok) {
        console.error(result);

        alert(
          typeof result.error === "string"
            ? result.error
            : JSON.stringify(result.error, null, 2)
        );

        return;
      }

      alert("تم إرسال طلب الشحن بنجاح");

      // تنظيف النموذج
      setAmount("");
      setReceipt(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Recharge error:", error);

      alert("حدث خطأ أثناء إرسال طلب الشحن");
    } finally {
      // إعادة تفعيل الزر بعد انتهاء العملية
      setIsSubmitting(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        شحن الرصيد
      </h1>

      <div className="rounded-xl border p-6 space-y-5 bg-white">
        {/* المبلغ */}
        <div>
          <label className="font-semibold">
            المبلغ
          </label>

          <input
            type="number"
            min="0"
            step="0.001"
            className="mt-2 w-full rounded-lg border p-3"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* صورة الوصل */}
        <div>
          <label className="font-semibold">
            صورة الوصل
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="mt-2 w-full"
            onChange={(e) =>
              setReceipt(e.target.files?.[0] ?? null)
            }
            disabled={isSubmitting}
          />
        </div>

        {/* معلومات التحويل */}
        <div className="rounded-xl bg-yellow-50 border border-yellow-300 p-5">
          <div className="font-bold">
            التحويل إلى
          </div>

          <div className="mt-3 text-xl font-bold text-green-700">
            orange money
            <br />
            omar al shrman
          </div>

          <div className="text-2xl font-bold">
            0775200256
          </div>
        </div>

        {/* زر الإرسال */}
        <button
          type="button"
          onClick={sendRequest}
          disabled={isSubmitting}
          className={`w-full rounded-xl py-3 text-white transition ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting
            ? "جاري إرسال طلب الشحن..."
            : "إرسال طلب الشحن"}
        </button>
      </div>
    </main>
  );
}