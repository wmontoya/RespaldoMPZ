import type { NextApiRequest, NextApiResponse } from 'next';
import sendRequest from '@/utils/requestManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let endpoint = '';
    let params: Record<string, any> = {};

    if (req.method === 'GET') {
      const { imageId } = req.query;
      endpoint = 'images';
      params = { id_infraction: imageId };
    } 
    if (req.method === 'POST') {
      const { imageList, ticketNumber } = req.body;
      endpoint = 'images/save';
      params = { image_list: imageList, ticket_number: ticketNumber };
    } 

    const result = await sendRequest({
      req,
      endpoint,
      params,
    });

    const data = JSON.parse(result.result.data);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
}
