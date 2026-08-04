import {
  ClipboardList,
  Wallet,
  Car,
  Users,
} from "lucide-react";

import StatCard from "./StatCard";

type Props = {
  totalOrders?: number;
  balance?: number;
  captains?: number;
  producers?: number;
};

export default function StatsSection({
  totalOrders = 0,
  balance = 0,
  captains = 0,
  producers = 0,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="إجمالي الطلبات"
        value={totalOrders}
        color="bg-blue-600"
        icon={<ClipboardList size={28} />}
      />

      <StatCard
        title="الرصيد الحالي"
        value={`${balance} JD`}
        color="bg-green-600"
        icon={<Wallet size={28} />}
      />

      <StatCard
        title="عدد الكباتن"
        value={captains}
        color="bg-orange-500"
        icon={<Car size={28} />}
      />

      <StatCard
        title="عدد المنتجين"
        value={producers}
        color="bg-purple-600"
        icon={<Users size={28} />}
      />

    </div>
  );
}