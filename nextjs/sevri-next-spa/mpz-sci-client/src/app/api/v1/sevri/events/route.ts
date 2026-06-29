import { post } from "@/app/api/v1/(functions)/config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { body } = await req.json()
    const response = await post(`/api/v1/sevri/events`, body)
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}
