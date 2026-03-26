import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Appointment } from '../src/types';
import { addAppointment } from '../lib/server/store';
import { sendEmail, buildConfirmationHtml } from '../lib/server/email';

function validate(body: unknown): body is Omit<Appointment, 'id' | 'createdAt'> {
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

export async function POST(req: VercelRequest, res: VercelResponse) {
  if (!validate(req.body)) {
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
}
