import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAndDeleteCode } from '../../lib/server/store';

export async function POST(req: VercelRequest, res: VercelResponse) {
  const { phone, code } = req.body as { phone?: string; code?: string };
  if (!phone || !code) {
    return res.status(400).json({ error: 'phone and code required' });
  }
  const isValid = await checkAndDeleteCode(phone, code);
  res.json({ isValid });
}
