import { getOdoo } from "@/app/api/v1/(functions)/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  try {
    const response = await getOdoo(
      "/api/v1/autoevaluation-survey/survey/actual"
    );

    // Siempre 200
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("AUTOEVALUATION ACTUAL ERROR:", error);

    return NextResponse.json(
      {
        error: "odoo_error",
        message: "No se pudo consultar Odoo",
      },
      { status: 500 }
    );
  }
}
