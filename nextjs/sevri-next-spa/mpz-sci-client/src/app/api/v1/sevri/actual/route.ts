import { getOdoo } from "@/app/api/v1/(functions)/config";
import { NextRequest, NextResponse } from "next/server";
export async function GET(_req: NextRequest) {
  try {
    const response = await getOdoo(`/api/v1/sevri/sevri-processes/actual`);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return NextResponse.json(error);
  }
}
