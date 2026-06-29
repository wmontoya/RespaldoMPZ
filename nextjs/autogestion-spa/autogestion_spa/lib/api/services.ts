import type { ServicesResponse } from "@/types/service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getServices(token: string): Promise<ServicesResponse> {
  const response = await fetch(`${API_URL}/api/v1/yaipan/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({}),
  });

  return response.json();
}
