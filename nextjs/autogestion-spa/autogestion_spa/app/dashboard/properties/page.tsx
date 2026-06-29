"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConsultaPropiedades } from "@/components/properties/PropertyInquiry";
import { Loading } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import { useProperties } from "@/hooks/useProperties";

interface MunicipalSearch {
  searchType: "national" | "foreign";
  identifier: string;
  citizen: unknown;
}

export default function PropertiesPage() {
  const router = useRouter();
  const { contribuyente, loading, error, searchProperties } = useProperties();

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

      searchProperties(parsedSearch.identifier);
    } catch {
      router.push("/");
    }
  }, [router, searchProperties]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <EmptyState
        title="No fue posible cargar los bienes inmuebles"
        description={error}
      />
    );
  }

  if (!contribuyente) {
    return (
      <EmptyState
        title="Información no disponible"
        description="No se encontró información de bienes inmuebles para la consulta realizada."
      />
    );
  }

  if (contribuyente.propiedades.length === 0) {
    return (
      <EmptyState
        title="Sin bienes inmuebles registrados"
        description="No se encontraron bienes inmuebles asociados a este contribuyente."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-[#082b63]">
          Mis bienes inmuebles
        </p>

        <h2 className="mt-2 text-xl font-bold text-gray-900">
          Consulta de bienes inmuebles
        </h2>

        <p className="mt-3 max-w-5xl text-sm leading-relaxed text-gray-600">
          Desde este apartado podrá consultar la información relacionada con
          los bienes inmuebles asociados al contribuyente, incluyendo datos
          generales, ocupaciones, uso de suelo, visados, construcciones,
          permisos y demás información registral disponible.
        </p>
      </div>

      <ConsultaPropiedades contribuyente={contribuyente} />
    </div>
  );
}