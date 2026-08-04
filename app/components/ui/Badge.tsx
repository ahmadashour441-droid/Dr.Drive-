interface BadgeProps {
  status: string;
}

export default function Badge({ status }: BadgeProps) {
  const colors: Record<string, string> = {
    Completed:
      "bg-green-100 text-green-700",

    Pending:
      "bg-yellow-100 text-yellow-700",

    Cancelled:
      "bg-red-100 text-red-700",

    Paid:
      "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`
        px-3
        py-1
        rounded-full
        text-sm
        font-semibold
        ${colors[status] ?? "bg-gray-100 text-gray-700"}
      `}
    >
      {status}
    </span>
  );
}