import fs from 'fs/promises';
import path from 'path';

// Переместить файл из tmp в images
export async function moveFileToImages(tmpFileName: string): Promise<string> {
  const src = path.join(__dirname, '..', 'public', tmpFileName);
  const destDir = path.join(__dirname, '..', 'public', 'images');
  // Имя файла без /tmp/
  const fileName = path.basename(tmpFileName);
  const dest = path.join(destDir, fileName);
  await fs.mkdir(destDir, { recursive: true });
  await fs.rename(src, dest);
  return `/images/${fileName}`;
}

// Удалить файл из images
export async function deleteImageFile(fileName: string): Promise<void> {
  if (!fileName.startsWith('/images/')) return;
  const filePath = path.join(__dirname, '..', 'public', fileName);
  try {
    await fs.unlink(filePath);
  } catch (e) {
    // Файл мог быть уже удалён — игнорируем ошибку
  }
}
