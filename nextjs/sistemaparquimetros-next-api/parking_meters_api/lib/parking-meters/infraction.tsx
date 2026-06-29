import type { NextApiRequest, NextApiResponse } from 'next';
import sendRequest from '@/utils/requestManager';

function buildInfractionData(body: any, includeImages = false) {
  const data: any = {
    ticket_number: body.ticketNumber,
    plate_type_id: body.plateTypeId,
    plate_number: body.plateNumber,
    plate_detail_id: body.plateDetailId,
    infraction_price_id: body.infractionPriceId,
    first_location: body.firstLocation,
    second_location: body.secondLocation,
    third_location: body.thirdLocation,
    infraction_state_id: body.infractionStateId,
    registration_date: body.registrationDate,
    payment_date: body.paymentDate,
    brand_code_id: body.brandCodeId,
    color_code_id: body.colorCodeId,
    article_code_id: body.articleCodeId,
    clause_code_id: body.clauseCodeId,
    vehicle_code_id: body.vehiculeCodeId,
    observations: body.observations,
    latitude: body.latitude,
    longitude: body.longitude,
    surcharge: body.surcharge,
    cancellation_description: body.cancellationDescription,
    inspector_user_id: body.inspectorUserId,
  };

  if (includeImages) {
    data.image_list = body.imageList;
  }

  return data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const method = req.method;
   
    if (method === 'GET') {
      const { plateNumber, plateTypeId, ticketNumber, isToday } = req.query;

      const currentInfraction = {
        plate_number: plateNumber,
        plate_type_id: plateTypeId,
        ticket_number: ticketNumber,
        is_today: isToday,
      };

      const result = await sendRequest({
        req,
        endpoint: 'infractions',
        params: currentInfraction
      });

      if (!result?.result?.success) {
        throw new Error(result?.message || 'Fallo al obtener infracciones');
      }

      return res.status(200).json({
        success: true,
        data: result.result.data || [],
      });
    }

    // POST o PUT
    const includeImages = method === 'PUT';
    const infractionData = buildInfractionData(req.body, includeImages);

    const result = await sendRequest({
      req,
      endpoint: 'infraction',
      params: infractionData
    });

    if (!result?.result?.success) {
      return res.status(400).json({
        error: result?.message || 'Error en Odoo',
      });
    }

    return res.status(200).json({
      success: true,
      message: method === 'POST'
        ? 'Infracción registrada exitosamente'
        : 'Infracción actualizada exitosamente',
      data: result.result.data,
    });

  } catch (error) {
    const message = (error as Error).message || 'Internal Server Error';
    return res.status(500).json({ error: `Error interno: ${message}` });
  }
}
