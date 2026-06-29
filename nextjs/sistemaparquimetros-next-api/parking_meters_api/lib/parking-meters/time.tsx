import type { NextApiRequest, NextApiResponse } from 'next';
import sendRequest from '@/utils/requestManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ success: false, error: 'Invalid JSON body' });
      }
    }

    const { plateNumber, plateTypeId } = body;

    if (!plateNumber || !plateTypeId) {
      return res.status(400).json({ success: false, error: 'plateNumber y plateTypeId son requeridos' });
    }

    const dataResponse = await sendRequest({
      req,
      endpoint: 'time',
      params: { plate_number: plateNumber, plate_type_id: plateTypeId }
    });

    if (!dataResponse.result.success) {
      throw new Error(`Error desde Odoo: ${dataResponse.message}`);
    }

    return res.status(200).json({
      success: true,
      data: {
        id: dataResponse.result.data.id,
        minutes: dataResponse.result.data.remaining_minutes,
        seconds: dataResponse.result.data.remaining_seconds,
        nextTime: dataResponse.result.data.next_start_time,
        allTime: dataResponse.result.data.all_to_day_records
      },
    });
  } catch (error: any) {
    console.log('Error en la API de tiempo:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
}
