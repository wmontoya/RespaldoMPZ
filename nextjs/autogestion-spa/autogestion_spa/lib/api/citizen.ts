import { CitizenResponse } from "@/types/citizen";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCitizenById(
  cedula: string,
  token: string
): Promise<CitizenResponse> {
  const response = await fetch(`${API_URL}/api/v1/yaipan/peopleInformation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ cedula }),
  });

  return response.json();
}