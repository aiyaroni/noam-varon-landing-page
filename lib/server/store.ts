import type { Appointment } from '../../src/types';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// ─── Redis helper ────────────────────────────────────────────────────────────

export async function redis(cmd: (string | number)[]): Promise<unknown> {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmd),
  });
  const json = await res.json() as { result: unknown };
  return json.result;
}

// ─── In-memory + file fallback ───────────────────────────────────────────────

const mem: {
  appointments: Appointment[];
  codes: Map<string, { code: string; exp: number; attempts: number }>;
} = { appointments: [], codes: new Map() };

const DATA_DIR = join(process.cwd(), '.data');
const APT_FILE = join(DATA_DIR, 'appointments.json');

function loadFromFile() {
  if (REDIS_URL) return;
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    if (existsSync(APT_FILE)) {
      mem.appointments = JSON.parse(readFileSync(APT_FILE, 'utf-8')) as Appointment[];
    }
  } catch (e) {
    console.warn('[STORE] Could not load from file:', e);
  }
}

function saveToFile() {
  if (REDIS_URL) return;
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(APT_FILE, JSON.stringify(mem.appointments, null, 2));
  } catch (e) {
    console.warn('[STORE] Could not save to file:', e);
  }
}

loadFromFile();

// ─── Appointments ────────────────────────────────────────────────────────────

export async function getAppointments(): Promise<Appointment[]> {
  if (REDIS_URL) {
    const data = await redis(['LRANGE', 'nv:appointments', 0, -1]) as string[] | null;
    return (data ?? []).map(s => JSON.parse(s) as Appointment);
  }
  return [...mem.appointments];
}

export async function addAppointment(apt: Appointment): Promise<void> {
  if (REDIS_URL) {
    await redis(['RPUSH', 'nv:appointments', JSON.stringify(apt)]);
  } else {
    mem.appointments.push(apt);
    saveToFile();
  }
}

export async function getBookedSlots(dateStr: string): Promise<string[]> {
  const apts = await getAppointments();
  return apts
    .filter(a => a.date.startsWith(dateStr) && a.status !== 'cancelled')
    .map(a => a.time);
}

// ─── Verification codes ──────────────────────────────────────────────────────

const CODE_TTL_S = 300; // 5 minutes

export async function setCode(phone: string, code: string): Promise<void> {
  if (REDIS_URL) {
    await redis(['SET', `nv:vc:${phone}`, code, 'EX', CODE_TTL_S]);
  } else {
    mem.codes.set(phone, { code, exp: Date.now() + CODE_TTL_S * 1000, attempts: 0 });
  }
}

export async function checkAndDeleteCode(phone: string, inputCode: string): Promise<boolean> {
  if (REDIS_URL) {
    const stored = await redis(['GETDEL', `nv:vc:${phone}`]) as string | null;
    return stored === inputCode;
  }
  const entry = mem.codes.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.exp) { mem.codes.delete(phone); return false; }
  if (entry.code !== inputCode) {
    entry.attempts++;
    if (entry.attempts >= 5) mem.codes.delete(phone);
    return false;
  }
  mem.codes.delete(phone);
  return true;
}
