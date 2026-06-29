// ESTE ARCHIVO DEFINE EL ENDPOINT QUE DEVUELVE LOS TIPOS DE TRÁMITE MUNICIPALES ACTIVOS CONFIGURADOS
// EN ODOO PARA LA PÁGINA DE "TRÁMITES" DEL SPA DE AUTOGESTIÓN. SE CONSULTA EL MODELO
// yaipan_reports.procedure_type A TRAVÉS DEL CONTROLADOR /api/v1/procedure_types Y SE DEVUELVE UNA
// LISTA NORMALIZADA AL CLIENTE.
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

    const sessionId = await getSessionId(user, true);
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: "Permiso denegado, usuario no autenticado revise su sesión",
      });
    }

    const response = await fetch(`${API_ODOO_REQUEST}/api/v1/procedure_types`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session_id=${sessionId}`,
      },
      body: JSON.stringify({ params: {} }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Consulta fallida: ${response.status} - ${text}`);
    }

    const json = await response.json();

    if (!json.result?.success) {
      throw new Error(json.result?.message || "Respuesta inválida desde Odoo");
    }

    const procedures = (json.result.data as Array<Record<string, any>>).map(
      (row) => ({
        id: row.id,
        title: row.name,
        description: row.description ?? "",
        icon: row.icon ?? "",
        color: row.color ?? "",
        code: row.code ?? "",
        requiresProperty: Boolean(row.requires_property),
      }),
    );

    return res.status(200).json({ success: true, data: procedures });
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
