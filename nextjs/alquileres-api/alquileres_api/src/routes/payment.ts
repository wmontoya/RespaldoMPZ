import { Router, Request, Response } from 'express';
import { odooPost } from '../lib/odooClient';

const router = Router();

router.post('/check-status', async (req: Request, res: Response) => {
  const { booking_code } = req.body;

  if (!booking_code) {
    res.status(400).json({ error: 'booking_code is required' });
    return;
  }

  try {
    const result = await odooPost('/api/v1/reservation/payment/check-status', { booking_code });
    const odooResult = result.result || result;

    if (odooResult.status === 'error') {
      res.status(422).json({ success: false, error: odooResult.message });
      return;
    }

    const booking = odooResult.booking || {};
    const paymentStatusInfo = odooResult.payment_status || {};

    res.json({
      success: true,
      status: odooResult.transaction_status,
      booking_code: booking.booking_code,
      facility_name: booking.facility_name,
      start_datetime: booking.start_datetime,
      end_datetime: booking.end_datetime,
      amount: booking.amount || 0,
      message: paymentStatusInfo.message || odooResult.message,
    });
  } catch (error) {
    console.error('POST /payment/check-status error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
