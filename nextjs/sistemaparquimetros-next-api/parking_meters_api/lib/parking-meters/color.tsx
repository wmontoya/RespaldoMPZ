import type { NextApiRequest, NextApiResponse } from 'next';
import sendRequest from '@/utils/requestManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await sendRequest({
      req,
      endpoint: 'colors'
    });

    if (!result.result.success) {
      throw new Error(`Error desde Odoo: ${result.message}`);
    }

    const colorList = result.result.data.map((color: any) => ({
      Id: color.id,
      Color: color.color,
    }));

    return res.status(200).json({
      success: true,
      data: colorList,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
}
