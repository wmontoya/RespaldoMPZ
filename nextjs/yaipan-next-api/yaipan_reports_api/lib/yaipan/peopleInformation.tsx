import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import getSessionId from "@/utils/sessionManager";
import { maskPhone, maskEmail } from "@/lib/utils/privacy";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "1mb",
        },
    },
};

const peopleInformationSchema = z.object({
    cedula: z.string().min(1, "Debe proporcionar una cédula"),
});






export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
    user: any
) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({
                success: false,
                error: "Método no permitido",
            });
        }

        const parsedBody = peopleInformationSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                error: "Datos inválidos",
                details: parsedBody.error.flatten(),
            });
        }

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

        const response = await fetch(
            `${API_ODOO_REQUEST}/api/v1/yaipan_reports/information/people-information`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: `session_id=${sessionId}`,
                },
                body: JSON.stringify({
                    params: {
                        cedula: parsedBody.data.cedula,
                    },
                }),
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Consulta fallida: ${response.status} - ${text}`);
        }

        const json = await response.json();

        if (json.result?.error) {
            throw new Error(
                json.result.error.message || "Respuesta inválida desde Odoo"
            );
        }

        const contribuyente = json.result?.data?.[0] ?? null;

        const contribuyenteAnonimizado = contribuyente
        ? {
            ...contribuyente,
            telefono: maskPhone(contribuyente.telefono),
            correo_electronico: maskEmail(contribuyente.correo_electronico),
            }
        : null;

        return res.status(200).json({
            success: true,
            contribuyente: contribuyenteAnonimizado,
            metadata: {
                title: json.result?.title,
                description: json.result?.description,
                views: json.result?.views,
            },
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