import { get } from "@/app/api/v1/(functions)/config";
import { NextRequest, NextResponse } from "next/server";
export async function GET(_req: NextRequest) {
  try {
    const response = await get(`/api/v1/evaluations/actual`);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(error);
  }
}
