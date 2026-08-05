import { ReactNode } from "react";

interface TableCardProps {
  title: string;
  children: ReactNode;
}

export default function TableCard({
  title,
  children,
}: TableCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

      <div className="px-7 py-5 border-b border-slate-200 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">
          {title}
        </h2>
      </div>

      <div className="w-full overflow-x-auto rounded-2xl">
        {children}
      </div>

    </div>
  );
}