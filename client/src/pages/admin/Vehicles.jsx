import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2, Sparkles, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    type: '',
    costPerKm: '',
    driverAllowancePerDay: '',
    nightHaltCharge: ''
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/vehicles');
      setVehicles(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError('Failed to fetch vehicles');
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAddModal = () => {
    setModalType('add');
    setFormData({ type: '', costPerKm: '', driverAllowancePerDay: '', nightHaltCharge: '' });
    setShowModal(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setModalType('edit');
    setEditingVehicleId(vehicle._id || vehicle.id);
    setFormData({
      type: vehicle.type,
      costPerKm: vehicle.costPerKm.toString(),
      driverAllowancePerDay: vehicle.driverAllowancePerDay.toString(),
      nightHaltCharge: vehicle.nightHaltCharge.toString()
    });
    setShowModal(true);
  };

  const handleSaveVehicle = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      
      if (modalType === 'add') {
        await axios.post('http://localhost:5000/api/vehicles', formData, { headers });
      } else {
        await axios.put(`http://localhost:5000/api/vehicles/${editingVehicleId}`, formData, { headers });
      }
      
      setShowModal(false);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      alert(`Error saving vehicle: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle class?')) {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        await axios.delete(`http://localhost:5000/api/vehicles/${id}`, { headers });
        fetchVehicles();
      } catch (err) {
        console.error(err);
        alert(`Error deleting vehicle: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // Helper to retrieve category-specific visuals
  const getCategoryTheme = (type) => {
    switch (type) {
      case 'Sedan':
        return {
          bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
          gradient: 'from-cyan-500/20 to-blue-500/5',
          glow: 'bg-cyan-500',
          iconColor: '#22d3ee',
          icon: (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H6c-.6 0-1.1.2-1.4.6L2.1 11.2c-.7.7-1.1 1.7-1.1 2.8v2c0 .6.4 1 1 1h2M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM14 17H9" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )
        };
      case 'SUV':
        return {
          bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
          gradient: 'from-indigo-500/20 to-purple-500/5',
          glow: 'bg-indigo-500',
          iconColor: '#818cf8',
          icon: (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 14h1c.6 0 1-.4 1-1v-2.5c0-1.2-.8-2.2-2-2.4L17 7.5c-.8-.5-1.8-.7-2.7-.7H6c-1 0-1.9.4-2.5 1.2L1 11.5v2.5c0 .6.4 1 1 1h2M7 15a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17 15a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM14.5 15h-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )
        };
      case 'Innova':
        return {
          bg: 'bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]',
          gradient: 'from-[#D4AF37]/20 to-amber-500/5',
          glow: 'bg-[#D4AF37]',
          iconColor: '#D4AF37',
          icon: (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 15h1c.6 0 1-.4 1-1v-2c0-1.8 1.2-3.4 3-3.8l7.5-1.5c1-.2 2.1 0 3 .6l4.2 2.7c1.3.8 2.3 2.1 2.3 3.6v1.4c0 .6-.4 1-1 1h1M7 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM17 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14 16H10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )
        };
      default: // Tempo Traveller
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          gradient: 'from-rose-500/20 to-orange-500/5',
          glow: 'bg-rose-500',
          iconColor: '#f43f5e',
          icon: (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="5" width="20" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 16a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18 16a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2 10h20M7 5v5M17 5v5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )
        };
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Vehicles Management</h1>
          <p className="text-gray-400 mt-1 text-sm">Configure dynamic fleet tariffs and charges per kilometer.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-[#D4AF37] text-[#0B1221] px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#F2CD5C] transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] shrink-0 self-start sm:self-center"
        >
          <Plus size={18} /> Add Vehicle Class
        </button>
      </div>

      {/* Control Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search fleet categories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111C35] border border-white/5 text-white rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-[#D4AF37] transition-all placeholder-gray-500" 
          />
        </div>
        
        {vehicles.length > 0 && (
          <span className="text-xs font-semibold text-gray-500 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">
            Showing {filteredVehicles.length} of {vehicles.length} vehicle classes
          </span>
        )}
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-80 text-[#D4AF37] gap-3">
          <Loader2 className="animate-spin" size={36} />
          <p className="text-gray-400 text-sm font-medium">Querying fleet inventory...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 justify-center h-80 text-red-400 font-medium">
          <AlertCircle size={20} /> {error}
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 text-gray-500 text-center border border-dashed border-white/10 rounded-2xl p-6 bg-white/[0.01]">
          <Car size={32} className="mb-3 text-gray-600" />
          <h4 className="text-sm font-bold text-gray-400">No Vehicles Registered</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">There are no vehicle pricing tiers registered matching your query.</p>
          <button onClick={handleOpenAddModal} className="mt-4 text-xs font-bold text-[#D4AF37] flex items-center gap-1.5 hover:text-[#F2CD5C] transition-colors"><Plus size={14} /> Add Vehicle</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((v) => {
            const theme = getCategoryTheme(v.type);
            const id = v._id || v.id;
            return (
              <div 
                key={id} 
                className="glass-panel gold-glow-hover rounded-2xl p-6 relative overflow-hidden flex flex-col group shadow-lg"
              >
                {/* Visual back glow */}
                <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full filter blur-[50px] opacity-10 pointer-events-none ${theme.glow}`}></div>
                
                {/* Header info */}
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1.5">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${theme.bg}`}>
                      {v.type}
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-wide mt-2">{v.type} Class</h3>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0B1221] border border-white/5 text-gray-400 flex items-center justify-center">
                    {theme.icon}
                  </div>
                </div>

                {/* Pricing Rules */}
                <div className="space-y-3.5 bg-[#0B1221]/50 p-4 rounded-xl border border-white/5 mb-6">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-semibold">Running Tariff</span>
                    <span className="text-white font-bold">₹{v.costPerKm} <span className="text-gray-500 font-normal">/ km</span></span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-semibold">Driver Allowance</span>
                    <span className="text-white font-bold">₹{v.driverAllowancePerDay} <span className="text-gray-500 font-normal">/ day</span></span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-semibold">Night Halt Charge</span>
                    <span className="text-white font-bold">₹{v.nightHaltCharge} <span className="text-gray-500 font-normal">/ night</span></span>
                  </div>
                </div>

                {/* Operations Buttons */}
                <div className="flex gap-2.5 mt-auto pt-2 border-t border-white/5">
                  <button 
                    onClick={() => handleOpenEditModal(v)}
                    className="flex-1 py-2.5 bg-white/5 border border-white/5 text-white hover:border-[#D4AF37]/30 hover:bg-white/[0.07] hover:text-[#D4AF37] rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 transition-all"
                  >
                    <Edit2 size={13} /> Edit Tariff
                  </button>
                  <button 
                    onClick={() => handleDelete(id)}
                    className="px-3.5 py-2.5 bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/10 hover:border-red-500/20 rounded-xl transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111C35] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden shadow-black/80 animate-fade-in">
            
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-white/5 flex justify-between items-center bg-[#0B1221]/45">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-[#D4AF37]" /> {modalType === 'add' ? 'Onboard New Vehicle Class' : 'Modify Vehicle Tariff'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Vehicle Classification</label>
                <select 
                  className="w-full bg-[#0B1221] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  disabled={modalType === 'edit'} // Disable modifying type during edit
                >
                  <option value="" disabled>Select Classification</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Innova">Innova (Premium MPV)</option>
                  <option value="Tempo Traveller">Tempo Traveller (Coach)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Tariff Rate (₹/km)</label>
                  <input 
                    type="number" 
                    value={formData.costPerKm} 
                    onChange={e => setFormData({...formData, costPerKm: e.target.value})} 
                    className="w-full bg-[#0B1221] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]" 
                    placeholder="15" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Night Halt Tariff (₹)</label>
                  <input 
                    type="number" 
                    value={formData.nightHaltCharge} 
                    onChange={e => setFormData({...formData, nightHaltCharge: e.target.value})} 
                    className="w-full bg-[#0B1221] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]" 
                    placeholder="300" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Driver Allowance / Day (₹)</label>
                <input 
                  type="number" 
                  value={formData.driverAllowancePerDay} 
                  onChange={e => setFormData({...formData, driverAllowancePerDay: e.target.value})} 
                  className="w-full bg-[#0B1221] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]" 
                  placeholder="500" 
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4.5 border-t border-white/5 flex justify-end gap-3 bg-[#0B1221]/45">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-4 py-2.5 text-xs text-gray-400 font-bold hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveVehicle} 
                disabled={!formData.type || !formData.costPerKm || !formData.driverAllowancePerDay || !formData.nightHaltCharge}
                className="bg-[#D4AF37] text-[#0B1221] px-5 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#F2CD5C] transition-all hover:shadow-[0_0_10px_rgba(212,175,55,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {modalType === 'add' ? 'Onboard Vehicle' : 'Apply Tariff Updates'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
