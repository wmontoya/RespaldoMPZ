import type { NextApiRequest, NextApiResponse } from 'next';
import sendRequest from '@/utils/requestManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let body = req.body;

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid JSON' });
      }
    }

    if (req.method === 'POST') {
      const currentParkingTime = {
        plate_number: body.plateNumber,
        plate_type_id: body.plateTypeId,
        parking_rate_ids: body.parkingRateId,
        end_time: body.endTime.replace("T", " ").replace(".000Z", ""),
        start_time: body.startTime.replace("T", " ").replace(".000Z", ""),
        email: body.email,
        phone: body.phone,
        name: body.name,
        last_name: body.lastName,
        id: body.id,
        subscription: body.subscription,
        ip: body.ip,
        amount: body.amount
      };

      const result = await sendRequest({
        req,
        endpoint: 'create_parking_time',
        params: currentParkingTime,
      });

      return res.status(200).json(result.result);
    }

    if (req.method === 'PUT') {
      const currentParkingTime = { id: body.id };

      const result = await sendRequest({
        req,
        endpoint: 'set_parking_time_consulted',
        params: currentParkingTime,
      });

      return res.status(200).json(result.result);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });

  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', detail: error.message });
  }
}
