import { Router } from 'express';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
} from '../controllers/auth';
import { validateRegister, validateLogin } from '../middlewares/validate';
import auth from '../middlewares/auth';

const router = Router();

// Регистрация
router.post('/register', validateRegister as any, register);
// Логин
router.post('/login', validateLogin as any, login);
// Обновление access/refresh токенов
router.get('/token', refreshAccessToken);
// Выход пользователя
router.get('/logout', logout);
// Получение текущего пользователя (требует авторизации)
router.get('/user', auth, getCurrentUser);

export default router;
