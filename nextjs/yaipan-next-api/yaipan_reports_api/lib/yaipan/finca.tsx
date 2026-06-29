import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import getSessionId from '@/utils/sessionManager';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
};

const fincaSchema = z.object({
    cedula: z.string().optional(),
    num_finca: z.string().optional(),
}).refine(data => data.cedula?.trim() !== '' || data.num_finca?.trim() !== '', {
    message: 'Debe proporcionar al menos una cédula o un número de finca',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse, user:any) {
    try {

        const parsedBody = fincaSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                error: 'Datos inválidos',
                details: parsedBody.error.flatten(),
            });
        }

        const { API_ODOO_REQUEST } = process.env;
        if (!API_ODOO_REQUEST) {
            throw new Error('No se ha configurado la URL de Odoo');
        }

         const sessionId = await getSessionId(user,true);
        if (!sessionId) {
            return res.status(401).json({
                success: false,
                error: 'Permiso denegado, usuario no autenticado revise su sesión',
            });
        }

        const response = await fetch(`${API_ODOO_REQUEST}/api/v1/property/finca`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `session_id=${sessionId}`,
            },
            body: JSON.stringify({
                params: {
                    cedula: parsedBody.data.cedula || '',
                    num_finca: parsedBody.data.num_finca || ''
                },
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Consulta fallida: ${response.status} - ${text}`);
        }

        const json = await response.json();

        if (!json.result?.success) {
            throw new Error(json.result?.message || 'Respuesta inválida desde Odoo');
        }

        const fincaListRaw = json.result.data as Array<Record<string, any>>;

        const fincaMap = new Map<string, any>();

        for (const row of fincaListRaw) {
            const numFinca = row.num_finca;

            if (!fincaMap.has(numFinca)) {
                fincaMap.set(numFinca, {
                    canton: row.fin_canton_code,
                    distrito: row.fin_district_code,
                    senas: row.fin_senas,
                    numeroFinca: row.num_finca,
                    area: row.area,
                    nombre: row.nombre_completo,
                    cedula: row.cedula,
                    direccion1: row.direccion1,
                    direccion2: row.direccion2,
                    correo: row.correo,
                    telefono: row.telefono,
                    movil: row.movil,
                    usos_suelos: [],
                });
            }

            if (row.num_tramite) {
                fincaMap.get(numFinca).usos_suelos.push({
                    num_tramite: row.num_tramite,
                    nombre_solicitante: row.nombre_solicitante,
                    cedula_solicitante: row.cedula_solicitante,
                    correo: row.correo_solicitante,
                    num_plano: row.num_plano,
                    telefono_solicitante: row.telefono_solicitante,
                    fec_solicitud: row.fec_solicitud,
                    direccion_propiedad: row.direccion_propiedad,
                    direccion_solicitante: row.direccion_solicitante,
                    area_terreno: row.area_terreno,
                    observaciones: row.observaciones,
                    descripcion: row.descripcion,
                    tipo_uso_suelo: row.tipo_uso_suelo,
                    estado_uso_suelo: row.estado_uso_suelo,
                    finalidad_uso_suelo: row.finalidad_uso_suelo,
                });
            }
        }

        const fincaList = Array.from(fincaMap.values());

        return res.status(200).json({ success: true, data: fincaList });


    } catch (error) {
        return res.status(500).json({
            success: false,
            error: typeof error === 'object' && error !== null && 'message' in error
                ? (error as { message?: string }).message
                : 'Error interno del servidor',
        });
    }
}




