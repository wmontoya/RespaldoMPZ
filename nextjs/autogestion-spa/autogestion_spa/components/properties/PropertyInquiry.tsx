"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

import {
  getConstructionsByFinca,
  getHousingUnitsByFinca,
  getLandUseByFinca,
  getPermitsByFinca,
  getVisadosByFinca,
} from "@/lib/api/properties";
import {
  adaptarConstructions,
  adaptarHousingUnits,
  adaptarLandUse,
  adaptarPermits,
  adaptarVisados,
  type Contribuyente,
  type Propiedad,
} from "@/types/property";
import { PropiedadesList } from "@/components/properties/PropertiesList";
import { DetallePropiedad } from "@/components/properties/PropertyDetail";

type ConsultaPropiedadesProps = {
  contribuyente: Contribuyente;
};

export function ConsultaPropiedades({ contribuyente }: ConsultaPropiedadesProps) {
  const { generateToken } = useAuth();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [ocupacionesByFinca, setOcupacionesByFinca] = useState<
    Record<string, Propiedad["ocupaciones"]>
  >({});
  const [usosSueloByFinca, setUsosSueloByFinca] = useState<
    Record<string, Propiedad["usosSuelo"]>
  >({});
  const [visadosByFinca, setVisadosByFinca] = useState<
    Record<string, Propiedad["visados"]>
  >({});
  const [construccionesByFinca, setConstruccionesByFinca] = useState<
    Record<string, Propiedad["construcciones"]>
  >({});
  const [permisosByFinca, setPermisosByFinca] = useState<
    Record<string, Propiedad["permisos"]>
  >({});

  const [loadingDetalle, setLoadingDetalle] = useState(false);

  async function handleSelectProperty(propiedad: Propiedad) {
    setSelectedId(propiedad.id);

    const folioReal = propiedad.folioReal;
    if (!folioReal) return;

    const fincaKey = String(folioReal);

    const alreadyLoaded =
      ocupacionesByFinca[fincaKey] &&
      usosSueloByFinca[fincaKey] &&
      visadosByFinca[fincaKey] &&
      construccionesByFinca[fincaKey] &&
      permisosByFinca[fincaKey];

    if (alreadyLoaded) return;

    setLoadingDetalle(true);

    try {
      const authToken = await generateToken();
      const [
        ocupacionesResponse,
        usosSueloResponse,
        visadosResponse,
        construccionesResponse,
        permisosResponse,
      ] = await Promise.all([
        getHousingUnitsByFinca(fincaKey, authToken),
        getLandUseByFinca(fincaKey, authToken),
        getVisadosByFinca(fincaKey, authToken),
        getConstructionsByFinca(fincaKey, authToken),
        getPermitsByFinca(fincaKey, authToken),
      ]);

      if (ocupacionesResponse.success) {
        setOcupacionesByFinca((prev) => ({
          ...prev,
          [fincaKey]: adaptarHousingUnits(
            ocupacionesResponse.ocupaciones ?? [],
          ),
        }));
      }

      if (usosSueloResponse.success) {
        setUsosSueloByFinca((prev) => ({
          ...prev,
          [fincaKey]: adaptarLandUse(usosSueloResponse.usos_suelo ?? []),
        }));
      }

      if (visadosResponse.success) {
        setVisadosByFinca((prev) => ({
          ...prev,
          [fincaKey]: adaptarVisados(visadosResponse.visados ?? []),
        }));
      }

      if (construccionesResponse.success) {
        setConstruccionesByFinca((prev) => ({
          ...prev,
          [fincaKey]: adaptarConstructions(
            construccionesResponse.construcciones ?? [],
          ),
        }));
      }

      if (permisosResponse.success) {
        setPermisosByFinca((prev) => ({
          ...prev,
          [fincaKey]: adaptarPermits(permisosResponse.permisos ?? []),
        }));
      }
    } finally {
      setLoadingDetalle(false);
    }
  }

  const currentSelectedId = selectedId;

  const selectedBase =
    contribuyente.propiedades.find(
      (propiedad) => propiedad.id === currentSelectedId,
    ) ?? null;

  const selected = selectedBase
    ? {
        ...selectedBase,
        ocupaciones: selectedBase.folioReal
          ? (ocupacionesByFinca[String(selectedBase.folioReal)] ?? [])
          : [],
        usosSuelo: selectedBase.folioReal
          ? (usosSueloByFinca[String(selectedBase.folioReal)] ?? [])
          : [],
        visados: selectedBase.folioReal
          ? (visadosByFinca[String(selectedBase.folioReal)] ?? [])
          : [],
        construcciones: selectedBase.folioReal
          ? (construccionesByFinca[String(selectedBase.folioReal)] ?? [])
          : [],
        permisos: selectedBase.folioReal
          ? (permisosByFinca[String(selectedBase.folioReal)] ?? [])
          : [],
      }
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-gray-900">
          Propiedades asociadas
        </h2>

        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-900 px-2 text-xs font-semibold text-white">
          {contribuyente.propiedades.length}
        </span>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[500px_1fr]">
        <section className="min-w-0">
          <PropiedadesList
            propiedades={contribuyente.propiedades}
            selectedId={currentSelectedId}
            onSelect={handleSelectProperty}
            onPageChange={() => setSelectedId(null)}
          />
        </section>

        <section className="min-w-0 self-stretch">
          {loadingDetalle && (
            <p className="mb-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
              Consultando detalle de la finca...
            </p>
          )}

          <DetallePropiedad propiedad={selected} />
        </section>
      </div>
    </div>
  );
}