"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  requestId: number;
};

export default function RechargeActions({
  requestId,
}: Props) {

  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

 async function approve() {

  alert("وصلنا للزر");

  setLoading(true);

  try {

  const response = await fetch(
    "/api/recharge/approve",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId,
      }),
    }
  );

  alert("رجع الرد");

  const result = await response.json();

  setLoading(false);

  if (!response.ok) {
    alert(result.error);
    return;
  }

  alert("تم قبول طلب الشحن");

  router.refresh();

} catch (err: any) {

  setLoading(false);

  console.error(err);

  alert(err.message);

}

    alert("تم قبول طلب الشحن");

    router.refresh();

  }

 async function reject() {

  if (!confirm("هل أنت متأكد من رفض طلب الشحن؟")) {
    return;
  }

  setLoading(true);

  try {

    const response = await fetch(
      "/api/recharge/reject",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
        }),
      }
    );

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(result.error);
      return;
    }

    alert("تم رفض طلب الشحن");

    router.refresh();

  } catch (err: any) {

    setLoading(false);

    alert(err.message);

  }

}

  return (

    <div className="flex justify-center gap-2">

      <button
        onClick={approve}
        disabled={loading}
        className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading
          ? "جاري..."
          : "قبول"}
      </button>

      <button
        onClick={reject}
        disabled={loading}
        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
      >
        رفض
      </button>

    </div>

  );

}