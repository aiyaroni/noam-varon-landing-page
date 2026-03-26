import { Instagram, Facebook, MapPin, Phone, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2">
            <h2 className="font-headline text-3xl font-bold tracking-tighter mb-6">NOAM VARON</h2>
            <p className="text-on-surface-variant max-w-sm font-body leading-relaxed mb-8">
              סטודיו ביתי לעיצוב שיער וזקן. חוויית טיפוח פרימיום המשלבת דיוק כירורגי עם סטייל מודרני באווירה אישית ונינוחה.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-custom">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-custom">
                <Facebook size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-label text-white uppercase tracking-widest mb-6">צור קשר</h4>
            <ul className="space-y-4 font-body text-on-surface-variant">
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-primary-dim" />
                <span>יוסי בנאי 38, רמלה</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary-dim" />
                <span>052-404-0859</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-label text-white uppercase tracking-widest mb-6">שעות פעילות</h4>
            <ul className="space-y-4 font-body text-on-surface-variant">
              <li className="flex items-center gap-3">
                <Clock size={18} className="text-primary-dim" />
                <span>א׳-ה׳: 09:00 - 19:00</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={18} className="text-primary-dim" />
                <span>ו׳: 09:00 - 14:00</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-label text-zinc-500 uppercase tracking-widest">
            © 2024 NOAM VARON. כל הזכויות שמורות.
          </p>
          <p className="text-sm font-label text-zinc-500 uppercase tracking-widest">
            נבנה על ידי <a href="https://yaroni.studio" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-custom font-headline">YARONI STUDIO</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
