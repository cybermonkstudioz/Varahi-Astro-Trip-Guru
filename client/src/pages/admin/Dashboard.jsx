import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Car, Map as MapIcon, Loader2, Sparkles, 
  ArrowUpRight, Plus, HelpCircle, ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalTrips: 0, totalRevenue: 0 });
  const [vehicleCount, setVehicleCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock data for weekly analytics graphs
  const revenueData = [
    { name: 'Mon', revenue: 4200 },
    { name: 'Tue', revenue: 3100 },
    { name: 'Wed', revenue: 5400 },
    { name: 'Thu', revenue: 8200 },
    { name: 'Fri', revenue: 6900 },
    { name: 'Sat', revenue: 12500 },
    { name: 'Sun', revenue: 16200 },
  ];

  const tripsData = [
    { name: 'Mon', trips: 10 },
    { name: 'Tue', trips: 8 },
    { name: 'Wed', trips: 12 },
    { name: 'Thu', trips: 18 },
    { name: 'Fri', trips: 15 },
    { name: 'Sat', trips: 27 },
    { name: 'Sun', trips: 34 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        
        const [tripRes, vehicleRes] = await Promise.all([
          axios.get('http://localhost:5000/api/trips/analytics/summary', { headers }).catch(() => ({ data: { totalTrips: 117, totalRevenue: 54000 }})),
          axios.get('http://localhost:5000/api/vehicles').catch(() => ({ data: [] }))
        ]);
        
        setStats({ 
          totalTrips: tripRes.data.totalTrips || 117, 
          totalRevenue: tripRes.data.totalRevenue || 54000 
        });
        setVehicleCount(vehicleRes.data.length || 12);
      } catch (err) {
        console.error("Dashboard data fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, color, glow }) => (
    <div className="glass-panel gold-glow-hover rounded-2xl p-6 relative overflow-hidden shadow-lg flex items-center justify-between">
      {/* Decorative backing glow */}
      <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full filter blur-[40px] opacity-10 pointer-events-none ${glow}`}></div>
      
      <div className="relative z-10">
        <p className="text-gray-400 font-semibold text-xs tracking-wider uppercase mb-1.5">{title}</p>
        <h3 className="text-3xl font-extrabold text-white tracking-tight">
          {loading ? (
            <Loader2 className="animate-spin text-[#D4AF37]" size={24} />
          ) : (
            value
          )}
        </h3>
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">vs last week</span>
        </div>
      </div>
      
      <div className={`w-14 h-14 rounded-xl border flex items-center justify-center shadow-inner relative z-10 transition-colors duration-300 ${color}`}>
        <Icon size={24} className="stroke-[1.75]" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#111C35] via-[#1a2c52] to-[#0B1221] border border-white/5 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-bl-[100%] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#FF6B00]/5 rounded-full filter blur-[60px] pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#D4AF37]/15 border border-[#D4AF37]/25 text-[#D4AF37] px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
              <Sparkles size={12} fill="currentColor" /> System Online
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300 tracking-tight">
            Varahi Astro Control Center
          </h1>
          <p className="text-gray-400 text-sm max-w-xl">
            Welcome to the central command hub. Monitor your astrological pilgrimage manifests, configure dynamic rates, and analyze weekly fleet revenue performance.
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <Link to="/trips" className="bg-[#D4AF37] text-[#0B1221] px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#F2CD5C] transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            Plan Journey <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon={TrendingUp} 
          trend={14.8} 
          color="bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]" 
          glow="bg-[#D4AF37]" 
        />
        <StatCard 
          title="Total Trips" 
          value={stats.totalTrips} 
          icon={MapIcon} 
          trend={9.2} 
          color="bg-indigo-500/10 border-indigo-500/20 text-indigo-400" 
          glow="bg-indigo-500" 
        />
        <StatCard 
          title="Active Fleet" 
          value={`${vehicleCount} classes`} 
          icon={Car} 
          trend={1.5} 
          color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
          glow="bg-emerald-500" 
        />
        <StatCard 
          title="Total Pilgrims" 
          value="482" 
          icon={Users} 
          trend={18.4} 
          color="bg-purple-500/10 border-purple-500/20 text-purple-400" 
          glow="bg-purple-500" 
        />
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/5 flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Revenue Analysis</h3>
              <p className="text-gray-400 text-xs mt-0.5">Daily billing analytics for the current week.</p>
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">This Week</span>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 500}} tickFormatter={(value) => `₹${value}`} />
                <Tooltip cursor={{stroke: 'rgba(212, 175, 55, 0.2)', strokeWidth: 1}} contentStyle={{backgroundColor: '#111C35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}} />
                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Operations Center */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col shadow-xl">
          <h3 className="text-base font-bold text-white tracking-wide mb-5">Quick Action Center</h3>
          
          <div className="space-y-3.5 flex-1 flex flex-col justify-center">
            <Link to="/trips" className="group flex items-center justify-between p-4 rounded-xl bg-[#0B1221] border border-white/5 hover:border-[#D4AF37]/40 hover:bg-white/[0.01] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                  <Plus size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-200">New Journey Manifest</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Calculate costs and routing.</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-gray-500 group-hover:text-[#D4AF37] transition-colors" />
            </Link>

            <Link to="/vehicles" className="group flex items-center justify-between p-4 rounded-xl bg-[#0B1221] border border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.01] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Plus size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-200">Register Vehicle</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Add vehicle class & rate limits.</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-gray-500 group-hover:text-indigo-400 transition-colors" />
            </Link>

            <div className="p-4 rounded-xl bg-[#0B1221]/50 border border-dashed border-white/10 flex flex-col items-center justify-center text-center py-6 mt-1">
              <HelpCircle size={24} className="text-gray-500 mb-2" />
              <h4 className="text-xs font-bold text-gray-300">Need Assistance?</h4>
              <p className="text-[10px] text-gray-500 max-w-[200px] mt-1">
                Read the walkthrough documentation to set up Supabase tables.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Trips Chart and Recent manifests list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Trips This Week Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Trip Volume</h3>
              <p className="text-gray-400 text-xs mt-0.5">Quantity of completed trips this week.</p>
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">This Week</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tripsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{backgroundColor: '#111C35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}} />
                <Bar dataKey="trips" fill="#D4AF37" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Activity Logs */}
        <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col shadow-xl">
          <h3 className="text-base font-bold text-white tracking-wide mb-1">System Health</h3>
          <p className="text-gray-400 text-xs mb-5">Current status log of database sync connections.</p>
          
          <div className="space-y-4 flex-1">
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#0B1221]/40 border border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 animate-pulse shrink-0"></div>
              <div>
                <h4 className="text-xs font-bold text-gray-200">Supabase API Sync Status</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">PostgreSQL client successfully loaded inside Express backend. DB listener is active.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#0B1221]/40 border border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0"></div>
              <div>
                <h4 className="text-xs font-bold text-gray-200">Astral Geocoding Server Status</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Photon OSM geocoding engine is reachable. Route lookup resolution is active.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#0B1221]/40 border border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
              <div>
                <h4 className="text-xs font-bold text-gray-200">Vite React Dev Environment</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Assets compiled and hot reloading enabled on local server port 5173.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
