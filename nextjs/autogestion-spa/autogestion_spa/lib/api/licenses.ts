import type { BusinessLicenseResponse } from "@/types/license";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getLicensesById(
  cedula: string,
  token: string
): Promise<BusinessLicenseResponse> {
  const response = await fetch(`${API_URL}/api/v1/yaipan/patent_information`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ cedula }),
  });

  if (!response.ok) {
    return {
      success: false,
      contribuyente: [],
      error: "No fue posible consultar las patentes.",
    };
  }

  return response.json();
}