import { motion } from 'motion/react';

export default function About() {
  return (
    <section id="about" className="py-20 bg-surface-container-low relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 border-l border-t border-primary/20"></div>
          <img 
            className="w-full aspect-[4/5] object-cover rounded shadow-2xl relative z-10 grayscale hover:grayscale-0 transition-custom" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNHaLdQoZedjAa_hbWp9EjoUdwpOHqS40wikMyEhf9Ld1SyTFtKjuVvuvno619gJtMqd5B4piynE0-39xJ5X4YrmxqEVnxeyL15ewuOPK9rdw3h_I9YLq8jHAVQUtmbQEdBkEle_UB2iBR_kdJh39ILb0UpPxKAoF9z92l7m4SpOobsm3LjCXMjT55AhXHnG81ETffuGsy2t7ggq6qOkNKrALnZndMJb2_Faac4B_rOB2VXIncT2VS-KF4UGfuP4r8ja4vNtQzuxk"
            alt="Barber Hands"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80";
            }}
          />
          <div className="absolute -bottom-6 -right-6 w-full h-full bg-primary-container/5 -z-0"></div>
        </motion.div>
        
        <div className="flex flex-col gap-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-headline text-4xl md:text-5xl font-bold tracking-tighter"
          >
            איש אחד, <br/><span className="text-primary-dim">משימה אחת.</span>
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-6 text-on-surface-variant leading-relaxed text-lg font-body"
          >
            <p>אני מאמין שתספורת היא לא רק תחזוקה, היא הצהרה. <span className="font-headline text-white">NOAM VARON</span> הוא מותג שנולד מתוך תשוקה לדיוק ולפרטים הקטנים ביותר שהופכים מראה טוב למראה מושלם.</p>
            <p>כאן אין "פס ייצור". כל לקוח מקבל את מלוא תשומת הלב שלי, אבחון מבנה פנים והתאמה אישית של הסטייל הנכון ביותר עבורו – הכל באווירה ביתית, אישית ונינוחה.</p>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-8 pt-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="font-headline text-3xl font-bold text-primary-dim">100%</div>
              <div className="text-sm font-label text-zinc-500 uppercase tracking-widest">פוקוס עליך</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="font-headline text-3xl font-bold text-primary-dim">5</div>
              <div className="text-sm font-label text-zinc-500 uppercase tracking-widest">שנות ניסיון</div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
