// ESTE ARCHIVO CREA UNA NUEVA SOLICITUD DE TRÁMITE EN ODOO (modelo yaipan_reports.procedure_request)
// A TRAVÉS DEL CONTROLADOR /api/v1/procedure_requests/create. ODOO ASIGNA EL NÚMERO DE TRÁMITE Y
// EL ESTADO INICIAL ("iniciado").
import type { NextApiRequest, NextApiResponse } from "next";
import getSessionId from "@/utils/sessionManager";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any,
) {
  try {
    const { API_ODOO_REQUEST } = process.env;
    if (!API_ODOO_REQUEST) {
      throw new Error("No se ha configurado la URL de Odoo");
    }

    const cedula = (req.body?.cedula ?? "").toString().trim();
    const email = (req.body?.email ?? "").toString().trim();
    const phone = (req.body?.phone ?? "").toString().trim();
    const typeId = req.body?.type_id;
    const propertyNumber = (req.body?.property_number ?? "").toString().trim();

    if (!cedula || !email || !typeId) {
      return res.status(400).json({
        success: false,
        error: "Faltan campos obligatorios (cédula, correo o tipo de trámite)",
      });
    }

    const sessionId = await getSessionId(user, true);
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: "Permiso denegado, usuario no autenticado revise su sesión",
      });
    }

    const response = await fetch(
      `${API_ODOO_REQUEST}/api/v1/procedure_requests/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionId}`,
        },
        body: JSON.stringify({
          params: {
            cedula,
            email,
            phone,
            type_id: typeId,
            property_number: propertyNumber,
          },
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Consulta fallida: ${response.status} - ${text}`);
    }

    const json = await response.json();

    if (!json.result?.success) {
      throw new Error(json.result?.message || "Respuesta inválida desde Odoo");
    }

    return res.status(200).json({ success: true, data: json.result.data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error:
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message
          : "Error interno del servidor",
    });
  }
}
