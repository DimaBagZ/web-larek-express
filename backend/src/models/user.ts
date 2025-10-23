import mongoose, { Schema, Document } from 'mongoose';

// Интерфейс для пользователя
export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  tokens: { token: string }[];
}

// Схема пользователя с валидацией
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      minlength: [2, 'Минимальная длина поля "name" - 2'],
      maxlength: [30, 'Максимальная длина поля "name" - 30'],
      default: 'Ё-мое',
    },
    email: {
      type: String,
      required: [true, 'Поле "email" обязательно'],
      unique: true,
      validate: {
        validator: (v: string) => /.+@.+\..+/.test(v),
        message: 'Некорректный email',
      },
    },
    password: {
      type: String,
      required: [true, 'Поле "password" обязательно'],
      minlength: [6, 'Минимальная длина пароля - 6'],
      select: false, // не возвращать по умолчанию
    },
    tokens: {
      type: [
        {
          token: { type: String, required: true },
        },
      ],
      select: false, // не возвращать по умолчанию
      default: [],
    },
  },
  { versionKey: false },
);

// Экспортируем модель
export default mongoose.model<IUser>('user', userSchema);
