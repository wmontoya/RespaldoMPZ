import type { NextApiRequest, NextApiResponse } from 'next';
import sendRequest from '@/utils/requestManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let body = req.body;

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }

  const { parameterName } = body;

  try {
    const result = await sendRequest({
      req,
      endpoint: 'parameter',
      params: { "parameter_name": parameterName },
    });

    const parameterData = {
      Value: result.result.data.parameter_value,
    };

    res.status(200).json({
      success: true,
      data: parameterData,
    });

  } catch (error: any) {
    if (parameterName === 'parking_meters.Is_Active') {
      return res.status(200).json({
        success: true,
        data: { Value: 'false' },
      });
    }

    console.error('Error al obtener parámetro:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
}
