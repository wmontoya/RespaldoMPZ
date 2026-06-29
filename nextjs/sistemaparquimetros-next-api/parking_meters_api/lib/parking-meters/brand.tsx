import type { NextApiRequest, NextApiResponse } from 'next';
import sendRequest from '@/utils/requestManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await sendRequest({
      req,
      endpoint: 'brands'
    });

    if (!result.result.success) {
      throw new Error(`Error desde Odoo: ${result.message}`);
    }

    const brandList = result.result.data.map((brand: any) => ({
      Id: brand.id,
      Brand: brand.brand,
    }));

    return res.status(200).json({
      success: true,
      data: brandList,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
}
