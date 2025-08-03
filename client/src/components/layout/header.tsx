import { Bell, Settings } from "lucide-react";
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
    <header className="bg-charcoal border-b border-gray-600 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 gradient-beacon rounded-xl flex items-center justify-center">
                <i className="fas fa-lightbulb text-navy text-xl"></i>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-light-green rounded-full animate-pulse-glow"></div>
            </div>
            <span className="text-xl font-serif font-bold text-warm-white">Lex Fiat</span>
          </div>
          
          {/* Main Navigation */}
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-aqua font-medium border-b-2 border-aqua pb-2">Dashboard</a>
            <a href="#" className="text-gray-300 hover:text-aqua transition-colors">Active Cases</a>
            <a href="#" className="text-gray-300 hover:text-aqua transition-colors">Documents</a>
            <a href="#" className="text-gray-300 hover:text-aqua transition-colors">Analytics</a>
          </nav>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-4">
          {/* Gmail Integration Status */}
          <div className="flex items-center space-x-2 bg-navy px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-light-green rounded-full animate-pulse-glow"></div>
            <span className="text-sm text-gray-300">Gmail Active</span>
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 text-gray-300 hover:text-aqua transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-alert-red text-xs rounded-full flex items-center justify-center text-white">
              3
            </span>
          </button>

          {/* Attorney Profile */}
          <div className="flex items-center space-x-3 bg-navy px-4 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-aqua bg-opacity-20 flex items-center justify-center">
              <span className="text-xs font-medium text-aqua">
                {attorney?.name ? attorney.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'MM'}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm text-warm-white">
                {attorney?.name || "Mekel S. Miller, Esq."}
              </p>
              <p className="text-xs text-gray-400">
                {attorney?.specialization || "Family Law Attorney"}
              </p>
            </div>
            <Settings className="h-4 w-4 text-gray-400 hover:text-aqua cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
}
