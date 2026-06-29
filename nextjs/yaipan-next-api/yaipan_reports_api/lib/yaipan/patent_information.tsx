//ESTE ARCHIVO DEFINE UN ENDPOINT DE LA API QUE PERMITE CONSULTAR INFORMACIÓN DE PATENTES DE UNA PERSONA A PARTIR DE SU CÉDULA. SE UTILIZA PARA OBTENER LOS DATOS DE LAS PATENTES ASOCIADAS A UNA PERSONA EN ODOO Y DEVOLVERLOS EN UN FORMATO ESTRUCTURADO AL CLIENTE QUE HACE LA PETICIÓN.
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import getSessionId from '@/utils/sessionManager';

//Limita el tamaño máximo del JSON recibido.
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
};


//DEFINE LOS DATOS QUE PUEDE RECIBIR EL ENDPOINT
const peopleInformationSchema = z.object({
    cedula: z.string()
        .min(1, 'Debe proporcionar una cédula')
        .max(20, 'La cédula no puede superar 20 caracteres'),
});

//MANEJA LA LÓGICA DEL ENDPOINT, RECIBE LA PETICIÓN, VALIDA LOS DATOS, SE AUTENTICA CON ODOO, HACE LA CONSULTA Y DEVUELVE LA RESPUESTA.
export default async function handler(req: NextApiRequest, res: NextApiResponse, user: any) {
    try {

        //VALIDA QUE LOS DATOS RECIBIDOS SEAN CORRECTOS SEGÚN EL ESQUEMA DEFINIDO
        const parsedBody = peopleInformationSchema.safeParse(req.body);
        console.log("Datos recibidos en el endpoint de patente_information:", req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                error: 'Datos inválidos',
                details: parsedBody.error.flatten(),
            });
        }

        //VERIFICA QUE LA URL DE ODOO ESTÉ CONFIGURADA
        const { API_ODOO_REQUEST } = process.env;

        if (!API_ODOO_REQUEST) {
            throw new Error('No se ha configurado la URL de Odoo');
        }

        //OBTIENE EL session_id DE ODOO PARA AUTENTICAR LA CONSULTA
        const sessionId = await getSessionId(user, true);

        if (!sessionId) {
            return res.status(401).json({
                success: false,
                error: 'Permiso denegado, usuario no autenticado revise su sesión',
            });
        }

        //HACE LA CONSULTA A ODOO PASANDO LOS PARÁMETROS RECIBIDOS Y EL session_id PARA AUTENTICAR
        console.log("Session ID enviado en la consulta a Odoo:", sessionId);
        const response = await fetch(`${API_ODOO_REQUEST}/api/v1/property/patent_information`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `session_id=${sessionId}`,
            },
            //EL CUERPO DE LA CONSULTA SE ENVÍA EN FORMATO JSON Y SE PASA ÚNICAMENTE LA CÉDULA
            body: JSON.stringify({
                params: {
                    CEDULA: parsedBody.data.cedula || "",
                },
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Consulta fallida: ${response.status} - ${text}`);
        }

        //LA RESPUESTA DE ODOO SE ESPERA EN FORMATO JSON Y DEBE TENER UNA ESTRUCTURA CON UN CAMPO "result" QUE CONTENGA LOS DATOS DE LA PERSONA CONSULTADA
        const json = await response.json();

        if (!json.result?.success) {
            throw new Error(json.result?.message || json.result?.error || 'Respuesta inválida desde Odoo');
        }
        //SI TODO SALE BIEN, SE DEVUELVE UN JSON CON success: true Y LOS DATOS DE LA PERSONA EN EL CAMPO "contribuyente"
        return res.status(200).json({
            success: true,
            contribuyente: json.result.data,
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