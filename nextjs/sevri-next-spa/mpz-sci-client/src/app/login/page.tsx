"use client";

import { Suspense, useEffect } from "react";

function LoginContent() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      const baseUrl = window.location.origin;
      window.location.href = `${baseUrl}/api/auth/callback/azure-ad?code=${encodeURIComponent(code)}`;
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Procesando autenticación...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}