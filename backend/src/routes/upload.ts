import { Router } from 'express';
import fileMiddleware from '../middlewares/file';
import uploadFile from '../controllers/upload';
import auth from '../middlewares/auth';

const router = Router();

// Загрузка файла (требует авторизации)
router.post('/', auth, fileMiddleware.single('file') as any, uploadFile);

export default router;
