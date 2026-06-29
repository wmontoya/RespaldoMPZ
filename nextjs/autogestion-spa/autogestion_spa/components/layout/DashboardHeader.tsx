"use client";

import { useEffect, useState } from "react";

type SessionPayload = {
  citizen?: unknown;
  contribuyente?: unknown;
  data?: unknown;
};

function getCitizenDisplayName(value: unknown): string {
  if (Array.isArray(value)) {
    for (const item of value) {
      const name = getCitizenDisplayName(item);
      if (name) {
        return name;
      }
    }
    return "";
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  const candidate = value as Record<string, unknown>;
  const possibleFields = [
    candidate.nombre_completo,
    candidate.nombre,
    candidate.name,
    candidate.full_name,
    candidate.fullName,
  ];

  for (const field of possibleFields) {
    if (typeof field === "string" && field.trim().length > 0) {
      return field.trim();
    }
  }

  return "";
}

function getStoredCitizen(rawSession: unknown): unknown {
  if (!rawSession || typeof rawSession !== "object") {
    return null;
  }

  const session = rawSession as SessionPayload;

  if (session.citizen !== undefined) {
    return session.citizen;
  }

  if (session.contribuyente !== undefined) {
    return session.contribuyente;
  }

  if (Array.isArray(session.data)) {
    return session.data[0] ?? null;
  }

  return session.data ?? null;
}

export function DashboardHeader() {
  const [displayName, setDisplayName] = useState<string>("Contribuyente");
  const [fechaIngreso, setFechaIngreso] = useState<string>("Cargando...");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const storedSession = sessionStorage.getItem("municipalSearch");
        const parsedSession = storedSession ? JSON.parse(storedSession) : null;
        const rawCitizen = getStoredCitizen(parsedSession);
        const resolvedName = getCitizenDisplayName(rawCitizen);

        setDisplayName(resolvedName || "Contribuyente");
      } catch {
        setDisplayName("Contribuyente");
      } finally {
        setFechaIngreso(new Date().toLocaleString("es-CR"));
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <header className="rounded-3xl bg-white px-6 py-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Hola, {displayName}
          </h1>
            
          <p className="mt-2 max-w-5xl text-base leading-relaxed text-gray-600">
            Bienvenido al Portal de Consulta Municipal. Desde aquí puede consultar sus bienes
            inmuebles, patentes registradas, historial de pagos y obligaciones pendientes.
          </p>
        </div>

        <div className="text-left text-xs text-gray-500 sm:text-right">
          <p>Última fecha de ingreso</p>
          <p >{fechaIngreso}</p>
        </div>
      </div>
    </header>
  );
}
