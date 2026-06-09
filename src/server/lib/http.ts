import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const errors = {
  unauthorized: (msg = 'não autenticado') =>
    new ApiError(401, 'UNAUTHORIZED', msg),
  forbidden: (msg = 'sem permissão') => new ApiError(403, 'FORBIDDEN', msg),
  notFound: (msg = 'não encontrado') => new ApiError(404, 'NOT_FOUND', msg),
  badRequest: (msg: string, details?: unknown) =>
    new ApiError(400, 'BAD_REQUEST', msg, details),
  conflict: (msg: string) => new ApiError(409, 'CONFLICT', msg),
  locked: (msg: string, details?: unknown) =>
    new ApiError(423, 'LOCKED', msg, details),
  unsupportedMedia: (msg = 'mime não permitido') =>
    new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', msg),
  tooLarge: (msg = 'payload muito grande') =>
    new ApiError(413, 'PAYLOAD_TOO_LARGE', msg),
};

export function handle<T>(
  fn: () => Promise<T>,
): Promise<Response> {
  return fn()
    .then((data) => {
      if (data instanceof Response) return data;
      if (data === undefined || data === null) {
        return new NextResponse(null, { status: 204 });
      }
      return NextResponse.json(data);
    })
    .catch((err: unknown) => {
      if (err instanceof ApiError) {
        return NextResponse.json(
          { error: err.message, code: err.code, details: err.details },
          { status: err.status },
        );
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          {
            error: 'validação falhou',
            code: 'VALIDATION',
            details: err.flatten(),
          },
          { status: 400 },
        );
      }
      console.error('[api] unhandled', err);
      return NextResponse.json(
        { error: 'erro interno', code: 'INTERNAL' },
        { status: 500 },
      );
    });
}
