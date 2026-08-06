"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RechargePage() {

  const [amount, setAmount] = useState("");

  const [receipt, setReceipt] = useState<File | null>(null);

  async function sendRequest() {

  if (!amount) {
  alert("أدخل المبلغ");
  return;
}

if (!receipt) {
  alert("أرفق صورة الوصل");
  return;
}

const ext =
  receipt.name.split(".").pop() || "jpg";

const fileName =
  `${crypto.randomUUID()}.${ext}`;

const { error: uploadError } =
  await supabase.storage
    .from("receipts")
    .upload(fileName, receipt, {
      cacheControl: "3600",
      upsert: true,
      contentType: receipt.type,
    });

if (uploadError) {
  console.error(uploadError);
  alert(uploadError.message);
  return;
}

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("receipts")
    .getPublicUrl(fileName);

    console.log("Sending recharge request...");
  const response = await fetch(
  "/api/recharge",
  {
    method: "POST",
    headers: {
      "Content-Type":
        "application/json",
    },
    body: JSON.stringify({
      amount: Number(amount),
      receipt_image: publicUrl,
    }),
  }
);

const result =
  await response.json();
console.log("Response:", response.status);
console.log("Result:", result);
if (!response.ok) {
  alert(result.error);
  return;
}

  alert("تم إرسال طلب الشحن بنجاح");

  setAmount("");
  setReceipt(null);

}

  return (

    <main className="max-w-xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">

        شحن الرصيد

      </h1>

      <div className="rounded-xl border p-6 space-y-5 bg-white">

        <div>

          <label className="font-semibold">

            المبلغ

          </label>

          <input
            type="number"
            className="mt-2 w-full rounded-lg border p-3"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

        </div>

        <div>

          <label className="font-semibold">

            صورة الوصل

          </label>

          <input
            type="file"
            accept="image/*"
            className="mt-2 w-full"
            onChange={(e) =>
              setReceipt(
                e.target.files?.[0] ?? null
              )
            }
          />

        </div>

        <div className="rounded-xl bg-yellow-50 border border-yellow-300 p-5">

          <div className="font-bold">

            التحويل إلى

          </div>

          <div className="mt-3 text-xl font-bold text-green-700">

           orange money
           omar al shrman

          </div>

          <div className="text-2xl font-bold">

            0775200256

          </div>

        </div>

        <button
          onClick={sendRequest}
          className="w-full rounded-xl bg-blue-600 py-3 text-white hover:bg-blue-700"
        >

          إرسال طلب الشحن

        </button>

      </div>

    </main>

  );

}