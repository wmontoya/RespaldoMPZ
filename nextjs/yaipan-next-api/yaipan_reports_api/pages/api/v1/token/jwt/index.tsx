import type { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import jwt from 'jsonwebtoken';

const allowedOrigins = process.env.API_DOMAINS ? process.env.API_DOMAINS.split(',') : [];

const cors = Cors({
    methods: ['POST', 'OPTIONS'],
    origin: (origin, callback) => {
        if (origin && allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
});

function runMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    fn: (req: NextApiRequest, res: NextApiResponse, callback: (result: unknown) => void) => void
) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: unknown) => {
            if (result instanceof Error) return reject(result);
            return resolve(result);
        });
    });
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

    try {
        await runMiddleware(req, res, cors);

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ success: false, error: 'Método no permitido' });
        }

        const { sub, empresa, key } = req.body;

        if (!sub || !empresa || !key) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos: sub o empresa o key',
            });
        }

        const token = jwt.sign(
            { sub, empresa },
            key, 
            { expiresIn: '8h' }
        );

        return res.status(200).json({
            success: true,
            token: 'Bearer ' + token,
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
