import { Request, Response, NextFunction } from 'express';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import { moveFileToImages, deleteImageFile } from '../utils/file';

// Получить все товары
export const getProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const items = await Product.find();
    res.json({ items, total: items.length });
  } catch (err) {
    next(err);
  }
  return null;
};

// Создать новый товар
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const createData = { ...req.body };
    // Если есть изображение — переносим файл
    if (
      createData.image
      && createData.image.fileName
      && createData.image.fileName.startsWith('/tmp/')
    ) {
      createData.image.fileName = await moveFileToImages(
        createData.image.fileName,
      );
    }
    // Данные приходят в req.body
    const product = await Product.create(createData);
    res.status(201).json(product);
  } catch (err: any) {
    // Обработка ошибки дубликата title (уникальность)
    if (err instanceof Error && err.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }
    // Ошибка валидации mongoose
    if (err.name === 'ValidationError') {
      return next(
        new BadRequestError('Ошибка валидации данных при создании товара'),
      );
    }
    // Прочие ошибки
    next(err);
  }
  return null;
};

// Обновить товар
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const updateData = { ...req.body };
    // Если есть новое изображение — переносим файл
    if (
      updateData.image
      && updateData.image.fileName
      && updateData.image.fileName.startsWith('/tmp/')
    ) {
      updateData.image.fileName = await moveFileToImages(
        updateData.image.fileName,
      );
    }
    const product = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return next(new NotFoundError('Товар не найден'));
    }
    res.json(product);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return next(
        new BadRequestError('Ошибка валидации данных при обновлении товара'),
      );
    }
    if (err instanceof Error && err.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }
    next(err);
  }
  return null;
};

// Удалить товар
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return next(new NotFoundError('Товар не найден'));
    }
    // Удаляем файл изображения
    if (product.image && product.image.fileName) {
      await deleteImageFile(product.image.fileName);
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
  return null;
};
