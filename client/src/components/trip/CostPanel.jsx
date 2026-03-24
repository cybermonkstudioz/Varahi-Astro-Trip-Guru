import { Receipt } from 'lucide-react';

const CostPanel = ({ mapResult, tripData }) => {
  return (
    <div className="bg-[#111C35] rounded-xl border border-[#D4AF37]/30 p-6 shrink-0 w-full relative overflow-hidden shadow-lg mt-0">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D4AF37] rounded-full filter blur-[80px] opacity-10 pointer-events-none"></div>
      
      <h3 className="text-sm font-semibold text-[#D4AF37] mb-4 uppercase tracking-wider flex items-center gap-2">
        <Receipt size={16} /> Journey Manifest
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs text-gray-300">
          <span>Actual Driving Distance</span>
          <span className="font-medium text-white">{mapResult.distance} km</span>
        </div>
        {mapResult.billableDistance > mapResult.distance && (
          <div className="flex justify-between items-center text-xs text-gray-400 italic">
            <span>Billable Minimum applied</span>
            <span className="font-medium text-[#D4AF37]">{mapResult.billableDistance} km</span>
          </div>
        )}
        <div className="flex justify-between items-center text-xs text-gray-300">
          <span>Duration (Driving time)</span>
          <span className="font-medium text-white">{mapResult.duration}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-300">
          <span>Trip Duration</span>
          <span className="font-medium text-white">{tripData.days} Days</span>
        </div>
        
        <div className="w-full h-px bg-white/10 my-1.5"></div>
        
        <div className="flex justify-between items-center text-xs text-gray-300">
          <span>Base Fare ({tripData.vehicle?.name})</span>
          <span className="font-medium text-white">₹{mapResult.baseFare.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-300">
          <span>Driver Allowance</span>
          <span className="font-medium text-white">₹{mapResult.driverCost.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-300">
          <span>Night Halts</span>
          <span className="font-medium text-white">₹{mapResult.nightCost.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-300">
          <span>Estimated Tolls</span>
          <span className="font-medium text-white">₹{mapResult.tolls.toLocaleString()}</span>
        </div>

        {mapResult.tripAssistance > 0 && (
          <div className="flex justify-between items-center text-xs text-gray-300">
            <span>Trip Assistance Fee</span>
            <span className="font-medium text-white">₹{mapResult.tripAssistance.toLocaleString()}</span>
          </div>
        )}

        {mapResult.stateEntry > 0 && (
          <div className="flex justify-between items-center text-xs text-gray-300">
            <span>State Entry Tax</span>
            <span className="font-medium text-white">₹{mapResult.stateEntry.toLocaleString()}</span>
          </div>
        )}

        {mapResult.templeFees > 0 && (
          <div className="flex justify-between items-center text-xs text-gray-300">
            <span>Temple Fees</span>
            <span className="font-medium text-white">₹{mapResult.templeFees.toLocaleString()}</span>
          </div>
        )}

        {mapResult.otherCharges > 0 && (
          <div className="flex justify-between items-center text-xs text-gray-300">
            <span>Other Miscellaneous</span>
            <span className="font-medium text-white">₹{mapResult.otherCharges.toLocaleString()}</span>
          </div>
        )}
        
        <div className="pt-4 mt-3 border-t border-[#D4AF37]/30 flex justify-between items-center bg-[#0B1221]/50 p-3 rounded-lg -mx-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Cost</span>
          <span className="text-xl font-bold text-[#D4AF37] tracking-tight">₹{mapResult.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CostPanel;
