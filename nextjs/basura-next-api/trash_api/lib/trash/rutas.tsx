import type { NextApiRequest, NextApiResponse } from 'next';
import getSessionId from '@/utils/sessionManager';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse, user:any) {
    try {
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
        
        const response = await fetch(`${API_ODOO_REQUEST}/api/v1/trash/routes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `session_id=${sessionId}`,
            },
            body: JSON.stringify({}),
        });
        
        
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Consulta fallida: ${response.status} - ${text}`);
        }

        const json = await response.json();
    
        if (!json.result?.success) {
            throw new Error(json.result?.error || 'Respuesta inválida desde Odoo');
        }

        const odooRoutes = json.result.data;

        const routes = odooRoutes.map((r: any) => ({
            id: String(r.id),
            name: r.name,
            days: r.collection_days || [],
            color: r.color,
            coordinates: r.segments || [],
            description: r.description || '',
        }));
        
        return res.status(200).json({
            success: true,
            routes,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: typeof error === 'object' && error !== null && 'message' in error
                ? (error as { message?: string }).message
                : 'Error interno del servidor',
        });
    }
}