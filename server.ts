import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Appointment } from './src/types.js';
import {
  getAppointments,
  addAppointment,
  getBookedSlots,
  setCode,
  checkAndDeleteCode,
} from './lib/server/store.js';
import { sendEmail, buildConfirmationHtml, buildVerificationHtml } from './lib/server/email.js';
import { generateToken, validateToken } from './lib/server/auth.js';
import { rateLimit } from './lib/server/rateLimit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(express.json());

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getIP(req: express.Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ?? req.socket.remoteAddress ?? 'unknown';
}

function validateAppointmentBody(body: unknown): body is Omit<Appointment, 'id' | 'createdAt'> {
  const b = body as Record<string, unknown>;
  return (
    typeof b.serviceId === 'string' && b.serviceId.length > 0 &&
    typeof b.date === 'string' && !isNaN(Date.parse(b.date as string)) &&
    typeof b.time === 'string' && /^\d{2}:\d{2}$/.test(b.time as string) &&
    typeof b.customerName === 'string' && (b.customerName as string).trim().length > 1 &&
    typeof b.customerPhone === 'string' && (b.customerPhone as string).replace(/\D/g, '').length >= 9 &&
    typeof b.customerEmail === 'string' && (b.customerEmail as string).includes('@') &&
    typeof b.isVerified === 'boolean' &&
    ['pending', 'confirmed', 'cancelled'].includes(b.status as string)
  );
}

// ─── API Routes ───────────────────────────────────────────────────────────────

app.get('/api/slots', async (req, res) => {
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
});

app.post('/api/appointments', async (req, res) => {
  if (!validateAppointmentBody(req.body)) {
    return res.status(400).json({ error: 'Invalid appointment data' });
  }
  const appointment: Appointment = {
    ...req.body,
    id: Math.random().toString(36).substring(2, 11),
    createdAt: new Date().toISOString(),
  };
  try {
    await addAppointment(appointment);
    await sendEmail(
      appointment.customerEmail,
      'אישור הזמנת תור - Noam Varon Studio',
      `היי ${appointment.customerName}, התור שלך נקבע ל-${new Date(appointment.date).toLocaleDateString('he-IL')} בשעה ${appointment.time}.`,
      buildConfirmationHtml(appointment)
    );
    res.status(201).json({ status: 'ok', id: appointment.id });
  } catch {
    res.status(500).json({ error: 'Failed to save appointment' });
  }
});

app.post('/api/verify/send', async (req, res) => {
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
});

app.post('/api/verify/check', async (req, res) => {
  const { phone, code } = req.body as { phone?: string; code?: string };
  if (!phone || !code) return res.status(400).json({ error: 'phone and code required' });
  const isValid = await checkAndDeleteCode(phone, code);
  res.json({ isValid });
});

app.post('/api/admin/login', (req, res) => {
  const ip = getIP(req);
  if (!rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many attempts' });
  }
  const { password } = req.body as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return res.status(500).json({ error: 'Server misconfiguration' });
  if (!password || password !== adminPassword) return res.status(401).json({ error: 'סיסמה שגויה' });
  res.json({ token: generateToken() });
});

app.get('/api/admin/appointments', async (req, res) => {
  const token = (req.headers['authorization'] as string)?.replace('Bearer ', '');
  if (!token || !validateToken(token)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const appointments = await getAppointments();
    res.json({ appointments });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Reminder checks (every minute) ──────────────────────────────────────────

async function checkReminders() {
  const now = new Date();
  let appointments: Appointment[] = [];
  try { appointments = await getAppointments(); } catch { return; }

  await Promise.all(appointments.map(async apt => {
    const aptDate = new Date(`${apt.date.split('T')[0]}T${apt.time}:00`);
    const diffHours = (aptDate.getTime() - now.getTime()) / 3_600_000;
    if (diffHours > 23.9 && diffHours < 24.1) {
      await sendEmail(apt.customerEmail, `תזכורת לתור מחר - Noam Varon Studio`,
        `היי ${apt.customerName}, תזכורת: תור מחר בשעה ${apt.time}. מחכים לך!`);
    }
    if (diffHours > 0.9 && diffHours < 1.1) {
      await sendEmail(apt.customerEmail, `תזכורת לתור בעוד שעה - Noam Varon Studio`,
        `היי ${apt.customerName}, עוד שעה! נתראה בשעה ${apt.time}.`);
    }
  }));
}

setInterval(() => { checkReminders().catch(console.error); }, 60_000);

// ─── Dev/Prod server ──────────────────────────────────────────────────────────

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`[SERVER] http://localhost:${PORT}`));
}

startServer();
