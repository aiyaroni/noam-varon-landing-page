import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAppointments } from '../../lib/server/store';
import { validateToken } from '../../lib/server/auth';

export async function GET(req: VercelRequest, res: VercelResponse) {
  const token = (req.headers['authorization'] as string)?.replace('Bearer ', '');
  if (!token || !validateToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const appointments = await getAppointments();
    res.json({ appointments });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
