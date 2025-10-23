import { Router } from 'express';
import createOrder from '../controllers/order';
import { validateCreateOrder } from '../middlewares/validate';

const router = Router();

// Оформить заказ
router.post('/', validateCreateOrder as any, createOrder);

export default router;
