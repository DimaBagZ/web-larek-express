import multer from 'multer';
import path from 'path';
import BadRequestError from '../errors/bad-request-error';

// Получаем лимит размера файла из переменных окружения (по умолчанию 5MB)
const FILE_SIZE_LIMIT = parseInt(process.env.FILE_SIZE_LIMIT || '5242880', 10);

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

// Middleware для загрузки одного файла с настраиваемым лимитом
const fileMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_SIZE_LIMIT },
});

export default fileMiddleware;
