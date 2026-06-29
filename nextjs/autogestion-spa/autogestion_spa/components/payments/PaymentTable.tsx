import { OutstandingPayment } from "@/types/payment";

interface PaymentTableProps {
  payments: OutstandingPayment[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(value);
}

function getStatusClass(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "vencido") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (normalizedStatus === "al cobro") {
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }

  return "bg-blue-50 text-blue-700 border-blue-200";
}

export function PaymentTable({ payments }: PaymentTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-5">
        <h2 className="text-lg font-bold text-[#082b63]">
          Detalle de pendientes
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Listado de obligaciones municipales asociadas al contribuyente.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-4">Concepto</th>
              <th className="px-6 py-4">Finca</th>
              <th className="px-6 py-4">Periodo</th>
              <th className="px-6 py-4">Fecha corte</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Monto</th>
              <th className="px-6 py-4 text-right">Interés</th>
              <th className="px-6 py-4 text-right">Total</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {payments.map((payment) => {
              const total =
                payment.saldo + payment.saldoInteres + payment.montoMulta;

              return (
                <tr key={payment.numeroDocumento} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {payment.descripcion}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {payment.numeroFinca}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {payment.year}-{payment.periodo}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {payment.fechaCorte}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                        payment.estado
                      )}`}
                    >
                      {payment.estado}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right text-gray-600">
                    {formatCurrency(payment.saldo)}
                  </td>

                  <td className="px-6 py-4 text-right text-gray-600">
                    {formatCurrency(payment.saldoInteres)}
                  </td>

                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {formatCurrency(total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}