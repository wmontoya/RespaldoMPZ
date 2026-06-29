import type { NextApiRequest } from 'next';
import getSessionId from './sessionManager';

interface SendRequestOptions {
    req: NextApiRequest;
    endpoint: string;
    params?: object;
    method?: string;
}

const sendRequest = async ({
    req,
    endpoint,
    params,
    method = 'POST',
}: SendRequestOptions) => {
    const headerCredential = req.headers['credential'];
    const sessionId = headerCredential || await getSessionId(true);

    if (!sessionId) {
        throw new Error('Permiso denegado, usuario no autenticado');
    }

    const response = await fetch(`${process.env.API_ODOO_REQUEST}/api/v1/parking_meters/${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Cookie: `session_id=${sessionId}`,
        },
        body: JSON.stringify({ "params": params || "" }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`${endpoint} - Request failed: ${response.status} - ${text}`);
    }

    return await response.json();
};

export default sendRequest;