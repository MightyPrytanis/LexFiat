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
    <header className="bg-warm-white border-b border-light-navy px-8 py-5 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-12">
          {/* Edison Bulb Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 edison-bulb flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-navy" />
              </div>
              <div className="absolute inset-0 piercing-light rounded-full"></div>
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-navy">Lex Fiat</span>
              <p className="text-xs text-charcoal font-medium -mt-1">Legal Intelligence</p>
            </div>
          </div>
          
          {/* Simplified Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-aqua font-semibold border-b-2 border-aqua pb-1">Workflow Dashboard</a>
            <a href="#" className="text-charcoal hover:text-aqua transition-colors">Analytics</a>
          </nav>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-6">
          {/* Gmail Integration Status */}
          <div className="flex items-center space-x-2 bg-light-gray px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-light-green rounded-full animate-pulse"></div>
            <span className="text-sm text-charcoal font-medium">Gmail Connected</span>
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 text-charcoal hover:text-aqua transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-alert-red text-xs rounded-full flex items-center justify-center text-white font-bold">
              3
            </span>
          </button>

          {/* Attorney Profile with Photo */}
          <div className="flex items-center space-x-3 bg-light-gray px-4 py-2 rounded-full">
            <div className="w-10 h-10 rounded-full bg-aqua bg-opacity-20 flex items-center justify-center border-2 border-aqua">
              <span className="text-sm font-bold text-aqua">
                {attorney?.name ? attorney.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'MM'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm text-navy">
                {attorney?.name || "Mekel S. Miller, Esq."}
              </p>
              <p className="text-xs text-charcoal">
                {attorney?.specialization || "Family Law Attorney"}
              </p>
            </div>
            <Settings className="h-4 w-4 text-charcoal hover:text-aqua cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
}
