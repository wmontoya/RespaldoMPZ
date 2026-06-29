import { get, post } from "@/app/api/v1/(functions)/config";
// import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  try {
    const response = await get(`/api/v1/sevri/activities`)
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log("errors",error);
    return NextResponse.json(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { body } = await req.json()
    const response = await post(`/api/v1/sevri/activities`, body);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}
