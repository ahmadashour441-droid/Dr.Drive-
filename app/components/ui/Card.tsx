import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        bg-white
        rounded-3xl
        border
        border-slate-200
        shadow-sm
        hover:shadow-md
        transition-all
        duration-300
        p-7
        ${className}
      `}
    >
      {children}
    </div>
  );
}