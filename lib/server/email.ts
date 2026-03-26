import nodemailer from 'nodemailer';
import type { Appointment } from '../../src/types';

function createTransporter() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) return null;
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: parseInt(EMAIL_PORT ?? '587'),
    secure: EMAIL_PORT === '465',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const t = createTransporter();
  if (!t) {
    console.log(`[EMAIL SIM] To: ${to} | Subject: ${subject}\n${text}`);
    return;
  }
  try {
    await t.sendMail({ from: process.env.EMAIL_FROM ?? process.env.EMAIL_USER, to, subject, text, html });
    console.log(`[EMAIL] Sent to ${to}`);
  } catch (err) {
    console.error(`[EMAIL] Failed:`, err);
  }
}

export function buildConfirmationHtml(apt: Appointment): string {
  const dateStr = new Date(apt.date).toLocaleDateString('he-IL');
  const serviceNames: Record<string, string> = {
    haircut: 'תספורת',
    beard: 'עיצוב זקן',
    premium: 'חבילת פרימיום',
  };
  return `
    <div style="font-family:sans-serif;direction:rtl;text-align:right;padding:24px;max-width:500px;margin:0 auto;border:1px solid #eee;">
      <div style="background:#0e0e0e;color:#d1fc00;padding:16px 24px;margin:-24px -24px 24px;font-size:20px;font-weight:900;">
        ✂ NOAM VARON — אישור תור
      </div>
      <p>היי <strong>${apt.customerName}</strong>, התור שלך נקבע בהצלחה!</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#f9f9f9;">
        <tr><td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">שירות</td><td style="padding:10px 16px;font-weight:700;border-bottom:1px solid #eee;">${serviceNames[apt.serviceId] ?? apt.serviceId}</td></tr>
        <tr><td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">תאריך</td><td style="padding:10px 16px;font-weight:700;border-bottom:1px solid #eee;">${dateStr}</td></tr>
        <tr><td style="padding:10px 16px;color:#666;border-bottom:1px solid #eee;">שעה</td><td style="padding:10px 16px;font-weight:700;border-bottom:1px solid #eee;">${apt.time}</td></tr>
        <tr><td style="padding:10px 16px;color:#666;">מיקום</td><td style="padding:10px 16px;">יוסי בנאי 38, רמלה</td></tr>
      </table>
      <p>בכל שאלה ניתן לפנות ל: <a href="tel:0524040859">052-404-0859</a></p>
      <hr style="border:0;border-top:1px solid #eee;margin:20px 0;" />
      <p style="font-size:12px;color:#999;">Noam Varon Studio • Precision Grooming</p>
    </div>`;
}

export function buildVerificationHtml(code: string): string {
  return `
    <div style="font-family:sans-serif;direction:rtl;text-align:right;padding:24px;max-width:400px;margin:0 auto;border:1px solid #eee;">
      <div style="background:#0e0e0e;color:#d1fc00;padding:16px 24px;margin:-24px -24px 24px;font-size:20px;font-weight:900;">
        ✂ NOAM VARON — קוד אימות
      </div>
      <p>קוד האימות שלך לקביעת תור:</p>
      <div style="background:#f9f9f9;padding:20px;text-align:center;font-size:40px;font-weight:900;letter-spacing:14px;color:#0e0e0e;margin:16px 0;border:2px solid #eee;">
        ${code}
      </div>
      <p style="color:#999;font-size:13px;">הקוד תקף ל-5 דקות. אל תשתף אותו עם אף אחד.</p>
    </div>`;
}
