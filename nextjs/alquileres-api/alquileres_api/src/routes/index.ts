import { Router } from 'express';
import facilityRouter from './facility';
import facilityGroupRouter from './facilityGroup';
import frequentQuestionRouter from './frequentQuestion';
import mainRulesRouter from './mainRules';
import parametersRouter from './parameters';
import bookingRouter from './booking';
import paymentRouter from './payment';

const router = Router();

router.use('/facility', facilityRouter);
router.use('/facility-group', facilityGroupRouter);
router.use('/frequent-question', frequentQuestionRouter);
router.use('/main-rules', mainRulesRouter);
router.use('/parameters', parametersRouter);
router.use('/reservation/booking', bookingRouter);
router.use('/reservation/payment', paymentRouter);

export default router;
