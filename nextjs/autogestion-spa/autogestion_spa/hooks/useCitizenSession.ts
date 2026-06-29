"use client";

import { useEffect, useState } from "react";

export type CitizenSession = {
  searchType?: string;
  identifier?: string; // cédula del usuario autenticado
  email?: string;
  citizen?: unknown;
};

/**
 * Lee la sesión del contribuyente almacenada al iniciar la consulta
 * (sessionStorage "municipalSearch"). La cédula está en `identifier`.
 */
export function useCitizenSession() {
  const [session, setSession] = useState<CitizenSession | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("municipalSearch");
      setSession(raw ? (JSON.parse(raw) as CitizenSession) : null);
    } catch {
      setSession(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  return { session, cedula: session?.identifier ?? "", loaded };
}
