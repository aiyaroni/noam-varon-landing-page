import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateToken } from '../../lib/server/auth';
import { rateLimit } from '../../lib/server/rateLimit';

function getIP(req: VercelRequest): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ?? 'unknown';
}

export function POST(req: VercelRequest, res: VercelResponse) {
  const ip = getIP(req);
  if (!rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  }

  const { password } = req.body as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('[ADMIN] ADMIN_PASSWORD env var not set!');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  if (!password || password !== adminPassword) {
    return res.status(401).json({ error: 'סיסמה שגויה' });
  }

  res.json({ token: generateToken() });
}
