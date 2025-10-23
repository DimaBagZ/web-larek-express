import { Request, Response, NextFunction } from 'express';

// Загрузка файла
const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Файл должен быть загружен через middleware fileMiddleware
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не был загружен' });
    }
    // Возвращаем путь и оригинальное имя
    res.status(201).json({
      fileName: `/tmp/${req.file.filename}`,
      originalName: req.file.originalname,
    });
  } catch (err) {
    next(err);
  }
  return null;
};

export default uploadFile;
