import { LoaderCircle } from "lucide-react";

export function Loading() {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center gap-3 text-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#082b63]" />

        <p className="text-sm font-medium text-gray-600">
          Cargando información...
        </p>
      </div>
    </div>
  );
}