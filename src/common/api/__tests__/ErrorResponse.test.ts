import { describe, expect, it } from 'vitest';
import { ErrorResponse } from '../ErrorResponse';

describe('ErrorResponse', () => {
  describe('status()', () => {
    it('returns the HTTP status code', () => {
      const resp = new Response('{}', { status: 403 });
      expect(new ErrorResponse(resp).status()).toBe(403);
    });

    it('returns 401 for auth errors', () => {
      const resp = new Response('{}', { status: 401 });
      expect(new ErrorResponse(resp).status()).toBe(401);
    });
  });

  describe('message()', () => {
    it('resolves the "message" field from a JSON body', async () => {
      const body = JSON.stringify({ message: 'User is not authenticated.' });
      const resp = new Response(body, { status: 401 });
      expect(await new ErrorResponse(resp).message()).toBe(
        'User is not authenticated.',
      );
    });

    it('resolves undefined when the JSON body has no "message" field', async () => {
      const body = JSON.stringify({ code: 'CB_AU01', errors: [] });
      const resp = new Response(body, { status: 403 });
      expect(await new ErrorResponse(resp).message()).toBeUndefined();
    });

    it('resolves undefined when the body is not valid JSON', async () => {
      const resp = new Response('Internal Server Error', { status: 500 });
      expect(await new ErrorResponse(resp).message()).toBeUndefined();
    });

    it('resolves undefined when the body is empty', async () => {
      const resp = new Response('', { status: 502 });
      expect(await new ErrorResponse(resp).message()).toBeUndefined();
    });

    it('returns the same Promise on repeated calls (cached)', async () => {
      const body = JSON.stringify({ message: 'error' });
      const resp = new Response(body, { status: 500 });
      const err = new ErrorResponse(resp);
      const p1 = err.message();
      const p2 = err.message();
      expect(p1).toBe(p2);
      expect(await p1).toBe('error');
    });
  });
});
