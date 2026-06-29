import type { NextApiRequest, NextApiResponse } from 'next';
import webpush from 'web-push';
import CryptoJS from 'crypto-js';

webpush.setVapidDetails(
  'https://www.perezzeledon.go.cr',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.API_VAPID_PRIVATE_KEY as string
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method === 'POST') {
    const { subscription, plate_number, remaining_time } = req.body;

    const bytes = CryptoJS.AES.decrypt(
      subscription,
      process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string
    );
    
    let subscriptionConverter = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  
    const mensaje = {
      "title": "Tiempo Finalizando ⏰",
      "body": `La boleta de tiempo para la placa ${plate_number} está a punto de expirar en ${remaining_time} minutos.`,
    }
    
    try {
      await webpush.sendNotification(subscriptionConverter, JSON.stringify(mensaje));
    
      res.status(200).json({ message: 'Notificación enviada a todos los suscriptores' });
    } catch (error) {
      console.error('Error al enviar la notificación:', error );
      res.status(500).json({ error: 'Error al enviar la notificación' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
