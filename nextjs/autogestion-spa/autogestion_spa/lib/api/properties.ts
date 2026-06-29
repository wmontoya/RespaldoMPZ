import type { PropertiesResponse, HousingUnitsResponse } from "@/types/property";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: token,
  };
}

export async function getPropertiesByCitizen(
  cedula: string,
  token: string
): Promise<PropertiesResponse> {
  const response = await fetch(`${API_URL}/api/v1/yaipan/people_information`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ cedula }),
  });

  return response.json();
}

export async function getHousingUnitsByFinca(
  numFinca: string,
  token: string
): Promise<HousingUnitsResponse> {
  const response = await fetch(`${API_URL}/api/v1/yaipan/housting_units`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({
      num_finca: numFinca,
    }),
  });

  return response.json();
}

export async function getLandUseByFinca(numFinca: string, token: string) {
  const response = await fetch(`${API_URL}/api/v1/yaipan/land_use`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({
      num_finca: numFinca,
    }),
  });

  return response.json();
}

export async function getVisadosByFinca(numFinca: string, token: string) {
  const response = await fetch(`${API_URL}/api/v1/yaipan/visados`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({
      num_finca: numFinca,
    }),
  });

  return response.json();
}

export async function getConstructionsByFinca(numFinca: string, token: string) {
  const response = await fetch(`${API_URL}/api/v1/yaipan/constructions`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({
      num_finca: numFinca,
    }),
  });

  return response.json();
}

export async function getPermitsByFinca(numFinca: string, token: string) {
  const response = await fetch(`${API_URL}/api/v1/yaipan/permits_const`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({
      num_finca: numFinca,
    }),
  });

  return response.json();
}