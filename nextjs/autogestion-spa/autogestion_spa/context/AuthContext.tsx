"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type AuthContextType = {
  token: string;
  loadingToken: boolean;
  /**
   * Devuelve un token JWT válido. Si el token en memoria está por vencer (o ya
   * venció) lo renueva automáticamente. Use `force` para forzar la renovación.
   */
  generateToken: (force?: boolean) => Promise<string>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Margen de seguridad: se renueva si faltan menos de 30s para expirar, para
// cubrir la latencia entre que se obtiene el token y el servidor lo valida.
const EXPIRY_BUFFER_MS = 30_000;

/** Lee el `exp` (ms) del JWT sin verificar la firma. Null si no se puede leer. */
function getTokenExpiryMs(token: string): number | null {
  try {
    const raw = token.startsWith("Bearer ") ? token.slice(7) : token;
    const payload = raw.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized)) as { exp?: number };
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** True si el token aún es válido con margen de seguridad. */
function isTokenValid(token: string): boolean {
  if (!token) return false;
  const expiryMs = getTokenExpiryMs(token);
  // Si no se puede leer la expiración, se fuerza la renovación.
  if (expiryMs === null) return false;
  return expiryMs - Date.now() > EXPIRY_BUFFER_MS;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState("");
  const [loadingToken, setLoadingToken] = useState(false);
  // Refs para leer el último token sin closures obsoletos y para deduplicar
  // solicitudes simultáneas de renovación.
  const tokenRef = useRef("");
  const inflightRef = useRef<Promise<string> | null>(null);

  const fetchNewToken = useCallback(async () => {
    setLoadingToken(true);
    try {
      const response = await fetch("/autogestion/api/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.error ?? "No se pudo generar el token.");
      }

      tokenRef.current = data.token;
      setToken(data.token);
      return data.token as string;
    } finally {
      setLoadingToken(false);
    }
  }, []);

  const generateToken = useCallback(
    async (force = false) => {
      if (!force && isTokenValid(tokenRef.current)) {
        return tokenRef.current;
      }

      // Si ya hay una renovación en curso, se reutiliza (evita duplicar
      // solicitudes cuando varios componentes piden el token a la vez).
      if (inflightRef.current) {
        return inflightRef.current;
      }

      const promise = fetchNewToken().finally(() => {
        inflightRef.current = null;
      });
      inflightRef.current = promise;
      return promise;
    },
    [fetchNewToken],
  );

  return (
    <AuthContext.Provider
      value={{
        token,
        loadingToken,
        generateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return context;
}
