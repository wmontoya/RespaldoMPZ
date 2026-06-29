import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const API_SUB = process.env.SPA_API_SUB ?? "";

const API_EMPRESA = process.env.SPA_API_EMPRESA ?? "";

const API_KEY = process.env.SPA_API_KEY ?? "";

const SPA_ORIGEN = process.env.SPA_ORIGEN ?? "";

export async function POST() {

  try {
    const response = await fetch(`${API_URL}/api/v1/token/jwt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(SPA_ORIGEN ? { Origin: SPA_ORIGEN } : {}),
      },
      body: JSON.stringify({
        sub: API_SUB,
        empresa: API_EMPRESA,
        key: API_KEY
      }),

    });

    const data = await response.json();

    return NextResponse.json(data, {

      status: response.status,

    });

  } catch (error) {

    return NextResponse.json(

      {

        success: false,

        error: error instanceof Error ? error.message : "Error desconocido",

      },

      { status: 500 }

    );

  }

}
 