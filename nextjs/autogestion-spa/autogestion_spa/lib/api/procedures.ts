import type { ProceduresResponse } from "@/types/procedure";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getProcedures(
  token: string,
): Promise<ProceduresResponse> {
  const response = await fetch(`${API_URL}/api/v1/yaipan/procedure_types`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({}),
  });

  return response.json();
}
