// ESTE ARCHIVO DEFINE EL ENDPOINT QUE DEVUELVE LA LISTA DE SERVICIOS (TARJETAS) CONFIGURADOS EN ODOO
// PARA EL MENÚ PRINCIPAL DEL SPA DE AUTOGESTIÓN. SE CONSULTA EL MODELO yaipan_reports.service A TRAVÉS
// DEL CONTROLADOR /api/v1/services Y SE DEVUELVE UNA LISTA NORMALIZADA AL CLIENTE.
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

    const response = await fetch(`${API_ODOO_REQUEST}/api/v1/services`, {
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

    const services = (json.result.data as Array<Record<string, any>>).map(
      (row) => ({
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        color: row.color ?? "",
        icon: row.icon ?? "",
        url: row.url ?? "",
        isExternal: Boolean(row.is_external),
      }),
    );

    return res.status(200).json({ success: true, data: services });
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
