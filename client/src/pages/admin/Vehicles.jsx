import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import axios from 'axios';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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

  const handleAddVehicle = async () => {
    try {
      // Hardcode token to bypass auth temporarily since login is removed
      await axios.post('http://localhost:5000/api/vehicles', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowModal(false);
      setFormData({ type: '', costPerKm: '', driverAllowancePerDay: '', nightHaltCharge: '' });
      fetchVehicles();
    } catch (err) {
      console.error(err);
      alert('Error adding vehicle. Make sure the token is valid or remove the protect middleware.');
    }
  };

  const handleDelete = async (id) => {
    alert('Delete route not implemented on backend yet.');
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="mb-8 border-b border-white/5 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Vehicles</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage pricing rules for your fleet.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#D4AF37] text-[#0B1221] px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-[#F2CD5C] transition-colors"
        >
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>

      <div className="bg-[#111C35] rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input type="text" placeholder="Search vehicles..." className="w-full bg-[#0B1221] border border-white/10 text-white rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors" />
          </div>
        </div>
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex items-center justify-center h-64 text-[#D4AF37]">
                <Loader2 className="animate-spin" size={32} />
             </div>
          ) : error ? (
             <div className="flex items-center justify-center h-64 text-red-400">{error}</div>
          ) : vehicles.length === 0 ? (
             <div className="flex items-center justify-center h-64 text-gray-500">No vehicles found. Add your first vehicle.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0B1221]/50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6 font-medium">Category</th>
                  <th className="p-4 font-medium">Rate (₹/KM)</th>
                  <th className="p-4 font-medium">Driver Allowance</th>
                  <th className="p-4 font-medium">Night Halt</th>
                  <th className="p-4 pr-6 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6 font-medium text-gray-200">{v.type}</td>
                    <td className="p-4 text-gray-400">₹{v.costPerKm}</td>
                    <td className="p-4 text-gray-400">₹{v.driverAllowancePerDay}</td>
                    <td className="p-4 text-gray-400">₹{v.nightHaltCharge}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-white/5 rounded-md transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(v._id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111C35] rounded-xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden shadow-black/50">
            <div className="px-6 py-4 border-b border-white/5">
               <h2 className="text-lg font-semibold text-white">Add New Vehicle</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Vehicle Type</label>
                <select 
                  className="w-full bg-[#0B1221] border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] appearance-none"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="" disabled>Select Type</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Innova">Innova</option>
                  <option value="Tempo Traveller">Tempo Traveller</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Rate (₹/km)</label>
                  <input type="number" value={formData.costPerKm} onChange={e => setFormData({...formData, costPerKm: e.target.value})} className="w-full bg-[#0B1221] border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="15" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Night Halt (₹)</label>
                  <input type="number" value={formData.nightHaltCharge} onChange={e => setFormData({...formData, nightHaltCharge: e.target.value})} className="w-full bg-[#0B1221] border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="300" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Driver Allowance / Day (₹)</label>
                <input type="number" value={formData.driverAllowancePerDay} onChange={e => setFormData({...formData, driverAllowancePerDay: e.target.value})} className="w-full bg-[#0B1221] border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="500" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3 bg-[#0B1221]/50">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-5 py-2 text-sm text-gray-400 font-medium hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddVehicle} 
                disabled={!formData.type || !formData.costPerKm}
                className="bg-[#D4AF37] text-[#0B1221] px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#F2CD5C] transition-colors disabled:opacity-50"
              >
                Save Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
