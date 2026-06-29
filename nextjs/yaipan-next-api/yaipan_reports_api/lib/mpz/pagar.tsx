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

const pendienteSchema = z.object({ 
  codigoServicio: z.string(),
  tipoCobro: z.string(),
  year: z.string(),
  periodo: z.string(),
  fechaCorte: z.string(),
  monto: z.number(),
  saldo: z.number(),
  saldoInteres: z.number(),
  estado: z.string(),
  descripcion: z.string(),
  auxiliarContable: z.string(),
  numeroCuenta: z.number(),
  tipoTransaccion: z.string(),
  numeroDocumento: z.string(),
  montoMulta: z.number(),
  numeroFinca: z.string(),
});

const fincaSchema = z.object({
    cedula: z.string().optional(),
    authorization: z.string().optional(),
    pendientes: z.array(pendienteSchema).optional(),
}).refine(data => data.cedula?.trim() !== '' && (data.pendientes ?? []).length > 0 , {
    message: 'Debe proporcionar al menos una cédula y una lista de pendientes',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse, user: any) {

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

        const sessionId = await getSessionId(user, true);
        if (!sessionId) {
            return res.status(401).json({
                success: false,
                error: 'Permiso denegado, usuario no autenticado revise su sesión',
            });
        }

        const response = await fetch(`${API_ODOO_REQUEST}/api/v1/yaipan/persona/pagar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `session_id=${sessionId}`,
            },
            body: JSON.stringify({
                params: {
                    cedula: parsedBody.data.cedula,
                    authorization: parsedBody.data.authorization,
                    pendientes: parsedBody.data.pendientes
                },
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Consulta fallida: ${response.status} - ${text}`);
        }

        const json = await response.json();

        if (!json.result?.success) {
            throw new Error(json.result?.error || 'Respuesta inválida desde Odoo');
        }

        return res.status(200).json({ success: true, pago_id: json.result.result });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: typeof error === 'object' && error !== null && 'message' in error
                ? (error as { message?: string }).message
                : 'Error interno del servidor',
        });
    }
}




