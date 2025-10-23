import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import UnauthorizedError from '../errors/unauthorized-error';

// Middleware для проверки access-токена
export default function auth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Необходима авторизация');
    }
    const token = authHeader.replace('Bearer ', '');
    const payload = verifyAccessToken(token);
    // Добавляем payload в req.user
    (req as any).user = payload;
    next();
  } catch (err) {
    next(new UnauthorizedError('Ошибка авторизации'));
  }
}
