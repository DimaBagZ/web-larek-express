import { celebrate, Segments } from 'celebrate';
import {
  productSchema,
  updateProductSchema,
  orderSchema,
  registerSchema,
  loginSchema,
} from './schemas';

export const validateCreateProduct = celebrate({
  [Segments.BODY]: productSchema,
});

export const validateUpdateProduct = celebrate({
  [Segments.BODY]: updateProductSchema,
});

export const validateCreateOrder = celebrate({
  [Segments.BODY]: orderSchema,
});

export const validateRegister = celebrate({
  [Segments.BODY]: registerSchema,
});

export const validateLogin = celebrate({
  [Segments.BODY]: loginSchema,
});
