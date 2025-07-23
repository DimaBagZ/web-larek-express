import { Router } from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product';
import auth from '../middlewares/auth';
import {
  validateCreateProduct,
  validateUpdateProduct,
} from '../middlewares/validate';

const router = Router();

// Получить все товары
router.get('/', getProducts);
// Создать новый товар (требует авторизации + валидация)
router.post('/', auth, validateCreateProduct as any, createProduct);
// Обновить товар (требует авторизации)
router.patch('/:productId', auth, validateUpdateProduct as any, updateProduct);
// Удалить товар (требует авторизации)
router.delete('/:productId', auth, deleteProduct);

export default router;
