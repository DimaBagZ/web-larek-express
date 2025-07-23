import jwt from 'jsonwebtoken';

const {
  AUTH_ACCESS_TOKEN_SECRET = 'access_secret',
  AUTH_REFRESH_TOKEN_SECRET = 'refresh_secret',
  AUTH_ACCESS_TOKEN_EXPIRY = '10m',
  AUTH_REFRESH_TOKEN_EXPIRY = '7d',
} = process.env;

// Генерация access-токена
export function generateAccessToken(payload: object) {
  return jwt.sign(payload, AUTH_ACCESS_TOKEN_SECRET, {
    expiresIn: AUTH_ACCESS_TOKEN_EXPIRY,
  });
}

// Генерация refresh-токена
export function generateRefreshToken(payload: object) {
  return jwt.sign(payload, AUTH_REFRESH_TOKEN_SECRET, {
    expiresIn: AUTH_REFRESH_TOKEN_EXPIRY,
  });
}

// Проверка access-токена
export function verifyAccessToken(token: string) {
  return jwt.verify(token, AUTH_ACCESS_TOKEN_SECRET);
}

// Проверка refresh-токена
export function verifyRefreshToken(token: string) {
  return jwt.verify(token, AUTH_REFRESH_TOKEN_SECRET);
}
