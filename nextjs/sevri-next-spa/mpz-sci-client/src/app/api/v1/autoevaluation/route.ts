import { get } from "@/app/api/v1/(functions)/config";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const department_id = url.searchParams.get("department_id")
    const response = await get(`/api/v1/autoevaluation-survey/surveys/${department_id}`);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(error);
  }
}
