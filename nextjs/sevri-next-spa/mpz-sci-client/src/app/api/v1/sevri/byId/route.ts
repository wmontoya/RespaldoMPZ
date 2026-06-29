import { get, getOdoo } from "@/app/api/v1/(functions)/config";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    const response = await getOdoo(`/api/v1/sevri/sevri-processes/byId/${id}`);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(error);
  }
}
