import { motion } from 'motion/react';
import { Scissors } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover grayscale opacity-40" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvhoTII86lcNzuk_806327VToy3e8yb4xBIzIggxtnNBkJkjFgvWnoqacGBoJAJFUtl0VVRPxWW9122ozO-okJtFc3miaIWw-rVLmWNeSMFp_dlihSpFuu2Qvsg1IoJGoGQ1S5_g2e46bN7DoUjxxGmIYePguLjc7QC2h02lPi9Ys-hYXEDAhIPfuDhC1YgYNMJXXAb8BJlOnvx0dZjq-7O-gs57oldQS8nHMjEBFs7kDq_p3_vgX_-_JuKXUFFuxSta-RQpFOdZ4"
          alt="Barber Studio"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1512690196252-751d3948f4ec?auto=format&fit=crop&w=1920&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
        <div className="max-w-2xl">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-label text-primary-dim tracking-[0.3em] uppercase block mb-4"
          >
            נועם ורון / מאז 2024
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-headline text-6xl md:text-8xl font-extrabold leading-none tracking-tighter mb-8"
          >
            אמנות <br/>
            <span className="text-primary-container">הדיוק.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-on-surface-variant text-lg md:text-xl max-w-md mb-10 leading-relaxed font-body"
          >
            חוויית טיפוח פרימיום לגבר המודרני. שירות אישי, דיוק כירורגי וסטייל חסר פשרות באווירה ביתית ונינוחה.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4"
          >
            <a 
              className="electric-gradient text-on-primary-container px-10 py-4 font-headline font-bold text-lg tracking-tight hover:shadow-[0_0_30px_rgba(209,252,0,0.3)] transition-custom rounded" 
              href="#studio"
            >
              הזמן תור עכשיו
            </a>
          </motion.div>
        </div>
      </div>

      {/* Surgical Motif Background */}
      <div className="absolute -right-20 top-1/2 -translate-y-1/2 surgical-motif pointer-events-none">
        <Scissors className="text-surface-variant w-[40rem] h-[40rem]" />
      </div>
    </section>
  );
}
