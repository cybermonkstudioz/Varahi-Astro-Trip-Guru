import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, Map, Sparkles } from 'lucide-react';
import logoImg from '../../assets/va_logo.png';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Vehicles', path: '/vehicles', icon: Car },
    { name: 'Trip Planner', path: '/trips', icon: Map },
  ];

  return (
    <div className="w-72 bg-[#111C35] border-r border-white/5 text-white flex flex-col z-20 shrink-0 shadow-lg">
      <div className="h-24 px-6 flex items-center gap-3.5 border-b border-white/10 group cursor-pointer transition-all duration-300 hover:bg-white/[0.02]">
        <div className="relative shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-[#0B1221] border-2 border-[#D4AF37]/40 overflow-hidden shadow-[0_0_10px_rgba(212,175,55,0.15)] transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] group-hover:border-[#D4AF37]">
          <img
            src={logoImg}
            alt="Varahi Astro Logo"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <div className="hidden text-sm font-bold text-[#D4AF37]">VA</div>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-yellow-100 uppercase drop-shadow-sm transition-all duration-300">
            Varahi Astro
          </h1>
          <span className="text-[10px] text-gray-400 font-semibold tracking-[0.25em] uppercase mt-0.5 transition-colors duration-300 group-hover:text-[#D4AF37]">Trip Guru</span>
        </div>
      </div>

      <nav className="flex-1 px-5 py-8 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive
                ? 'bg-[#D4AF37] text-[#0B1221] shadow-md'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
            >
              <Icon size={20} className={isActive ? 'text-[#0B1221]' : 'text-gray-400'} />
              <span className={`font-semibold text-sm ${isActive ? 'text-[#0B1221]' : ''}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 text-center text-xs text-gray-500 font-medium border-t border-white/5">
        Trip Guru Admin v1.0
      </div>
    </div>
  );
};

export default Sidebar;
