import { Scissors, User, Award } from 'lucide-react';

export const SERVICES = [
  {
    id: 'haircut',
    name: 'תספורת',
    description: 'תספורת גברים מקצועית הכוללת התאמה אישית למבנה הפנים ועיצוב בסטייל.',
    price: '₪50',
    duration: 30,
    icon: Scissors,
  },
  {
    id: 'beard',
    name: 'עיצוב זקן',
    description: 'פיסול ודיוק הזקן בעזרת מכונה ותער, כולל טיפול במגבת חמה ושמנים מזינים.',
    price: '₪25',
    duration: 20,
    icon: User,
  },
  {
    id: 'premium',
    name: 'חבילת פרימיום',
    description: 'השילוב המנצח: תספורת, עיצוב זקן ושעווה למראה מושלם ומלוטש.',
    price: '₪80',
    duration: 60,
    icon: Award,
  },
] as const;

export type ServiceId = typeof SERVICES[number]['id'];
