export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description: string;
}

export interface Appointment {
  id?: string;
  serviceId: string;
  date: string; // ISO string
  time: string; // HH:mm
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  isVerified: boolean;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}
