import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

// Оформить заказ
const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { total, items } = req.body;

    // Проверяем, что items — массив и не пустой
    if (!Array.isArray(items) || items.length === 0) {
      return next(new BadRequestError('Список товаров не может быть пустым'));
    }

    // Получаем товары из базы по id
    const products = await Product.find({ _id: { $in: items } });

    // Проверяем, что все id существуют и товары продаются (price !== null)
    if (products.length !== items.length) {
      return next(new BadRequestError('Один или несколько товаров не найдены'));
    }
    if (products.some((p) => p.price === null)) {
      return next(
        new BadRequestError('В заказе есть товар, который не продаётся'),
      );
    }

    // Проверяем сумму заказа
    const sum = products.reduce((acc, p) => acc + (p.price || 0), 0);
    if (sum !== total) {
      return next(
        new BadRequestError('Сумма заказа не совпадает с ценой товаров'),
      );
    }

    // Генерируем id заказа
    const id = uuidv4();
    res.status(201).json({ id, total: sum });
  } catch (err) {
    next(err);
  }
  return null;
};

export default createOrder;
