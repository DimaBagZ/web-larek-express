import { Request, Response, NextFunction } from 'express';
import AppError from '../errors/app-error';

// Централизованный обработчик ошибок
export default function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Если ошибка — наш кастомный класс
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  // Если ошибка celebrate (валидация)
  if (err.joi) {
    return res.status(400).json({ message: err.joi.message });
  }
  // Неизвестная ошибка
  return res.status(500).json({ message: 'На сервере произошла ошибка' });
}
