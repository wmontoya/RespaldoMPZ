import type { NextApiRequest, NextApiResponse } from 'next';
import sendRequest from '@/utils/requestManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const dataResponse = await sendRequest({
      req,
      endpoint: 'vehicles'
    });

    if (!dataResponse.result?.success) {
      throw new Error(`Error desde Odoo: ${dataResponse.message}`);
    }

    const vehicleList = dataResponse.result.data.map((vehicle: any) => ({
      Id: vehicle.id,
      Description: vehicle.description,
    }));

    return res.status(200).json({
      success: true,
      data: vehicleList,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
}
