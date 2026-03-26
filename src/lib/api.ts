import type { Appointment } from '../types';

// ─── Local cache (optimistic UI) ─────────────────────────────────────────────

const STORE_KEY = 'noam_varon_appointments';

export function getCachedAppointments(): Appointment[] {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') as Appointment[];
  } catch {
    return [];
  }
}

function cacheAppointment(apt: Appointment) {
  try {
    const existing = getCachedAppointments();
    localStorage.setItem(STORE_KEY, JSON.stringify([...existing, apt]));
  } catch {}
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function saveAppointment(appointment: Appointment): Promise<void> {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointment),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? 'Failed to save appointment');
  }
  const { id } = await res.json() as { id: string };
  cacheAppointment({ ...appointment, id });
}

export async function getAvailableSlots(date: string): Promise<string[]> {
  const res = await fetch(`/api/slots?date=${date}`);
  if (!res.ok) return [];
  const { booked } = await res.json() as { booked: string[] };
  return booked;
}

// ─── Verification ─────────────────────────────────────────────────────────────

export async function sendVerificationCode(phone: string, email: string): Promise<void> {
  const res = await fetch('/api/verify/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? 'Failed to send verification code');
  }
}

export async function verifyCode(phone: string, code: string): Promise<boolean> {
  const res = await fetch('/api/verify/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  if (!res.ok) throw new Error('Verification check failed');
  const { isValid } = await res.json() as { isValid: boolean };
  return isValid;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function adminLogin(password: string): Promise<string> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? 'Login failed');
  }
  const { token } = await res.json() as { token: string };
  return token;
}

export async function getAdminAppointments(token: string): Promise<Appointment[]> {
  const res = await fetch('/api/admin/appointments', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unauthorized');
  const { appointments } = await res.json() as { appointments: Appointment[] };
  return appointments;
}
