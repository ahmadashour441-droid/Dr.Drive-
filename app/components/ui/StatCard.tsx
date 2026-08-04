import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 p-7">

      <div className="flex items-center justify-between">

        <div className="flex-1 min-w-0">

          <p className="text-sm font-medium text-slate-500 mb-2">
            {title}
          </p>

          <h2 className="text-4xl font-bold text-slate-800 truncate">
            {value}
          </h2>

        </div>

        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md ml-5 ${color}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}