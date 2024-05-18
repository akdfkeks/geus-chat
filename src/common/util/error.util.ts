import { ErrorResponse, ExpectedError } from 'src/structure/error';

export namespace ErrorUtil {
  const errorTitle: Record<number, string> = {
    400: 'BadRequest',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'NotFound',
    409: 'Conflict',
    500: 'InternalServerError',
  };

  const httpError = (status: number) => (res: ErrorResponse) => {
    return new ExpectedError(errorTitle[status], status, res);
  };

  export const badRequest = httpError(400);
  export const unauthorized = httpError(401);
  export const forbidden = httpError(403);
  export const notFound = httpError(404);
  export const conflict = httpError(409);
  export const internal = httpError(500);
}
