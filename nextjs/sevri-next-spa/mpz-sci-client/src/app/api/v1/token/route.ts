import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = NextResponse.json({ success: true });
    response.cookies.set("token", body.token, {
      httpOnly: true,
      maxAge: 60 * 60,
    });
    return response;
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
