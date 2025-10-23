import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import UnauthorizedError from '../errors/unauthorized-error';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import User from '../models/user';

// Опции для httpOnly cookie
const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
  path: '/',
};

// Регистрация пользователя
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return next(new BadRequestError('Email и пароль обязательны'));
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    // Генерируем токены
    const accessToken = generateAccessToken({ _id: user._id });
    const refreshToken = generateRefreshToken({ _id: user._id });
    // Сохраняем refresh-токен в БД
    user.tokens.push({ token: refreshToken });
    await user.save();
    // Отправляем refresh-токен в httpOnly cookie
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    // Возвращаем user и accessToken
    res.status(201).json({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken,
    });
  } catch (err: any) {
    if (err instanceof Error && err.message.includes('E11000')) {
      return next(
        new ConflictError('Пользователь с таким email уже существует'),
      );
    }
    if (err.name === 'ValidationError') {
      return next(
        new BadRequestError('Ошибка валидации данных при регистрации'),
      );
    }
    next(err);
  }
  return null;
};

// Логин пользователя
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new BadRequestError('Email и пароль обязательны'));
    }
    const user = await User.findOne({ email }).select('+password +tokens');
    if (!user) {
      return next(new UnauthorizedError('Неверный email или пароль'));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new UnauthorizedError('Неверный email или пароль'));
    }
    // Генерируем токены
    const accessToken = generateAccessToken({ _id: user._id });
    const refreshToken = generateRefreshToken({ _id: user._id });
    // Сохраняем refresh-токен в БД
    user.tokens.push({ token: refreshToken });
    await user.save();
    // Отправляем refresh-токен в httpOnly cookie
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    // Возвращаем user и accessToken
    res.json({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken,
    });
  } catch (err) {
    next(err);
  }
  return null;
};

// Получить текущего пользователя по access-токену
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // id пользователя из токена
    const { _id } = (req as any).user;
    const user = await User.findById(_id);
    if (!user) {
      return next(new UnauthorizedError('Пользователь не найден'));
    }
    res.json({ user: { email: user.email, name: user.name }, success: true });
  } catch (err) {
    next(err);
  }
  return null;
};

// Обновить access/refresh токены
export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return next(new UnauthorizedError('Refresh-токен отсутствует'));
    }
    let payload: any;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return next(new UnauthorizedError('Невалидный refresh-токен'));
    }
    // Ищем пользователя с этим refresh-токеном
    const user = await User.findById(payload._id).select('+tokens');
    if (!user || !user.tokens.some((t) => t.token === refreshToken)) {
      return next(
        new UnauthorizedError('Пользователь не найден или токен неактуален'),
      );
    }
    // Генерируем новые токены
    const newAccessToken = generateAccessToken({ _id: user._id });
    const newRefreshToken = generateRefreshToken({ _id: user._id });
    // Заменяем refresh-токен в БД
    user.tokens = user.tokens.filter((t) => t.token !== refreshToken);
    user.tokens.push({ token: newRefreshToken });
    await user.save();
    // Отправляем новый refresh-токен в cookie
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 дней
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: false,
      maxAge,
      path: '/',
    });
    res.json({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    next(err);
  }
  return null;
};

// Выход пользователя (удаление refresh-токена)
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return next(new UnauthorizedError('Refresh-токен отсутствует'));
    }
    let payload: any;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return next(new UnauthorizedError('Невалидный refresh-токен'));
    }
    // Ищем пользователя и удаляем токен
    const user = await User.findById(payload._id).select('+tokens');
    if (!user) {
      return next(new UnauthorizedError('Пользователь не найден'));
    }
    user.tokens = user.tokens.filter((t) => t.token !== refreshToken);
    await user.save();
    // Ставим истёкший refresh-токен в cookie
    res.cookie('refreshToken', '', {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: false,
      maxAge: 0,
      path: '/',
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
  return null;
};
