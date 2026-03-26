import { createHmac } from 'crypto';

const SECRET = process.env.ADMIN_SECRET ?? 'dev-secret-change-me';

function sign(hour: number): string {
  return createHmac('sha256', SECRET).update(String(hour)).digest('hex');
}

/** Generates a token valid for the current hour. */
export function generateToken(): string {
  return sign(Math.floor(Date.now() / 3_600_000));
}

/** Validates a token for the current or previous hour (allows up to ~2h window). */
export function validateToken(token: string): boolean {
  const h = Math.floor(Date.now() / 3_600_000);
  return [h, h - 1].some(hour => sign(hour) === token);
}
