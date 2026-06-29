import { OutstandingPayment } from "@/types/payment";
import { AlertTriangle, CheckCircle, WalletCards } from "lucide-react";

interface OutstandingBalanceCardProps {
  payments: OutstandingPayment[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(value);
}

export function OutstandingBalanceCard({
  payments,
}: OutstandingBalanceCardProps) {
  const total = payments.reduce((sum, item) => sum + item.monto, 0);
  const overdue = payments.filter(
    (item) => item.estado.toLowerCase() === "vencido"
  );

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
          <WalletCards className="h-6 w-6 text-[#082b63]" />
        </div>

        <p className="text-sm font-medium text-gray-500">Total pendiente</p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          {formatCurrency(total)}
        </h2>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>

        <p className="text-sm font-medium text-gray-500">Rubros vencidos</p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          {overdue.length}
        </h2>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>

        <p className="text-sm font-medium text-gray-500">Total de registros</p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          {payments.length}
        </h2>
      </div>
    </div>
  );
}