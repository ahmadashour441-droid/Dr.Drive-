import Link from "next/link";
import {
  ClipboardList,
  Wallet,
  User,
  Users,
} from "lucide-react";

const actions = [
  {
    title: "الطلبات",
    href: "/orders",
    icon: ClipboardList,
    color: "bg-blue-600",
  },
  {
    title: "كشف الحساب",
    href: "/balance",
    icon: Wallet,
    color: "bg-green-600",
  },
  {
    title: "المنتجين",
    href: "/producers",
    icon: Users,
    color: "bg-purple-600",
  },
  {
    title: "الملف الشخصي",
    href: "/profile",
    icon: User,
    color: "bg-orange-500",
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl bg-white border shadow-sm p-6">

      <h2 className="text-xl font-bold mb-6">
        الوصول السريع
      </h2>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border p-5 hover:shadow-lg transition"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-white ${item.color}`}
              >
                <Icon size={28} />
              </div>

              <h3 className="mt-5 font-bold text-lg">
                {item.title}
              </h3>
            </Link>
          );
        })}

      </div>

    </div>
  );
}