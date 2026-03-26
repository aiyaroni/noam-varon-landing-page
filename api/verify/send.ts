import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCode } from '../../lib/server/store';
import { sendEmail, buildVerificationHtml } from '../../lib/server/email';
import { rateLimit } from '../../lib/server/rateLimit';

function getIP(req: VercelRequest): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ?? 'unknown';
}

export async function POST(req: VercelRequest, res: VercelResponse) {
  const ip = getIP(req);
  if (!rateLimit(`verify:${ip}`, 3, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'יותר מדי בקשות. נסה שוב בעוד 10 דקות.' });
  }

  const { phone, email } = req.body as { phone?: string; email?: string };
  if (!phone || !email || !email.includes('@')) {
    return res.status(400).json({ error: 'phone and email required' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await setCode(phone, code);

  await sendEmail(
    email,
    'קוד אימות - Noam Varon Studio',
    `קוד האימות שלך: ${code} (תקף ל-5 דקות)`,
    buildVerificationHtml(code)
  );

  res.json({ status: 'ok' });
}
