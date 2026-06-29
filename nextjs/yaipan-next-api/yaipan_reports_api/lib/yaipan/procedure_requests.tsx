// ESTE ARCHIVO DEVUELVE EL HISTORIAL DE SOLICITUDES DE TRÁMITE ASOCIADAS A UNA CÉDULA.
// CONSULTA EL MODELO yaipan_reports.procedure_request A TRAVÉS DEL CONTROLADOR
// /api/v1/procedure_requests Y DEVUELVE UNA LISTA NORMALIZADA AL CLIENTE.
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
    if (!cedula) {
      return res.status(400).json({
        success: false,
        error: "Debe proporcionar una cédula",
      });
    }

    // Filtro opcional por tipo de trámite (historial por tipo).
    const typeId = req.body?.type_id;

    const sessionId = await getSessionId(user, true);
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: "Permiso denegado, usuario no autenticado revise su sesión",
      });
    }

    const response = await fetch(
      `${API_ODOO_REQUEST}/api/v1/procedure_requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionId}`,
        },
        body: JSON.stringify({
          params: { cedula, ...(typeId ? { type_id: typeId } : {}) },
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

    const requests = (json.result.data as Array<Record<string, any>>).map(
      (row) => ({
        id: row.id,
        number: row.number,
        type: row.type ?? "",
        state: row.state ?? "",
        stateLabel: row.state_label ?? "",
        createDate: row.create_date ?? "",
        doneDate: row.done_date ?? "",
        cancelReason: row.cancel_reason ?? "",
        propertyNumber: row.property_number ?? "",
      }),
    );

    return res.status(200).json({ success: true, data: requests });
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
