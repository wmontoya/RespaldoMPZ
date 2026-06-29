import { Info } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
        <Info className="h-6 w-6 text-[#082b63]" />
      </div>

      <h2 className="text-lg font-bold text-gray-900">{title}</h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-gray-500">
        {description}
      </p>
    </div>
  );
}