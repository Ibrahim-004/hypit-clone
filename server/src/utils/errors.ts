export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export const notFound = (message = 'Resource not found') => new ApiError(404, 'NOT_FOUND', message);
export const unauthorized = (message = 'Unauthorized') =>
  new ApiError(401, 'UNAUTHORIZED', message);
export const badRequest = (code: string, message: string) => new ApiError(400, code, message);
