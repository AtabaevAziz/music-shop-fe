export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly field?: string;
  readonly payload?: unknown;

  constructor(input: {
    message: string;
    status: number;
    code?: string;
    field?: string;
    payload?: unknown;
  }) {
    super(input.message);
    this.name = "ApiClientError";
    this.status = input.status;
    this.code = input.code;
    this.field = input.field;
    this.payload = input.payload;
  }
}
