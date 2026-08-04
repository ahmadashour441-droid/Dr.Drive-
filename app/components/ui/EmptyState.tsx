interface EmptyStateProps {
  title: string;
}

export default function EmptyState({
  title,
}: EmptyStateProps) {
  return (
    <div className="py-14 text-center">

      <div className="text-6xl mb-4">
        📭
      </div>

      <h3 className="text-xl font-bold text-slate-700">
        Nothing here yet
      </h3>

      <p className="text-slate-500 mt-2">
        {title}
      </p>

    </div>
  );
}