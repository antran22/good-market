export abstract class ServerError extends Error {
  statusCode: number;
  name: string;
}
export class BadRequestError extends ServerError {
  statusCode = 400;
  name = "Bad Request";
}

export class UnauthorizedError extends ServerError {
  statusCode = 401;
  name = "Unauthorized";
}

export class ForbiddenError extends ServerError {
  statusCode = 403;
  name = "Forbidden";
}

export class NotFoundError extends ServerError {
  statusCode = 404;
  name = "Not Found";
}

export class NotImplementedError extends ServerError {
  constructor(name: string) {
    super(`Route ${name} not implemented`);
    this.name = "Not Implemented";
  }
  statusCode = 500;
}
