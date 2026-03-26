import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getBookedSlots } from '../lib/server/store';

export async function GET(req: VercelRequest, res: VercelResponse) {
  const { date } = req.query;
  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' });
  }
  try {
    const booked = await getBookedSlots(date);
    res.json({ booked });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
