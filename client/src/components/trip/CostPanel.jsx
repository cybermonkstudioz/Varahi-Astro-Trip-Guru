import { Receipt, BarChart3 } from 'lucide-react';

const CostPanel = ({ mapResult, tripData }) => {
  const { 
    baseFare = 0, driverCost = 0, nightCost = 0, tolls = 0, 
    tripAssistance = 0, stateEntry = 0, templeFees = 0, otherCharges = 0,
    mealsCost = 0, parkingCost = 0, hotelCost = 0, pariharamCost = 0, homamCost = 0,
    total = 0 
  } = mapResult;

  // Group costs logically
  const baseVal = baseFare;
  const driverVal = driverCost + nightCost;
  const transitVal = tolls + tripAssistance + stateEntry + parkingCost;
  const stayFoodVal = hotelCost + mealsCost;
  const astroVal = templeFees + pariharamCost + homamCost + otherCharges;

  // Compute percentages
  const getPct = (val) => total > 0 ? (val / total) * 100 : 0;
  
  const segments = [
    { name: 'Base Tariff', value: baseVal, pct: getPct(baseVal), color: 'bg-[#D4AF37]' },
    { name: 'Driver & Halts', value: driverVal, pct: getPct(driverVal), color: 'bg-emerald-500' },
    { name: 'Tolls & Transit', value: transitVal, pct: getPct(transitVal), color: 'bg-orange-500' },
    { name: 'Lodging & Food', value: stayFoodVal, pct: getPct(stayFoodVal), color: 'bg-indigo-500' },
    { name: 'Astro & Temple', value: astroVal, pct: getPct(astroVal), color: 'bg-rose-500' }
  ].filter(s => s.value > 0);

  return (
    <div className="glass-panel-glow rounded-2xl p-6 shrink-0 w-full relative overflow-hidden shadow-xl mt-0">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D4AF37] rounded-full filter blur-[80px] opacity-10 pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-extrabold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 font-mono">
          <Receipt size={16} /> Journey Manifest Cost
        </h3>
        <span className="text-[10px] font-extrabold text-gray-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded uppercase tracking-wider">Estimated</span>
      </div>

      <div className="space-y-6">
        
        {/* Cost Distribution Progress Bar */}
        {total > 0 && (
          <div className="space-y-3.5 bg-[#0B1221]/50 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-semibold flex items-center gap-1.5"><BarChart3 size={14} /> Cost Allocation</span>
              <span className="text-white font-bold">{segments.length} Categories</span>
            </div>
            
            {/* Horizontal segmented bar */}
            <div className="w-full h-3.5 bg-white/5 rounded-full overflow-hidden flex shadow-inner">
              {segments.map((s, idx) => (
                <div 
                  key={idx} 
                  className={`${s.color} h-full transition-all duration-500`} 
                  style={{ width: `${s.pct}%` }}
                  title={`${s.name}: ₹${s.value.toLocaleString()} (${s.pct.toFixed(1)}%)`}
                />
              ))}
            </div>

            {/* Legend grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2 pt-1 border-t border-white/5">
              {segments.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px]">
                  <div className={`w-2 h-2 rounded-full ${s.color} shrink-0`}></div>
                  <span className="text-gray-400 truncate font-semibold" title={s.name}>{s.name}</span>
                  <span className="text-white font-bold ml-auto">₹{Math.round(s.value).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Travel Parameters */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold">
            <span>Calculated Distance</span>
            <span className="font-bold text-white">{mapResult.distance} km</span>
          </div>
          {mapResult.billableDistance > mapResult.distance && (
            <div className="flex justify-between items-center text-xs text-amber-500/90 font-medium italic">
              <span>Billable Minimum applied</span>
              <span className="font-bold">₹{mapResult.billableDistance} km</span>
            </div>
          )}
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold">
            <span>Duration (Driving time)</span>
            <span className="font-bold text-white">{mapResult.duration}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold">
            <span>Trip Calendar</span>
            <span className="font-bold text-white">{tripData.days} Days ({tripData.passengers} pax)</span>
          </div>
        </div>
        
        <div className="w-full h-px bg-white/5 my-1"></div>
        
        {/* Specific Ledger Details */}
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Base Fare ({tripData.vehicle?.name || 'Vehicle'})</span>
            <span className="font-bold text-white">₹{mapResult.baseFare.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Driver Allowance ({tripData.days} days)</span>
            <span className="font-bold text-white">₹{mapResult.driverCost.toLocaleString()}</span>
          </div>

          {mapResult.nightCost > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Night Halts Charge</span>
              <span className="font-bold text-white">₹{mapResult.nightCost.toLocaleString()}</span>
            </div>
          )}

          {mapResult.tolls > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Estimated Tolls</span>
              <span className="font-bold text-white">₹{mapResult.tolls.toLocaleString()}</span>
            </div>
          )}

          {mapResult.tripAssistance > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Trip Assistance Fee</span>
              <span className="font-bold text-white">₹{mapResult.tripAssistance.toLocaleString()}</span>
            </div>
          )}

          {mapResult.stateEntry > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>State Entry Tax</span>
              <span className="font-bold text-white">₹{mapResult.stateEntry.toLocaleString()}</span>
            </div>
          )}

          {mapResult.templeFees > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Temple Entrance Fees</span>
              <span className="font-bold text-white">₹{mapResult.templeFees.toLocaleString()}</span>
            </div>
          )}

          {mapResult.hotelCost > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Hotel Stay Cost</span>
              <span className="font-bold text-white">₹{mapResult.hotelCost.toLocaleString()}</span>
            </div>
          )}

          {mapResult.mealsCost > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Meals & Food Cost</span>
              <span className="font-bold text-white">₹{mapResult.mealsCost.toLocaleString()}</span>
            </div>
          )}

          {mapResult.parkingCost > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Parking Fees</span>
              <span className="font-bold text-white">₹{mapResult.parkingCost.toLocaleString()}</span>
            </div>
          )}

          {mapResult.pariharamCost > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Pariharam Arrangement</span>
              <span className="font-bold text-white">₹{mapResult.pariharamCost.toLocaleString()}</span>
            </div>
          )}

          {mapResult.homamCost > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Homam & Dakshina Cost</span>
              <span className="font-bold text-white">₹{mapResult.homamCost.toLocaleString()}</span>
            </div>
          )}

          {mapResult.otherCharges > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Other Miscellaneous</span>
              <span className="font-bold text-white">₹{mapResult.otherCharges.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        {/* Total Cost Ledger Banner */}
        <div className="pt-4 mt-2 border-t border-[#D4AF37]/30 flex justify-between items-center bg-[#0B1221] px-4 py-3.5 rounded-xl border border-white/5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Total Budget</span>
          <span className="text-2xl font-extrabold text-[#D4AF37] tracking-tight">₹{mapResult.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CostPanel;
