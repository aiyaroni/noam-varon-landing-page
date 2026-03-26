import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval,
  isBefore,
  startOfToday,
} from 'date-fns';
import { he } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, User, ShieldCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { saveAppointment, sendVerificationCode, verifyCode, getAvailableSlots } from '@/src/lib/api';
import { SERVICES } from '@/src/data/services';
import type { Appointment } from '@/src/types';
import SectionHeader from './SectionHeader';

// Full week slots (09:00–19:00)
const WEEKDAY_SLOTS = [
  '09:00', '09:45', '10:30', '11:15', '12:00',
  '13:30', '14:15', '15:00', '15:45', '16:30', '17:15', '18:00',
];

// Friday: closes at 14:00
const FRIDAY_SLOTS = ['09:00', '09:45', '10:30', '11:15', '12:00', '13:00'];

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '972524040859';

function getSlotsForDay(day: Date): string[] {
  return day.getDay() === 5 ? FRIDAY_SLOTS : WEEKDAY_SLOTS;
}

function isClosedDay(day: Date): boolean {
  return day.getDay() === 6; // Saturday / Shabbat
}

export default function Booking() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Date/Time, 2: Details, 3: Verification
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', notes: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setSlotsLoading(true);
    getAvailableSlots(dateStr)
      .then(setBookedSlots)
      .catch(() => setBookedSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate]);

  const onDateClick = (day: Date) => {
    if (isBefore(day, startOfToday()) || isClosedDay(day)) return;
    setSelectedDate(day);
    setSelectedTime(null);
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-8">
      <h4 className="font-headline text-2xl font-bold uppercase tracking-tighter">
        {format(currentMonth, 'MMMM yyyy', { locale: he })}
      </h4>
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-10 h-10 flex items-center justify-center hover:bg-primary-dim hover:text-black transition-custom border border-white/10 rounded"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-10 h-10 flex items-center justify-center hover:bg-primary-dim hover:text-black transition-custom border border-white/10 rounded"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
    return (
      <div className="grid grid-cols-7 text-center text-xs font-label uppercase text-on-surface-variant mb-4 tracking-widest">
        {days.map((d, i) => (
          <div key={i} className={cn(i === 6 && 'text-white/20')}>{d}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const calendarDays = eachDayOfInterval({
      start: startOfWeek(monthStart),
      end: endOfWeek(endOfMonth(monthStart)),
    });

    return (
      <div className="grid grid-cols-7 gap-1 text-center font-body">
        {calendarDays.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isPast = isBefore(day, startOfToday());
          const isClosed = isClosedDay(day);
          const isDisabled = isPast || isClosed || !isCurrentMonth;

          return (
            <div
              key={i}
              onClick={() => !isDisabled && onDateClick(day)}
              className={cn(
                'py-4 transition-custom rounded text-sm',
                !isCurrentMonth && 'text-white/10',
                isCurrentMonth && !isSelected && !isDisabled && 'hover:bg-white/5 cursor-pointer',
                isSelected && 'bg-primary-container text-on-primary-container font-bold',
                (isPast || isClosed) && 'text-white/10 cursor-not-allowed',
                isClosed && isCurrentMonth && 'line-through'
              )}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    );
  };

  const handleSendCode = async () => {
    if (!formData.phone || !formData.email) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await sendVerificationCode(formData.phone, formData.email);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשליחת קוד האימות. נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedServiceId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const isValid = await verifyCode(formData.phone, verificationCode);
      if (!isValid) {
        setError('קוד אימות לא תקין. נסה שוב.');
        setIsSubmitting(false);
        return;
      }

      const appointment: Appointment = {
        serviceId: selectedServiceId,
        date: selectedDate.toISOString(),
        time: selectedTime,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        notes: formData.notes,
        isVerified: true,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await saveAppointment(appointment);
      setIsSuccess(true);

      const serviceName = SERVICES.find(s => s.id === selectedServiceId)?.name ?? '';
      const msg = `היי נועם, קבעתי תור דרך האתר.\nשירות: ${serviceName}\nתאריך: ${format(selectedDate, 'dd/MM/yyyy')} בשעה ${selectedTime}\nשם: ${formData.name}\nטלפון: ${formData.phone}`;
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

      setTimeout(() => window.open(whatsappUrl, '_blank'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'משהו השתבש, נסה שוב מאוחר יותר.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section id="studio" className="py-32 relative">
        <div className="container mx-auto px-6 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mb-8"
          >
            <CheckCircle2 size={48} className="text-on-primary-container" />
          </motion.div>
          <h2 className="font-headline text-5xl font-bold mb-4 tracking-tighter uppercase">התור הוזמן בהצלחה!</h2>
          <p className="text-on-surface-variant text-xl mb-8 max-w-md font-body">
            איזה כיף, {formData.name}!<br />
            התור שלך נקבע ל-{format(selectedDate!, 'dd/MM/yyyy')} בשעה {selectedTime}.<br />
            אישור נשלח לאימייל שלך.
          </p>
          <button
            onClick={() => { setIsSuccess(false); setStep(1); setSelectedDate(null); setSelectedTime(null); setSelectedServiceId(null); setFormData({ name: '', phone: '', email: '', notes: '' }); }}
            className="electric-gradient text-on-primary-container px-10 py-5 font-headline font-bold uppercase tracking-tight text-lg rounded"
          >
            חזרה לדף הבית
          </button>
        </div>
      </section>
    );
  }

  const availableSlots = getSlotsForDay(selectedDate ?? new Date()).filter(t => !bookedSlots.includes(t));

  return (
    <section id="studio" className="py-20 relative bg-surface overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionHeader
          title={<>שריין את <span className="text-primary italic">המקום שלך.</span></>}
          subtitle="קביעת תור מראש מבטיחה לך חיסכון בזמן, יחס אישי ומקצועי 1:1, ודיוק מקסימלי בתוצאה ללא המתנה מיותרת."
        />

        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12">
            {/* Progress */}
            <div className="flex gap-2 mb-12 h-1 bg-white/5 rounded-full overflow-hidden">
              {[1, 2, 3].map(n => (
                <div key={n} className={cn('h-full transition-all duration-500 w-1/3', step >= n ? 'bg-primary' : 'bg-transparent')} />
              ))}
            </div>

            {/* Step 1: Service + Date + Time */}
            {step === 1 && (
              <div className="space-y-10">
                {/* Service selection */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h4 className="font-headline text-2xl font-bold uppercase tracking-tighter italic">בחר שירות</h4>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {SERVICES.map(service => (
                      <button
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={cn(
                          'p-5 border-2 rounded text-right transition-custom',
                          selectedServiceId === service.id
                            ? 'border-primary bg-primary/10'
                            : 'border-white/10 hover:border-white/30'
                        )}
                      >
                        <div className="font-headline font-bold text-lg mb-1">{service.name}</div>
                        <div className="text-on-surface-variant text-sm mb-3">{service.duration} דקות</div>
                        <div className="font-headline text-primary font-bold text-xl">{service.price}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calendar + Time — visible after service selected */}
                {selectedServiceId && (
                  <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div>
                      {renderHeader()}
                      {renderDays()}
                      {renderCells()}
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <Clock className="text-primary" size={24} />
                        <h4 className="font-headline text-2xl font-bold uppercase tracking-tighter italic">בחר שעה</h4>
                      </div>

                      {!selectedDate ? (
                        <p className="text-on-surface-variant/40 font-body italic py-8 text-center">בחר תאריך כדי לראות שעות</p>
                      ) : slotsLoading ? (
                        <p className="text-on-surface-variant/40 font-body italic py-8 text-center">טוען שעות...</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          {getSlotsForDay(selectedDate).map(time => {
                            const isBooked = bookedSlots.includes(time);
                            return (
                              <button
                                key={time}
                                onClick={() => !isBooked && setSelectedTime(time)}
                                disabled={isBooked}
                                className={cn(
                                  'py-4 border-2 transition-custom font-black italic text-lg rounded',
                                  selectedTime === time
                                    ? 'bg-primary border-primary text-black'
                                    : isBooked
                                    ? 'border-white/5 text-white/15 cursor-not-allowed line-through'
                                    : 'border-white/10 hover:border-primary'
                                )}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {selectedTime && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => setStep(2)}
                          className="w-full electric-gradient text-on-primary-container py-5 font-headline font-bold uppercase text-xl tracking-tight rounded transition-custom shadow-xl"
                        >
                          המשך להזנת פרטים
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Personal details */}
            {step === 2 && (
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex items-center gap-3 mb-8">
                  <User className="text-primary" size={24} />
                  <h4 className="font-headline text-3xl font-bold uppercase tracking-tighter italic">פרטים אישיים</h4>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">שם מלא</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-background border-2 border-white/10 p-4 focus:border-primary outline-none transition-custom font-bold rounded"
                      placeholder="ישראל ישראלי"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">טלפון</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-background border-2 border-white/10 p-4 focus:border-primary outline-none transition-custom font-bold rounded"
                      placeholder="050-0000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">אימייל (לאישור ולקוד אימות)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-background border-2 border-white/10 p-4 focus:border-primary outline-none transition-custom font-bold rounded"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">הערות</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-background border-2 border-white/10 p-4 focus:border-primary outline-none transition-custom font-bold min-h-[100px] rounded"
                    placeholder="בקשות מיוחדות..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border-2 border-white/10 py-5 font-headline font-bold uppercase tracking-tight rounded hover:bg-white/5 transition-custom"
                  >
                    חזרה
                  </button>
                  <button
                    onClick={handleSendCode}
                    disabled={isSubmitting || !formData.name || !formData.phone || !formData.email}
                    className="flex-[2] electric-gradient text-on-primary-container py-5 font-headline font-bold uppercase text-xl tracking-tight disabled:opacity-30 rounded transition-custom shadow-xl"
                  >
                    {isSubmitting ? 'שולח...' : 'שלח קוד אימות לאימייל'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Verification */}
            {step === 3 && (
              <form onSubmit={handleVerifyAndSubmit} className="max-w-md mx-auto space-y-8">
                <div className="text-center space-y-4">
                  <ShieldCheck size={64} className="mx-auto text-primary" />
                  <h3 className="font-headline text-3xl font-bold uppercase tracking-tighter italic">אימות סופי</h3>
                  <p className="text-on-surface-variant font-body">
                    שלחנו קוד אימות לאימייל<br />
                    <span className="text-white font-bold">{formData.email}</span>
                  </p>
                </div>

                <input
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-background border-2 border-white/10 p-6 text-center text-4xl tracking-[0.5em] focus:border-primary outline-none transition-custom font-black rounded"
                  placeholder="000000"
                />

                {error && <p className="text-red-400 text-center font-bold">{error}</p>}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 border-2 border-white/10 py-5 font-headline font-bold uppercase tracking-tight rounded hover:bg-white/5 transition-custom"
                  >
                    חזרה
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || verificationCode.length !== 6}
                    className="flex-[2] electric-gradient text-on-primary-container py-5 font-headline font-bold uppercase text-xl tracking-tight disabled:opacity-30 rounded transition-custom shadow-xl"
                  >
                    {isSubmitting ? 'מאמת...' : 'אשר תור'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
