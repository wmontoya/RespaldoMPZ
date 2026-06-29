import { get } from "@/app/api/v1/(functions)/config";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  try {
    const response = await get(`/api/v1/shared/users`);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}
