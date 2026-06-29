import type { NextApiRequest, NextApiResponse } from 'next';
import sendRequest from '@/utils/requestManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await sendRequest({
      req,
      endpoint: 'price'
    });

    if (!data.result.success) {
      throw new Error(`Error desde Odoo: ${data.message}`);
    }

    const priceData = {
      Id: data.result.data.id,
      Price: data.result.data.price,
      UpdateDate: data.result.data.update_date,
    };

    return res.status(200).json({
      success: true,
      data: priceData,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
}
