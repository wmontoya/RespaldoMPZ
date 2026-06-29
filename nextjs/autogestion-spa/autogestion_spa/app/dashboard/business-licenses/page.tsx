"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LicenseInquiry } from "@/components/licenses/LicenseInquiry";
import { Loading } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLicenses } from "@/hooks/useLicenses";

interface MunicipalSearch {
  searchType: "national" | "foreign";
  identifier: string;
  citizen: unknown;
}

export default function BusinessLicensesPage() {
  const router = useRouter();
  const { licenses, loading, error, searchLicenses } = useLicenses();

  useEffect(() => {
    const savedSearch = sessionStorage.getItem("municipalSearch");

    if (!savedSearch) {
      router.push("/");
      return;
    }

    try {
      const parsedSearch = JSON.parse(savedSearch) as MunicipalSearch;

      if (!parsedSearch.identifier) {
        router.push("/");
        return;
      }

      searchLicenses(parsedSearch.identifier);
    } catch {
      router.push("/");
    }
  }, [router, searchLicenses]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <EmptyState
        title="No fue posible cargar las patentes"
        description={error}
      />
    );
  }

  if (licenses.length === 0) {
    return (
      <EmptyState
        title="Sin patentes registradas"
        description="No se encontraron patentes comerciales ni licencias de licores asociadas a este contribuyente."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-[#082b63]">Mis patentes</p>

        <h2 className="mt-2 text-xl font-bold text-gray-900">
          Consulta de patentes
        </h2>

        <p className="mt-3 max-w-5xl text-sm leading-relaxed text-gray-600">
          Desde este apartado podrá consultar la información relacionada con
          patentes comerciales y licencias de licores asociadas al
          contribuyente.
        </p>
      </div>

      <LicenseInquiry licenses={licenses} />
    </div>
  );
}