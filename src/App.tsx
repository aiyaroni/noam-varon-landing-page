/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Booking from './components/Booking';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import { adminLogin, getAdminAppointments } from './lib/api';
import { SERVICES } from './data/services';
import type { Appointment } from './types';
import { ShieldCheck, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function App() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const token = await adminLogin(password);
      const apts = await getAdminAppointments(token);
      setAdminToken(token);
      setAppointments(apts);
      setShowLogin(false);
      setPassword('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'שגיאה בכניסה');
    } finally {
      setLoginLoading(false);
    }
  };

  const serviceNameMap = Object.fromEntries(SERVICES.map(s => [s.id, s.name]));

  if (adminToken) {
    return (
      <div className="min-h-screen bg-background text-on-surface p-8 font-body" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl font-black font-headline uppercase italic text-primary">
              ניהול תורים — נועם ורון
            </h1>
            <button
              onClick={() => setAdminToken(null)}
              className="glass-card px-6 py-2 border border-white/10 hover:bg-primary hover:text-black transition-custom rounded"
            >
              יציאה
            </button>
          </div>

          <div className="glass-card overflow-hidden rounded">
            <table className="w-full text-right">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  {['לקוח', 'טלפון', 'שירות', 'תאריך', 'שעה', 'הערות', 'סטטוס'].map(h => (
                    <th key={h} className="p-4 font-headline uppercase text-xs tracking-widest text-white/40">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-white/20">אין תורים רשומים</td>
                  </tr>
                ) : (
                  [...appointments]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(apt => (
                      <tr key={apt.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all">
                        <td className="p-4">
                          <div className="font-bold flex items-center gap-2">
                            {apt.customerName}
                            {apt.isVerified && <ShieldCheck size={12} className="text-primary" />}
                          </div>
                          <div className="text-xs text-white/40">{apt.customerEmail}</div>
                        </td>
                        <td className="p-4 font-mono text-sm">{apt.customerPhone}</td>
                        <td className="p-4 text-sm">{serviceNameMap[apt.serviceId] ?? apt.serviceId}</td>
                        <td className="p-4">{format(new Date(apt.date), 'dd/MM/yyyy', { locale: he })}</td>
                        <td className="p-4 font-bold text-primary">{apt.time}</td>
                        <td className="p-4 text-xs text-white/60 max-w-[150px] truncate">{apt.notes || '—'}</td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full border border-primary/20">
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface cyber-grid selection:bg-primary selection:text-black">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Gallery />
        <Booking />
      </main>
      <div onDoubleClick={() => setShowLogin(true)}>
        <Footer />
      </div>

      {showLogin && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) { setShowLogin(false); setPassword(''); setLoginError(null); } }}
        >
          <div className="glass-card p-8 w-full max-w-sm rounded" dir="rtl">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={20} className="text-primary" />
              <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">כניסת מנהל</h2>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-background border-2 border-white/10 p-4 focus:border-primary outline-none transition-custom rounded font-bold"
                placeholder="סיסמה"
                autoFocus
              />
              {loginError && <p className="text-red-400 text-sm font-bold">{loginError}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowLogin(false); setPassword(''); setLoginError(null); }}
                  className="flex-1 border border-white/10 py-3 rounded hover:bg-white/5 transition-custom font-headline font-bold uppercase text-sm"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={loginLoading || !password}
                  className="flex-[2] electric-gradient text-on-primary-container py-3 rounded font-headline font-bold uppercase text-sm disabled:opacity-30 transition-custom"
                >
                  {loginLoading ? 'טוען...' : 'כניסה'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
