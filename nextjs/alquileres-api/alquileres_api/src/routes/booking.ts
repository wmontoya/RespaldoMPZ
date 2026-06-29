import { Router, Request, Response } from 'express';
import { odooGet, odooPost } from '../lib/odooClient';
import { toOdooUTC } from '../utils/datetime';

const router = Router();

router.get('/available-slots', async (req: Request, res: Response) => {
  const { facility_id, date } = req.query;

  if (!facility_id || !date) {
    res.status(400).json({ error: 'facility_id and date are required' });
    return;
  }

  const onlyDate = String(date).split('T')[0];

  try {
    const data = await odooGet(
      `/api/v1/reservation/booking/available-slots?facility_id=${facility_id}&date=${onlyDate}`
    );
    res.json(data);
  } catch (error) {
    console.error('GET /booking/available-slots error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const body = req.body;

  if (!body.facility_id || !body.start_datetime || !body.end_datetime || !body.user_email) {
    res.status(400).json({ error: 'facility_id, start_datetime, end_datetime and user_email are required' });
    return;
  }

  const params = {
    ...body,
    start_datetime: toOdooUTC(body.start_datetime),
    end_datetime: toOdooUTC(body.end_datetime),
  };

  try {
    const result = await odooPost('/api/v1/reservation/booking', params);
    const odooResult = result.result || result;

    if (odooResult.status === 'error') {
      res.status(422).json({ success: false, error: odooResult.message, code: odooResult.code });
      return;
    }

    const bookingId =
      odooResult.booking_id ||
      odooResult.id ||
      (odooResult.booking && odooResult.booking.id) ||
      (odooResult.booking && odooResult.booking.booking_id);

    const bookingCode =
      odooResult.booking_code ||
      (odooResult.booking && odooResult.booking.booking_code);

    if (!bookingId) {
      res.status(500).json({ success: false, error: 'No se recibió un ID de reserva válido del servidor' });
      return;
    }

    res.json({ success: true, booking_id: bookingId, booking_code: bookingCode, message: odooResult.message });
  } catch (error) {
    console.error('POST /booking error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/inactive', async (req: Request, res: Response) => {
  const { booking_id, reason } = req.body;

  if (!booking_id) {
    res.status(400).json({ error: 'booking_id is required' });
    return;
  }

  try {
    const result = await odooPost('/api/v1/reservation/booking/inactive', { booking_id, reason });
    const odooResult = result.result || result;
    res.json({ success: true, message: odooResult.message || 'Booking lock cancelled successfully' });
  } catch (error) {
    console.error('POST /booking/inactive error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/create-payment-session', async (req: Request, res: Response) => {
  const { booking_id, return_url } = req.body;

  if (!booking_id || !return_url) {
    res.status(400).json({ error: 'booking_id and return_url are required' });
    return;
  }

  try {
    const result = await odooPost('/api/v1/reservation/booking/create-payment-session', { booking_id, return_url });
    const odooResult = result.result || result;

    if (odooResult.status === 'error') {
      res.status(422).json({ success: false, error: odooResult.message });
      return;
    }

    const processUrl = odooResult.processUrl || odooResult.process_url;
    const requestId = odooResult.requestId || odooResult.request_id;

    if (!processUrl) {
      res.status(500).json({ success: false, error: 'No se recibió una URL de pago válida del servidor' });
      return;
    }

    res.json({ success: true, processUrl, requestId, message: odooResult.message });
  } catch (error) {
    console.error('POST /booking/create-payment-session error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/security-pattern', async (req: Request, res: Response) => {
  const { booking_code } = req.query;

  if (!booking_code) {
    res.status(400).json({ error: 'booking_code is required' });
    return;
  }

  try {
    const data = await odooGet(
      `/api/v1/reservation/booking/security-pattern?booking_code=${encodeURIComponent(String(booking_code))}`
    );
    res.json(data);
  } catch (error) {
    console.error('GET /booking/security-pattern error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

router.post('/confirm', async (req: Request, res: Response) => {
  const { booking_code } = req.body;

  if (!booking_code) {
    res.status(400).json({ error: 'booking_code is required' });
    return;
  }

  try {
    const result = await odooPost('/api/v1/reservation/booking/confirm', { booking_code });
    const odooResult = result.result || result;

    if (odooResult.status === 'error') {
      res.status(422).json({ success: false, error: odooResult.message });
      return;
    }

    const bookingId = odooResult.booking_id || odooResult.id;
    const bookingCode = odooResult.booking_code || odooResult.code;

    res.json({
      success: true,
      booking_id: bookingId,
      booking_code: bookingCode,
      state: odooResult.state,
      message: odooResult.message || 'Reserva confirmada exitosamente',
    });
  } catch (error) {
    console.error('POST /booking/confirm error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
