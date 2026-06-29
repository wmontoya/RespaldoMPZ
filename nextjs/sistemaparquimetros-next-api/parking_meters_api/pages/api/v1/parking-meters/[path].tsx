import type { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';

const allowedOrigins = process.env.API_DOMAINS ? process.env.API_DOMAINS.split(',') : [];

const cors = Cors({
    methods: ['POST', 'PUT', 'GET', 'OPTIONS','HEAD'],
    origin: (origin, callback) => {
        if (origin && allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: (req: NextApiRequest, res: NextApiResponse, callback: (result: unknown) => void) => void) {
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
            sizeLimit: '10mb',
        },
    },
};

const allowedMethodsByPath: Record<string, string[]> = {
    "article": ['POST'],
    "user": ['POST', 'PUT'],
    "rates": ['POST'],
    "brand": ['POST'],
    "color": ['POST'],
    "image": ['POST', 'GET'],
    "infraction": ['POST', 'GET'],
    "parameter": ['POST'],
    "parking-time": ['POST', 'PUT'],
    "plate-type": ['POST'],
    "price": ['POST'],
    "range": ['POST'],
    "vehicle": ['POST'],
    "time": ['POST'],
    "parking-rate": ['POST', 'GET'],
    "payment": ['GET', 'POST']
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    const { path } = req.query;
  
    try {

        await runMiddleware(req, res, cors);

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        
        const allowedMethods = allowedMethodsByPath[path as string];
        console.log(`Request to path: ${path}, allowed methods: ${allowedMethods}`);
        
        if (!allowedMethods) {
            return res.status(404).json({ success: false, error: 'Ruta no configurada' });
        }
        if (!req.method || !allowedMethods.includes(req.method)) {
            return res.status(405).json({ success: false, error: `Método ${req.method} no permitido para ${path}` });
        }

        const method = String(path);
        const utilModule = await import(`@/lib/parking-meters/${method}`);
        return utilModule.default(req, res);
    } catch (error) {
        return res.status(404).json({
            success: false,
            error: 'Ruta o método no encontrado',
        });
    }
}
