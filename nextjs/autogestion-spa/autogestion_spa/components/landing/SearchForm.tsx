"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCitizenById } from "@/lib/api/citizen";
import { useAuth } from "@/context/AuthContext";

type SearchType = "national" | "foreign" | "legal";

const placeholders: Record<SearchType, string> = {
  national: "Ej. 0118130899",
  foreign: "Ej. 123456789012",
  legal: "Ej. 3101123456",
};

const labels: Record<SearchType, string> = {
  national: "Cédula nacional",
  foreign: "Identificación extranjera",
  legal: "Cédula jurídica",
};

const maxLengths: Record<SearchType, number> = {
  national: 10,
  foreign: 12,
  legal: 10,
};

function validateIdentification(searchType: SearchType, value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return "Debe ingresar una identificación.";
  }

  if (searchType === "national" && !/^\d{10}$/.test(cleanValue)) {
    return "La cédula nacional debe contener exactamente 10 dígitos numéricos, sin guiones.";
  }

  if (searchType === "foreign" && !/^\d{12}$/.test(cleanValue)) {
    return "La identificación extranjera debe contener exactamente 12 dígitos numéricos, sin letras ni guiones.";
  }

  if (searchType === "legal" && !/^\d{10}$/.test(cleanValue)) {
    return "La cédula jurídica debe contener exactamente 10 dígitos numéricos, sin guiones.";
  }

  return "";
}

export function SearchForm() {
  const router = useRouter();
  const { generateToken } = useAuth();

  const [searchType, setSearchType] = useState<SearchType>("national");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSearchTypeChange(type: SearchType) {
    setSearchType(type);
    setIdentifier("");
    setError("");
  }

  function handleIdentifierChange(value: string) {
    const onlyNumbers = value.replace(/\D/g, "");
    setIdentifier(onlyNumbers.slice(0, maxLengths[searchType]));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanIdentifier = identifier.trim();
    const validationError = validateIdentification(searchType, cleanIdentifier);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const token = await generateToken();
      const response = await getCitizenById(cleanIdentifier, token);

      const rawCitizen = Array.isArray(response.contribuyente)
        ? response.contribuyente[0]
        : response.contribuyente;

      if (!response.success || !rawCitizen) {
        setError(
          response.error ?? "No se encontró información del contribuyente.",
        );
        return;
      }

      const citizenName =
        typeof rawCitizen?.nombre_completo === "string"
          ? rawCitizen.nombre_completo.trim()
          : "";

      if (!citizenName) {
        setError("No se encontró un nombre válido para el contribuyente.");
        return;
      }

      sessionStorage.setItem(
        "municipalSearch",
        JSON.stringify({
          searchType,
          identifier: cleanIdentifier,
          citizen: rawCitizen,
        }),
      );

      router.push("/dashboard");
    } catch {
      setError("No fue posible consultar la información del contribuyente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <h2 className="text-center text-2xl font-semibold text-gray-900 sm:text-3xl">
        Consulta Municipal
      </h2>

      <div className="rounded-md border border-gray-300 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="radio"
              name="searchType"
              checked={searchType === "national"}
              onChange={() => handleSearchTypeChange("national")}
            />
            Cédula nacional
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="radio"
              name="searchType"
              checked={searchType === "foreign"}
              onChange={() => handleSearchTypeChange("foreign")}
            />
            Identificación extranjera
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input
              type="radio"
              name="searchType"
              checked={searchType === "legal"}
              onChange={() => handleSearchTypeChange("legal")}
            />
            Cédula jurídica
          </label>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-800">
          {labels[searchType]}
        </label>

        <input
          type="text"
          value={identifier}
          onChange={(event) => handleIdentifierChange(event.target.value)}
          placeholder={placeholders[searchType]}
          maxLength={maxLengths[searchType]}
          inputMode="numeric"
          autoComplete="off"
          className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-500 px-8 py-3 font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Consultando..." : "Consultar"}
        </button>
      </div>
    </form>
  );
}
