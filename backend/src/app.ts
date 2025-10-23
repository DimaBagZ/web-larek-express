import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import winston from 'winston';
import expressWinston from 'express-winston';

import { errors as celebrateErrors } from 'celebrate';
import cookieParser from 'cookie-parser';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import authRouter from './routes/auth';
import uploadRouter from './routes/upload';
import errorHandler from './middlewares/errorHandler';

// Загружаем переменные окружения из .env
dotenv.config();

const { DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek', PORT = 3000 } = process.env;

const app = express();

// Подключаем CORS для разрешения запросов с других источников
app.use(
  cors({
    origin: 'http://localhost:5173', // только фронт
    credentials: true, // разрешаем cookie
  }),
);
// Для парсинга JSON-тел запросов
app.use(express.json());
// Для работы с httpOnly cookie
app.use(cookieParser() as any);
// Раздача статики из папки public
app.use(express.static(path.join(__dirname, 'public')));
// Для production после сборки копируй src/public -> dist/public

// Логирование всех запросов в request.log
app.use(
  expressWinston.logger({
    transports: [new winston.transports.File({ filename: 'request.log' })],
    format: winston.format.json(),
  }) as any,
);

// Подключаем роуты
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);

// Логирование ошибок в error.log
app.use(
  expressWinston.errorLogger({
    transports: [new winston.transports.File({ filename: 'error.log' })],
    format: winston.format.json(),
  }) as any,
);

// celebrate errors (валидация)
app.use(celebrateErrors() as any);
// Централизованный обработчик ошибок
app.use(errorHandler);

// Пример базового роута (можно удалить позже)
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Сервер работает!' });
});

// Подключение к MongoDB и запуск сервера
mongoose
  .connect(DB_ADDRESS)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('MongoDB подключена');
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Ошибка подключения к MongoDB:', err);
  });
