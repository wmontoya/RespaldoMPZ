"use client";

import { useEffect, useState } from "react";
import { Citizen } from "@/types/citizen";
import { CitizenSummaryCard } from "@/components/dashboard/CitizenSummaryCard";
import { Loading } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";

type MunicipalSearchSession = {
  citizen?: Citizen;
};

export default function ProfilePage() {
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedSession = sessionStorage.getItem("municipalSearch");

      if (storedSession) {
        const parsedSession = JSON.parse(
          storedSession
        ) as MunicipalSearchSession;

        setCitizen(parsedSession.citizen ?? null);
      }

      setLoading(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (!citizen) {
    return (
      <EmptyState
        title="Información no disponible"
        description="No se encontró información del contribuyente para la consulta realizada."
      />
    );
  }

  return <CitizenSummaryCard citizen={citizen} />;
}
