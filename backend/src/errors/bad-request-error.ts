import AppError from './app-error';

export default class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}
