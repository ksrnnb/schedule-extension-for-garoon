export class ErrorResponse {
  // Body stream can only be consumed once, so parse eagerly and cache as a Promise.
  private readonly _message: Promise<string | undefined>;

  constructor(protected resp: Response) {
    this._message = resp
      .json()
      .then((body: { message?: string }) => body?.message)
      .catch(() => undefined);
  }

  status(): number {
    return this.resp.status;
  }

  message(): Promise<string | undefined> {
    return this._message;
  }
}
