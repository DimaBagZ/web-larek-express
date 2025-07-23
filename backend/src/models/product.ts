import mongoose, { Schema, Document } from 'mongoose';

// Интерфейс для файлов
export interface IFile {
  fileName: string;
  originalName: string;
}

// Интерфейс для продукта
export interface IProduct extends Document {
  title: string;
  image: IFile;
  category: string;
  description?: string;
  price?: number | null;
}

// Схема продукта с валидацией
const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      unique: true,
      required: [true, 'Поле "title" должно быть заполнено'],
      minlength: [2, 'Минимальная длина поля "title" - 2'],
      maxlength: [30, 'Максимальная длина поля "title" - 30'],
    },
    image: {
      fileName: {
        type: String,
        required: [true, 'Поле "image.fileName" обязательно'],
      },
      originalName: {
        type: String,
        required: [true, 'Поле "image.originalName" обязательно'],
      },
    },
    category: {
      type: String,
      required: [true, 'Поле "category" обязательно'],
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: null,
    },
  },
  { versionKey: false },
);

// Экспортируем модель
export default mongoose.model<IProduct>('product', productSchema);
