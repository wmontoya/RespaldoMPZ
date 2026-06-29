// ESTE ARCHIVO GENERA Y ENVÍA POR CORREO EL ESTADO DE CUENTA DEL CONTRIBUYENTE.
// REUTILIZA LA CONSULTA DE SALDOS PENDIENTES (filtrada por tipo) Y LA API DE
// CORREO OCI EN ODOO A TRAVÉS DEL CONTROLADOR
// /api/v1/procedure_requests/account_statement. SOLO SE CREA EL TRÁMITE Y SE
// ENVÍA EL PDF SI EXISTEN SALDOS DEL TIPO SOLICITADO.
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
// se extraen los datos del fomulario
    const cedula = (req.body?.cedula ?? "").toString().trim();
    const email = (req.body?.email ?? "").toString().trim();
    const phone = (req.body?.phone ?? "").toString().trim();
    const statementType = (req.body?.statement_type ?? "").toString().trim();

    if (!cedula || !email || !statementType) {
      return res.status(400).json({
        success: false,
        error:
          "Faltan campos obligatorios (cédula, correo o tipo de estado de cuenta)",
      });
    }

    //valida la utenticacion con odoo
    const sessionId = await getSessionId(user, true);
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: "Permiso denegado, usuario no autenticado revise su sesión",
      });
    }

    //hace el post a odoo
    const response = await fetch(
      `${API_ODOO_REQUEST}/api/v1/procedure_requests/account_statement`,
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
            statement_type: statementType,
          },
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Consulta fallida: ${response.status} - ${text}`);
    }
    //respuesta de odoo
    const json = await response.json();
    const result = json.result;

    // valida si no trae datos, si odoo rechazo el tramite
    if (!result || result.success === false) {
      return res.status(200).json({
        success: false,
        error: result?.message || "No fue posible generar el estado de cuenta",
      });
    }

    // devuelve a front si fue exitoso, si hay datos
    return res.status(200).json({
      success: true,
      hasData: result.has_data !== false,
      number: result.number ?? null,
      message: result.message ?? "",
    });
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
