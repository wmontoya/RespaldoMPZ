// COMPONENTE DE SOLICITUD DE ESTADO DE CUENTA.
// MUESTRA UN FORMULARIO (estilo guiado por pasos) DONDE EL USUARIO INGRESA SU
// CORREO, TELÉFONO Y SELECCIONA EL TIPO DE ESTADO DE CUENTA A SOLICITAR.
// EL FORMULARIO SE ARRECUESTA AL MENÚ LATERAL Y LOS MENSAJES INFORMATIVOS
// APARECEN A SU COSTADO (en el lugar del historial de los otros trámites).
// VALIDA EN EL CLIENTE, ENVÍA LA SOLICITUD AL BACKEND, MUESTRA EL RESULTADO
// (procesando / éxito / sin datos / error) Y, AL FINALIZAR CON ÉXITO, LIMPIA
// TODOS LOS CAMPOS.

"use client";

import { Fragment, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  CircleUser,
  ClipboardList,
  FileText,
  IdCard,
  Inbox,
  Loader2,
  Send,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { requestAccountStatement } from "@/lib/api/procedureRequests";
import type { Procedure } from "@/types/procedure";
import type { AccountStatementType } from "@/types/procedureRequest";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// Teléfono de Costa Rica: 8 dígitos.
const PHONE_RE = /^\d{8}$/;

const ACCENT = "#082b63";

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-[#082b63] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500";

const labelClass = "mb-2 block text-sm font-medium text-gray-700";

const STATEMENT_OPTIONS: {
  value: AccountStatementType;
  label: string;
  help: string;
  icon: LucideIcon;
}[] = [
  {
    value: "vencido",
    label: "Estado vencidos",
    help: "Solo la información vencida.",
    icon: CalendarDays,
  },
  {
    value: "al_cobro",
    label: "Estado al cobro",
    help: "Solo la información en periodo (no vencida).",
    icon: FileText,
  },
  {
    value: "total",
    label: "Estado total",
    help: "Incluye información vencida y al cobro.",
    icon: CircleDollarSign,
  },
];

type Status = "idle" | "processing" | "success" | "empty" | "error";

type Props = {
  /** Tipo de trámite "Estado de Cuenta". */
  procedure: Procedure;
  /** Cédula del usuario autenticado (no editable). */
  cedula: string;
};

export function AccountStatementForm({ procedure, cedula }: Props) {
  const { generateToken } = useAuth();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [statementType, setStatementType] = useState<AccountStatementType | "">(
    "",
  );

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  const processing = status === "processing";

  // Al editar un campo tras un resultado, se vuelve al estado inicial para que
  // el panel lateral y los pasos reflejen la nueva interacción.
  function clearTerminalStatus() {
    if (status === "success" || status === "empty" || status === "error") {
      setStatus("idle");
      setMessage("");
    }
  }

  // Estado de los pasos del encabezado.
  const contactComplete =
    EMAIL_RE.test(email.trim()) && PHONE_RE.test(phone.trim());
  const finished = status === "success";
  const steps = [
    { label: "Contacto", done: finished || contactComplete },
    { label: "Tipo de estado", done: finished || !!statementType },
    { label: "Confirmación", done: finished },
  ];
  const currentStep = steps.findIndex((step) => !step.done);

  function validate() {
    if (!cedula) {
      return "No se encontró la cédula del usuario. Inicie una consulta nuevamente.";
    }
    if (!email.trim()) {
      return "Ingrese un correo electrónico.";
    }
    if (!EMAIL_RE.test(email.trim())) {
      return "Ingrese un correo electrónico con un formato válido.";
    }
    if (!phone.trim()) {
      return "Ingrese un número de teléfono.";
    }
    if (!PHONE_RE.test(phone.trim())) {
      return "Ingrese un teléfono válido de 8 dígitos.";
    }
    if (!statementType) {
      return "Seleccione el tipo de estado de cuenta.";
    }
    return "";
  }

  function resetForm() {
    setEmail("");
    setPhone("");
    setStatementType("");
    setValidationError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");

    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      setStatus("processing");
      setMessage("");

      const token = await generateToken();
      const response = await requestAccountStatement(
        {
          cedula,
          email: email.trim(),
          phone: phone.trim(),
          statementType: statementType as AccountStatementType,
        },
        token,
      );

      if (!response.success) {
        setStatus("error");
        setMessage(
          response.error ??
            "Ocurrió un error al generar el estado de cuenta. Intente nuevamente.",
        );
        return;
      }

      if (response.hasData === false) {
        setStatus("empty");
        setMessage(
          response.message ??
            "No se encontraron saldos pendientes para el tipo de estado de cuenta seleccionado.",
        );
        return;
      }

      setStatus("success");
      setMessage(
        response.message ??
          "Su solicitud ha sido atendida correctamente. El estado de cuenta fue enviado al correo electrónico indicado.",
      );
      // Punto 3: el formulario queda como si no se hubiera digitado nada.
      resetForm();
    } catch {
      setStatus("error");
      setMessage(
        "No fue posible procesar su solicitud. Intente nuevamente más tarde.",
      );
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2"
      >
        {/* Encabezado por pasos */}
        <div className="flex items-start">
          {steps.map((step, index) => {
            const active = index === currentStep;
            const highlighted = step.done || active;
            return (
              <Fragment key={step.label}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                      highlighted
                        ? "bg-[#082b63] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.done ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span
                    className={`whitespace-nowrap text-xs font-medium ${
                      highlighted ? "text-[#082b63]" : "text-gray-400"
                    }`}
                  >
                    {index + 1}. {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mt-[18px] h-0.5 flex-1 rounded ${
                      step.done ? "bg-[#082b63]" : "bg-gray-200"
                    }`}
                  />
                )}
              </Fragment>
            );
          })}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-[#082b63]">
            Solicitud de estado de cuenta
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Complete la información de contacto y seleccione el tipo de estado
            de cuenta que desea solicitar.
          </p>
        </div>

        {/* Cédula (no editable) */}
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}
          >
            <IdCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Cédula</p>
            <p className="text-lg font-bold text-gray-900">{cedula}</p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Datos de contacto */}
        <section className="space-y-4">
          <SectionHeader icon={CircleUser} title="Datos de contacto" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Correo electrónico <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearTerminalStatus();
                }}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                disabled={processing}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Teléfono móvil <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value.replace(/[^\d]/g, "").slice(0, 8));
                  clearTerminalStatus();
                }}
                placeholder="Ej. 88888888"
                inputMode="numeric"
                maxLength={8}
                autoComplete="tel"
                disabled={processing}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Tipo de estado de cuenta */}
        <section className="space-y-4">
          <SectionHeader
            icon={ClipboardList}
            title="Tipo de estado de cuenta"
            subtitle="Selecciona una opción"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {STATEMENT_OPTIONS.map((option) => {
              const selected = statementType === option.value;
              const OptionIcon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl border p-4 pt-9 text-center transition ${
                    selected
                      ? "border-[#082b63] bg-blue-50/60 ring-1 ring-[#082b63]"
                      : "border-gray-200 hover:border-gray-300"
                  } ${processing ? "pointer-events-none opacity-60" : ""}`}
                >
                  <input
                    type="radio"
                    name="statementType"
                    value={option.value}
                    checked={selected}
                    onChange={() => {
                      setStatementType(option.value);
                      clearTerminalStatus();
                    }}
                    disabled={processing}
                    className="absolute left-3 top-3 accent-[#082b63]"
                  />
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      selected ? "text-[#082b63]" : "text-gray-400"
                    }`}
                    style={{
                      backgroundColor: selected ? `${ACCENT}1a` : "#f3f4f6",
                    }}
                  >
                    <OptionIcon className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {option.label}
                  </span>
                  <span className="text-xs text-gray-500">{option.help}</span>
                </label>
              );
            })}
          </div>
        </section>

        {validationError && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {validationError}
          </p>
        )}

        <button
          type="submit"
          disabled={processing}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#082b63] px-8 py-3.5 font-medium text-white transition hover:bg-[#0b3b85] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {processing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {processing ? "Procesando..." : "Solicitar estado de cuenta"}
        </button>
      </form>

      {/* Mensajes informativos (al costado del formulario) */}
      <div className="lg:col-span-1">
        <StatusPanel status={status} message={message} />
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h4 className="text-base font-bold text-[#082b63]">{title}</h4>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function StatusPanel({
  status,
  message,
}: {
  status: Status;
  message: string;
}) {
  const base =
    "flex h-full min-h-[320px] flex-col items-center justify-center rounded-3xl border p-6 text-center";

  if (status === "processing") {
    return (
      <div className={`${base} border-blue-200 bg-blue-50 text-[#082b63]`}>
        <Loader2 className="mb-4 h-10 w-10 animate-spin" />
        <p className="text-sm font-medium">
          Su solicitud de estado de cuenta está en proceso. Por favor espere
          mientras se genera y envía el documento.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div
        className={`${base} border-emerald-200 bg-emerald-50 text-emerald-800`}
      >
        <CheckCircle2 className="mb-4 h-10 w-10" />
        <p className="text-sm font-medium">
          {message} Por favor revise su bandeja de entrada o correo no deseado.
        </p>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className={`${base} border-amber-200 bg-amber-50 text-amber-800`}>
        <Inbox className="mb-4 h-10 w-10" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={`${base} border-rose-200 bg-rose-50 text-rose-700`}>
        <TriangleAlert className="mb-4 h-10 w-10" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    );
  }

  // idle
  return (
    <div className={`${base} border-gray-200 bg-white text-gray-500`}>
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}
      >
        <FileText className="h-7 w-7" />
      </div>
      <p className="text-sm font-semibold text-gray-700">
        Estado de su solicitud
      </p>
      <p className="mt-2 text-sm">
        Complete el formulario y solicite su estado de cuenta. Aquí verá el
        avance: el documento se genera y se envía automáticamente al correo
        indicado.
      </p>
    </div>
  );
}
