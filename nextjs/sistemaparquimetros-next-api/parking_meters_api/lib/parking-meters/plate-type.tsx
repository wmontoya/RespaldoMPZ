import type { NextApiRequest, NextApiResponse } from 'next';
import sendRequest from '@/utils/requestManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const dataResponse = await sendRequest({
      req,
      endpoint: 'get_plate_type',
      params: {},
      method: 'POST',
    });

    if (!dataResponse.result.success) {
      throw new Error(`Error desde Odoo: ${dataResponse.message}`);
    }

    const jsonResult = JSON.parse(dataResponse.result.data);

    const plateTypeList = jsonResult.data.map((plate: any) => ({
      Id: plate.id,
      Description: plate.description,
      PlateDetails: plate.plate_details.map((detail: any) => ({
        Id: detail.id,
        ClassCode: detail.class_code,
        GovermentCode: detail.government_code,
      })),
    }));

    return res.status(200).json({
      success: true,
      data: plateTypeList,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
}
