import { Bell, Settings, Lightbulb } from "lucide-react";
// import attorneyPhoto from "@assets/IMG_0104_1754179760418.JPG";

interface HeaderProps {
  attorney?: {
    name: string;
    email: string;
    specialization?: string;
  };
}

export default function Header({ attorney }: HeaderProps) {
  return (
    <header className="bg-slate-blue border-b-2 border-steel-blue px-8 py-5 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-12">
          {/* Negative Space Edison Bulb Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative w-14 h-14 edison-bulb">
              <div className="edison-filament"></div>
              <div className="light-rays"></div>
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-warm-white">Lex Fiat</span>
              <p className="text-sm text-accent-gold font-semibold -mt-1 tracking-wide">Legal Intelligence</p>
            </div>
          </div>
          
          {/* Professional Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-accent-gold font-semibold border-b-2 border-accent-gold pb-1 tracking-wide">
              Workflow Dashboard
            </a>
            <a href="#" className="text-warm-white hover:text-accent-gold transition-colors font-medium">
              Analytics
            </a>
          </nav>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-6">
          {/* Gmail Integration Status */}
          <div className="flex items-center space-x-2 bg-navy px-4 py-2 rounded-lg border border-steel-blue">
            <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse"></div>
            <span className="text-sm text-warm-white font-medium">Gmail Active</span>
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 text-warm-white hover:text-accent-gold transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-alert-amber text-xs rounded-full flex items-center justify-center text-deep-navy font-bold">
              3
            </span>
          </button>

          {/* Attorney Profile */}
          <div className="flex items-center space-x-3 bg-navy px-4 py-2 rounded-lg border border-steel-blue">
            <div className="w-10 h-10 rounded-full bg-professional-blue bg-opacity-30 flex items-center justify-center border-2 border-accent-gold">
              <span className="text-sm font-bold text-accent-gold">
                {attorney?.name ? attorney.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'MM'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm text-warm-white">
                {attorney?.name || "Mekel S. Miller, Esq."}
              </p>
              <p className="text-xs text-accent-gold">
                {attorney?.specialization || "Family Law Attorney"}
              </p>
            </div>
            <Settings className="h-4 w-4 text-warm-white hover:text-accent-gold cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
}
