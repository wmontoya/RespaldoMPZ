import type { NextApiRequest, NextApiResponse } from 'next';
import CryptoJS from 'crypto-js';
import sendRequest from '@/utils/requestManager';

const handleError = (res: NextApiResponse, error: any, statusCode: number = 500) => {
  res.status(statusCode).json({ success: false, error: error.message || 'Internal Server Error' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { API_ODOO_DATABASE, API_ODOO_REQUEST, NEXT_PUBLIC_SESSION_KEY } = process.env;
  if (!API_ODOO_REQUEST || !API_ODOO_DATABASE) {
    return handleError(res, new Error('Falta ODOO_REQUEST o ODOO_DATABASE en las variables de entorno.'), 500);
  }

  try {
    if (req.method === 'POST') {
      const { user, password } = req.body;

      const [iv, encrypted] = password.split(':');

      if (!NEXT_PUBLIC_SESSION_KEY) {
        throw new Error('Encryption key is not defined');
      }
      const decrypted = CryptoJS.AES.decrypt(encrypted, CryptoJS.enc.Utf8.parse(NEXT_PUBLIC_SESSION_KEY), {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }).toString(CryptoJS.enc.Utf8);

      if (!user || !decrypted) {
        return handleError(res, new Error('Usuario y contraseña son obligatorios'), 400);
      }

      const authResponse = await fetch(`${API_ODOO_REQUEST}/web/session/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params: { db: API_ODOO_DATABASE, login: user, password: decrypted } }),
      });

      if (!authResponse.ok) {
        const errorText = await authResponse.text();
        throw new Error(`Autenticación fallida: ${authResponse.status} - ${errorText}`);
      }

      const setCookieHeader = authResponse.headers.get('set-cookie');
      const sessionIdMatch = setCookieHeader?.match(/session_id=([^;]+)/);
      if (!sessionIdMatch) throw new Error('No se recibió session_id');

      const sessionId = sessionIdMatch[1];

       const response = await fetch(`${process.env.API_ODOO_REQUEST}/api/v1/parking_meters/login_officer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Cookie: `session_id=${sessionId}`,
        },
        body: JSON.stringify({ "params": "" }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Request failed: ${response.status} - ${text}`);
    }

     const data = await response.json();
      const userData = data.result.data;

      return res.status(200).json({
        success: true,
        data: {
          Id: userData.id,
          Login: sessionId,
          User: userData.login,
          Name: userData.name,
          UpdatedStatus: userData.updated_status,
          MacPrinter: userData.phone_mac_direction,
        },
      });
    } 
    
    if (req.method === 'PUT') {
      await sendRequest({
        req,
        endpoint: 'update_officer',
        method: 'POST'
      });

      return res.status(200).json({ success: true });
    } 
  } catch (error: any) {
    handleError(res, error);
  }
}
