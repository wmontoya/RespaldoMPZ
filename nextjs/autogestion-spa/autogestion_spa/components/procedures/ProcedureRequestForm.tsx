"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createProcedureRequest } from "@/lib/api/procedureRequests";
import type { Procedure } from "@/types/procedure";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// Teléfono de Costa Rica: 8 dígitos.
const PHONE_RE = /^\d{8}$/;

const inputClass =
  "w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-[#082b63] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500";

const labelClass = "mb-2 block text-sm font-medium text-gray-800";

type Props = {
  /** Tipo de trámite seleccionado (define si pide número de finca). */
  procedure: Procedure;
  /** Cédula del usuario autenticado (no editable). */
  cedula: string;
  /** Se invoca tras registrar un trámite con éxito (para refrescar el historial). */
  onCreated?: () => void;
  /** Número de finca con el que se precarga el campo (ej. desde Bienes Inmuebles). */
  initialPropertyNumber?: string;
};

export function ProcedureRequestForm({
  procedure,
  cedula,
  onCreated,
  initialPropertyNumber,
}: Props) {
  const { generateToken } = useAuth();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyNumber, setPropertyNumber] = useState(
    initialPropertyNumber ?? "",
  );

  // Sincroniza el número de finca cuando llega/ cambia desde la URL
  // (ej. al solicitar la constancia desde Bienes Inmuebles).
  useEffect(() => {
    if (initialPropertyNumber) {
      setPropertyNumber(initialPropertyNumber);
    }
  }, [initialPropertyNumber]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    if (procedure.requiresProperty && !propertyNumber.trim()) {
      return "Ingrese el número de finca para este trámite.";
    }
    return "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const token = await generateToken();
      const response = await createProcedureRequest(
        {
          cedula,
          email: email.trim(),
          phone: phone.trim(),
          type_id: procedure.id,
          ...(procedure.requiresProperty
            ? { property_number: propertyNumber.trim() }
            : {}),
        },
        token,
      );

      if (!response.success || !response.data) {
        setError(response.error ?? "No se pudo registrar el trámite.");
        return;
      }

      setSuccess(`Trámite registrado correctamente. N° ${response.data.number}`);
      setEmail("");
      setPhone("");
      setPropertyNumber("");
      onCreated?.();
    } catch {
      setError("No fue posible registrar el trámite. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h3 className="text-lg font-bold text-[#082b63]">Nueva solicitud</h3>
        <p className="mt-1 text-sm text-gray-500">{procedure.title}</p>
      </div>

      <div>
        <label className={labelClass}>Cédula</label>
        <input type="text" value={cedula} disabled className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>
          Correo electrónico <span className="text-rose-500">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="correo@ejemplo.com"
          autoComplete="email"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          Número de teléfono <span className="text-rose-500">*</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(event) =>
            setPhone(event.target.value.replace(/[^\d]/g, "").slice(0, 8))
          }
          placeholder="Ej. 88888888"
          inputMode="numeric"
          maxLength={8}
          autoComplete="tel"
          className={inputClass}
        />
      </div>

      {procedure.requiresProperty && (
        <div>
          <label className={`${labelClass} flex items-center gap-1.5`}>
            Número de finca <span className="text-rose-500">*</span>
            <span className="group relative inline-flex">
              <Info className="h-4 w-4 cursor-help text-[#082b63]" />
              <span className="pointer-events-none absolute left-1/2 top-6 z-20 hidden w-64 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-3 text-xs font-normal leading-relaxed text-gray-600 shadow-lg group-hover:block">
                Si no conoce el número de su propiedad, puede consultarlo en el
                apartado de <strong className="text-[#082b63]">Bienes
                Inmuebles</strong> de nuestro sistema.
              </span>
            </span>
          </label>
          <input
            type="text"
            value={propertyNumber}
            onChange={(event) => setPropertyNumber(event.target.value)}
            placeholder="Ej. 123456-000"
            className={inputClass}
          />
        </div>
      )}

      {error && (
        <p className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-[#082b63] px-8 py-3 font-medium text-white transition hover:bg-[#0b3b85] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Registrando..." : "Registrar trámite"}
      </button>
    </form>
  );
}
