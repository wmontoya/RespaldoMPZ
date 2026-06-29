import type { NextApiRequest, NextApiResponse } from 'next';
import sendRequest from '@/utils/requestManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await sendRequest({
      req,
      endpoint: 'range'
    });

    if (!data.result.success) {
      throw new Error(`Error desde Odoo: ${data.message}`);
    }

    const rangeData = {
      Id: data.result.data.id,
      TiketNumber: data.result.data.ticket_number,
      StartRange: data.result.data.start_range,
      EndRange: data.result.data.end_range,
      UserId: data.result.data.user_id,
    };

    return res.status(200).json({
      success: true,
      data: rangeData,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
}
