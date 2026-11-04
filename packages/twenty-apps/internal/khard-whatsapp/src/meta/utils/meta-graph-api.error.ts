export class MetaGraphApiError extends Error {
  constructor(
    message: string,
    readonly code: number | undefined,
    readonly httpStatus: number,
  ) {
    super(message);
    this.name = 'MetaGraphApiError';
  }
}
