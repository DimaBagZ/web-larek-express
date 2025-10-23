import { Joi } from 'celebrate';
import { PHONE_REGEXP, PHONE_ERROR_MESSAGE } from '../utils/constants';

// ----------------------
// Схема для создания товара
// ----------------------
export const productSchema = Joi.object({
  title: Joi.string().min(2).max(30).required(),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }).required(),
  category: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  price: Joi.number().allow(null).optional(),
});

// ----------------------
// Схема для обновления товара
// ----------------------
export const updateProductSchema = Joi.object({
  title: Joi.string().min(2).max(30).optional(),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }).optional(),
  category: Joi.string().optional(),
  description: Joi.string().allow('').optional(),
  price: Joi.number().allow(null).optional(),
});

// ----------------------
// Схема для оформления заказа
// ----------------------
export const orderSchema = Joi.object({
  payment: Joi.string().valid('card', 'online').required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(PHONE_REGEXP).required().messages({
    'string.pattern.base': PHONE_ERROR_MESSAGE,
  }),
  address: Joi.string().required(),
  total: Joi.number().required(),
  items: Joi.array().items(Joi.string().length(24)).min(1).required(),
});

// ----------------------
// Схема для регистрации пользователя
// ----------------------
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(30).optional(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// ----------------------
// Схема для логина пользователя
// ----------------------
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
