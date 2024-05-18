import type { HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  code: string;
  title: string;
  message: string;
}

export class ExpectedError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly title: string;
  public readonly message: string;

  constructor(name: string, status: HttpStatus, response: ErrorResponse) {
    super();
    this.name = name;
    this.status = status;
    this.code = response.code;
    this.title = response.title;
    this.message = response.message;
  }

  public getResponse(): ErrorResponse {
    return {
      code: this.code,
      title: this.title,
      message: this.message,
    };
  }
}
