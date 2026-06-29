"use client";

import { useEffect, useState } from "react";
import { Citizen } from "@/types/citizen";
import { ServiceGrid } from "@/components/dashboard/ServiceGrid";

type MunicipalSearchSession = {
  searchType: "national" | "foreign" | "property";
  identifier: string;
  email: string;
  citizen?: Citizen;
};

export default function DashboardPage() {
  const [session, setSession] = useState<MunicipalSearchSession | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedSession = sessionStorage.getItem("municipalSearch");

      if (storedSession) {
        setSession(JSON.parse(storedSession));
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="space-y-6">
      {!session?.citizen && (
        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
          Consulta iniciada por número de finca:{" "}
          <strong>{session?.identifier}</strong>
        </div>
      )}

      <ServiceGrid />
    </div>
  );
}
