import multer from 'multer';
import path from 'path';
import BadRequestError from '../errors/bad-request-error';

// Разрешённые типы файлов
const ALLOWED_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
];

// Настройка хранилища
const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'tmp'));
  },
  filename: (_req, _file, cb) => {
    // Генерируем уникальное имя файла
    const ext = path.extname(_file.originalname);
    const fileName = `${Date.now().toString(36)}_${Math.round(
      Math.random() * 1e9,
    )}${ext}`;
    cb(null, fileName);
  },
});

// Фильтр типов
function fileFilter(_req: any, _file: any, cb: any) {
  if (ALLOWED_TYPES.includes(_file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Недопустимый тип файла'));
  }
}

// Middleware для загрузки одного файла с лимитом 5 МБ
const fileMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default fileMiddleware;
