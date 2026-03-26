import { motion } from 'motion/react';
import { ZoomIn } from 'lucide-react';

const galleryImages = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1593702295094-272a9f01511f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1592647425550-8fe915cfa1db?auto=format&fit=crop&w=800&q=80"
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-20 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-16 text-center">
          <h2 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter">
            גלריית <span className="text-primary-container">עבודות.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="relative aspect-square overflow-hidden rounded group"
            >
              <img 
                src={image} 
                alt={`Work ${index + 1}`} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-custom"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://picsum.photos/seed/barber${index}/800/800`;
                }}
              />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-custom flex items-center justify-center">
                <ZoomIn className="text-white w-12 h-12" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
