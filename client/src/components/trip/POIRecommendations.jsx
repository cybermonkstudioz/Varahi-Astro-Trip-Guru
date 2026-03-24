import { useState, useEffect } from 'react';
import { Bed, Coffee, Fuel, Star, MapPin } from 'lucide-react';

const POIRecommendations = ({ tripData, mapResult }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hotels');
  
  // Mock data for graceful fallback (Simulating Google Places)
  const mockHotels = [
    { id: 1, name: 'Taj Gateway Resort', type: 'Premium', rating: 4.8, price: '₹8,500', location: `Near ${tripData.destination || 'Central'} Temple` },
    { id: 2, name: 'Grand Residency', type: 'Mid-Range', rating: 4.2, price: '₹3,200', location: 'City Center' },
    { id: 3, name: 'Pilgrim Lodge', type: 'Budget', rating: 3.9, price: '₹1,200', location: 'Walking distance to temple' }
  ];

  const mockStops = [
    { id: 1, name: 'Highway Food Court', type: 'Restaurant', distance: '120 km', rating: 4.1 },
    { id: 2, name: 'Bharat Petroleum', type: 'Fuel', distance: '122 km', rating: 4.5 },
    { id: 3, name: 'Sagar Ratna Veg', type: 'Restaurant', distance: '245 km', rating: 4.6 }
  ];

  useEffect(() => {
    // Simulate API fetch delay for Google Places integration
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [mapResult, activeTab]);

  if (!tripData.destination) return null;

  return (
    <div className="bg-[#111C35] rounded-xl border border-white/5 p-6 w-full shadow-lg mt-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-bl-[100%] pointer-events-none"></div>

      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4 relative z-10">
        <div>
           <h3 className="text-lg font-bold text-white tracking-wide">Route Intelligence</h3>
           <p className="text-gray-400 text-xs mt-1">Curated sanctums and rest-stops along your path.</p>
        </div>
        <div className="flex bg-[#0B1221] p-1 rounded-lg border border-white/5">
          <button 
            onClick={() => setActiveTab('hotels')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${activeTab === 'hotels' ? 'bg-[#D4AF37] text-[#0B1221]' : 'text-gray-400 hover:text-white'}`}
          >
            <Bed size={14} /> Hotels
          </button>
          <button 
            onClick={() => setActiveTab('stops')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${activeTab === 'stops' ? 'bg-[#D4AF37] text-[#0B1221]' : 'text-gray-400 hover:text-white'}`}
          >
            <Coffee size={14} /> Pit Stops
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex flex-col justify-center items-center text-gray-500 relative z-10">
           <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-3"></div>
           <p className="text-sm">Consulting the Oracles (Google Places API)...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10 animate-fade-in">
          {activeTab === 'hotels' ? (
            mockHotels.map(hotel => (
              <div key={hotel.id} className="bg-[#0B1221] border border-white/5 rounded-lg p-5 hover:border-[#D4AF37]/50 transition-colors group cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${hotel.type === 'Premium' ? 'bg-purple-900/50 text-purple-300' : hotel.type === 'Mid-Range' ? 'bg-blue-900/50 text-blue-400' : 'bg-gray-800 text-gray-300'}`}>
                    {hotel.type}
                  </span>
                  <div className="flex items-center gap-1 text-[#D4AF37] text-xs font-bold">
                    <Star size={12} fill="currentColor" /> {hotel.rating}
                  </div>
                </div>
                <h4 className="text-white font-semibold mb-1 group-hover:text-[#D4AF37] transition-colors">{hotel.name}</h4>
                <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                  <MapPin size={12} /> {hotel.location}
                </div>
                <div className="border-t border-white/5 pt-3 mt-auto flex justify-between items-center">
                  <span className="text-lg font-bold text-white">{hotel.price} <span className="text-[10px] uppercase tracking-wider font-normal text-gray-500">/ night</span></span>
                </div>
              </div>
            ))
          ) : (
            mockStops.map(stop => (
              <div key={stop.id} className="bg-[#0B1221] border border-white/5 rounded-lg p-5 hover:border-[#D4AF37]/50 transition-colors group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${stop.type === 'Fuel' ? 'bg-orange-900/30 text-orange-500' : 'bg-green-900/30 text-green-500'}`}>
                    {stop.type === 'Fuel' ? <Fuel size={16} /> : <Coffee size={16} />}
                  </div>
                  <div className="flex items-center gap-1 text-[#D4AF37] text-xs font-bold bg-[#D4AF37]/10 px-2 py-1 rounded-md">
                    <Star size={12} fill="currentColor" /> {stop.rating}
                  </div>
                </div>
                <h4 className="text-white font-semibold mb-1 group-hover:text-[#D4AF37] transition-colors">{stop.name}</h4>
                <div className="border-t border-white/5 pt-3 mt-4 flex justify-between items-center text-xs text-gray-400">
                  <span className="uppercase tracking-wide text-[10px]">Distance via route</span>
                  <span className="font-bold text-white bg-white/5 px-2 py-1 rounded-md">{stop.distance}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default POIRecommendations;
