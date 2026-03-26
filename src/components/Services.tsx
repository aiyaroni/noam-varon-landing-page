import { motion } from 'motion/react';
import { SERVICES } from '../data/services';

export default function Services() {
  return (
    <section id="services" className="py-20 bg-background relative">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter">
              חבילת <br /><span className="text-primary-container">השירותים.</span>
            </h2>
          </div>
          <p className="text-on-surface-variant max-w-sm font-body">
            כל טיפול מבוצע בסטנדרט הגבוה ביותר, תוך שימוש במוצרים האיכותיים ביותר בשוק.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-10 group hover:border-primary/50 transition-custom"
            >
              <div className="w-16 h-16 rounded bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-custom">
                <service.icon className="text-3xl text-primary-dim w-8 h-8" />
              </div>
              <h3 className="font-headline text-2xl font-bold mb-4">{service.name}</h3>
              <p className="text-on-surface-variant mb-8 font-body leading-relaxed">{service.description}</p>
              <div className="flex justify-between items-center pt-6 border-t border-white/5">
                <span className="font-headline text-2xl font-bold text-primary-dim">{service.price}</span>
                <a href="#studio" className="text-sm font-label uppercase tracking-widest text-white/50 hover:text-primary transition-custom">
                  הזמן עכשיו
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
