import React, { forwardRef } from 'react';
import logoImg from '../../assets/va_logo.png';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTime = (timeStr) => {
  if (!timeStr) return 'N/A';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

// Reusable row component for consistent styling
const Row = ({ label, value, alt }) => (
  <div className={`flex justify-between py-2 px-2 border-b border-gray-50 ${alt ? 'bg-gray-50' : ''}`}>
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-xs text-gray-900 font-medium max-w-[65%] text-right">{value || 'N/A'}</span>
  </div>
);

// Using forwardRef so we can capture the DOM node easily from the parent
const TripManifestPDF = forwardRef(({ tripData, manifestResult }, ref) => {
  // Safe destructuring
  const { type, source, destination, stops = [], vehicle = {}, dates = {}, passengers } = tripData || {};
  const { 
    distance = 0, billableDistance = 0, duration = 'N/A', baseFare = 0, 
    driverCost = 0, nightCost = 0, tolls = 0, tripAssistance = 0, 
    templeFees = 0, stateEntry = 0, otherCharges = 0,
    mealsCost = 0, parkingCost = 0, hotelCost = 0, pariharamCost = 0, homamCost = 0,
    total = 0 
  } = manifestResult || {};

  const meals = tripData?.meals || {};
  const parking = tripData?.parking || {};
  const hotel = tripData?.hotel || {};
  const pariharam = tripData?.pariharam || {};
  const homam = tripData?.homam || {};
  const timeline = tripData?.tripTimeline || {};
  const notes = tripData?.notes || '';

  // Check if a section has any non-empty data
  const hasMeals = meals.breakfast?.description || meals.breakfast?.cost || meals.lunch?.description || meals.lunch?.cost || meals.dinner?.description || meals.dinner?.cost;
  const hasParking = parking.description || parking.charges;
  const hasHotel = hotel.name || hotel.days || hotel.persons || hotel.price;
  const hasPariharam = pariharam.description || pariharam.fees;
  const hasHomam = homam.type || homam.cost || homam.dakshina;
  const hasTimeline = timeline.startTime || timeline.refreshmentPlace || timeline.destinationArrival || (timeline.places && timeline.places.length > 0);

  return (
    <div 
      ref={ref}
      className="bg-white text-gray-900 font-sans p-[40px] pb-[70px] w-[210mm] shadow-lg box-border mx-auto relative"
      // Style explicitly scaled to approximate A4 dimension in DOM
      style={{ minHeight: '297mm', position: 'relative' }} 
    >
      {/* Header Section */}
      <div className="flex items-center justify-between pb-5 mb-8 border-b-2 border-[#D4AF37]">
        <img src={logoImg} alt="Varahi Astro Logo" className="w-[65px] h-[65px] object-contain" />
        <div className="flex flex-col items-end">
          <h1 className="text-3xl text-[#0B1221] font-bold tracking-widest uppercase">Varahi Astro</h1>
          <p className="text-[11px] text-[#D4AF37] font-medium tracking-widest uppercase mt-1">Journey Manifest</p>
        </div>
      </div>

      {/* Trip Summary Section */}
      <div className="mb-6">
        <h2 className="text-sm text-[#0B1221] font-bold mb-3 mt-2 uppercase tracking-wide border-b border-gray-100 pb-1">Trip Summary</h2>
        <div className="flex flex-col">
          <Row label="Origin:" value={source} />
          <Row label="Destination:" value={destination} alt />
          {stops && stops.length > 0 && stops[0] !== '' && (
            <Row label="Via Stops:" value={stops.filter(Boolean).join(', ')} />
          )}
          <Row label="Trip Type:" value={type} alt={stops && stops.length > 0 && stops[0] !== ''} />
          <div className="h-[1px] bg-gray-200 my-1 w-full" />
          <Row label="Departure Date:" value={formatDate(dates?.start)} />
          {type !== 'One-way' && (
            <Row label="Return Date:" value={formatDate(dates?.end)} />
          )}
          <Row label="Passengers:" value={passengers || 1} />
          <div className="h-[1px] bg-gray-200 my-1 w-full" />
          <Row label="Estimated Driving Distance:" value={`${distance} km`} />
          <Row label="Estimated Duration:" value={duration} />
          <Row label="Trip Duration:" value={`${tripData?.days || 1} Days`} />
        </div>
      </div>

      {/* Vehicle & Cost Breakdown Section */}
      <div className="mb-6">
        <h2 className="text-sm text-[#0B1221] font-bold mb-3 mt-2 uppercase tracking-wide border-b border-gray-100 pb-1">Cost Breakdown</h2>
        <div className="flex flex-col">
          <Row label="Vehicle Model:" value={vehicle?.name} />
          <Row label="Rate Per Km:" value={`₹${vehicle?.rate || 0}`} alt />
          
          {billableDistance > distance && (
            <Row label="Billable Minimum Distance:" value={`${billableDistance} km`} />
          )}

          <div className="h-[1px] bg-gray-200 my-2 w-full" />

          <Row label="Base Fare:" value={`₹${baseFare?.toLocaleString() || 0}`} alt />
          <Row label="Driver Allowance:" value={`₹${driverCost?.toLocaleString() || 0}`} />
          {nightCost > 0 && (
            <Row label="Night Halt Charges:" value={`₹${nightCost?.toLocaleString() || 0}`} alt />
          )}
          <Row label="Estimated Tolls:" value={`₹${tolls?.toLocaleString() || 0}`} alt={nightCost <= 0} />

          {/* Extra Charges */}
          {(tripAssistance > 0 || templeFees > 0 || stateEntry > 0 || otherCharges > 0) && (
            <div className="h-[1px] bg-gray-200 my-2 w-full" />
          )}
          
          {tripAssistance > 0 && <Row label="Trip Assistance Fee:" value={`₹${tripAssistance?.toLocaleString()}`} />}
          {stateEntry > 0 && <Row label="State Entry Tax:" value={`₹${stateEntry?.toLocaleString()}`} />}
          {templeFees > 0 && <Row label="Temple Fees:" value={`₹${templeFees?.toLocaleString()}`} />}
          {otherCharges > 0 && <Row label="Miscellaneous Charges:" value={`₹${otherCharges?.toLocaleString()}`} />}

          {/* New section costs */}
          {(mealsCost > 0 || parkingCost > 0 || hotelCost > 0 || pariharamCost > 0 || homamCost > 0) && (
            <div className="h-[1px] bg-gray-200 my-2 w-full" />
          )}
          {mealsCost > 0 && <Row label="Food & Meals:" value={`₹${mealsCost?.toLocaleString()}`} />}
          {parkingCost > 0 && <Row label="Parking Charges:" value={`₹${parkingCost?.toLocaleString()}`} />}
          {hotelCost > 0 && <Row label="Hotel Stay:" value={`₹${hotelCost?.toLocaleString()}`} />}
          {pariharamCost > 0 && <Row label="Pariharam Arrangement:" value={`₹${pariharamCost?.toLocaleString()}`} />}
          {homamCost > 0 && <Row label="Homam (Total):" value={`₹${homamCost?.toLocaleString()}`} />}

          {/* Total Row */}
          <div className="flex justify-between items-center mt-4 py-3 px-4 bg-[#Fdfcf5] rounded-md border border-[#D4AF37]">
            <span className="text-sm text-[#0B1221] font-bold uppercase">Total Estimated Cost:</span>
            <span className="text-lg text-[#D4AF37] font-bold">₹{total?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>

      {/* Food & Meals Section */}
      {hasMeals && (
        <div className="mb-6">
          <h2 className="text-sm text-[#0B1221] font-bold mb-3 mt-2 uppercase tracking-wide border-b border-gray-100 pb-1">Food & Meals</h2>
          <div className="flex flex-col">
            {meals.breakfast?.description && <Row label="Breakfast:" value={`${meals.breakfast.description}${meals.breakfast.cost ? ` — ₹${parseFloat(meals.breakfast.cost).toLocaleString()}` : ''}`} />}
            {meals.lunch?.description && <Row label="Lunch:" value={`${meals.lunch.description}${meals.lunch.cost ? ` — ₹${parseFloat(meals.lunch.cost).toLocaleString()}` : ''}`} alt />}
            {meals.dinner?.description && <Row label="Dinner:" value={`${meals.dinner.description}${meals.dinner.cost ? ` — ₹${parseFloat(meals.dinner.cost).toLocaleString()}` : ''}`} />}
          </div>
        </div>
      )}

      {/* Parking Section */}
      {hasParking && (
        <div className="mb-6">
          <h2 className="text-sm text-[#0B1221] font-bold mb-3 mt-2 uppercase tracking-wide border-b border-gray-100 pb-1">Parking Charges</h2>
          <div className="flex flex-col">
            {parking.description && <Row label="Location:" value={parking.description} />}
            {parking.charges && <Row label="Charges:" value={`₹${parseFloat(parking.charges).toLocaleString()}`} alt />}
          </div>
        </div>
      )}

      {/* Hotel Stay Section */}
      {hasHotel && (
        <div className="mb-6">
          <h2 className="text-sm text-[#0B1221] font-bold mb-3 mt-2 uppercase tracking-wide border-b border-gray-100 pb-1">Hotel Stay</h2>
          <div className="flex flex-col">
            {hotel.name && <Row label="Hotel Name:" value={hotel.name} />}
            {hotel.days && <Row label="Number of Days:" value={hotel.days} alt />}
            {hotel.persons && <Row label="Number of Persons:" value={hotel.persons} />}
            {hotel.price && <Row label="Total Amount:" value={`₹${parseFloat(hotel.price).toLocaleString()}`} alt />}
          </div>
        </div>
      )}

      {/* Pariharam Section */}
      {hasPariharam && (
        <div className="mb-6">
          <h2 className="text-sm text-[#0B1221] font-bold mb-3 mt-2 uppercase tracking-wide border-b border-gray-100 pb-1">Pariharam Arrangement</h2>
          <div className="flex flex-col">
            {pariharam.description && <Row label="Type / Description:" value={pariharam.description} />}
            {pariharam.fees && <Row label="Arrangement Fees:" value={`₹${parseFloat(pariharam.fees).toLocaleString()}`} alt />}
          </div>
        </div>
      )}

      {/* Homam Section */}
      {hasHomam && (
        <div className="mb-6">
          <h2 className="text-sm text-[#0B1221] font-bold mb-3 mt-2 uppercase tracking-wide border-b border-gray-100 pb-1">Homam</h2>
          <div className="flex flex-col">
            {homam.type && <Row label="Type of Homam:" value={homam.type} />}
            {homam.cost && <Row label="Cost of Homam:" value={`₹${parseFloat(homam.cost).toLocaleString()}`} alt />}
            {homam.dakshina && <Row label="Homam Dakshina:" value={`₹${parseFloat(homam.dakshina).toLocaleString()}`} />}
          </div>
        </div>
      )}

      {/* Trip Schedule & Timeline Section */}
      {hasTimeline && (
        <div className="mb-6">
          <h2 className="text-sm text-[#0B1221] font-bold mb-3 mt-2 uppercase tracking-wide border-b border-gray-100 pb-1">Trip Schedule & Timeline</h2>
          <div className="flex flex-col">
            {timeline.startTime && <Row label="Trip Start Time:" value={formatTime(timeline.startTime)} />}
            {timeline.refreshmentPlace && <Row label="Refreshment Break — Place:" value={timeline.refreshmentPlace} alt />}
            {timeline.refreshmentTime && <Row label="Refreshment Break — Time:" value={formatTime(timeline.refreshmentTime)} />}
            {timeline.destinationArrival && <Row label="Destination Arrival:" value={formatTime(timeline.destinationArrival)} alt />}
            {timeline.places && timeline.places.length > 0 && (
              <>
                <div className="h-[1px] bg-gray-200 my-1 w-full" />
                <div className="px-2 py-2">
                  <span className="text-xs text-gray-500 font-medium">Spending Hours at Each Place:</span>
                </div>
                {timeline.places.map((p, i) => (
                  p.name && <Row key={i} label={`  • ${p.name}`} value={`${p.hours || 0} hrs`} alt={i % 2 === 1} />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Description / Notes Section */}
      {notes && (
        <div className="mb-6">
          <h2 className="text-sm text-[#0B1221] font-bold mb-3 mt-2 uppercase tracking-wide border-b border-gray-100 pb-1">Notes & Special Instructions</h2>
          <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap px-2">{notes}</p>
        </div>
      )}

      {/* Recommendations */}
      <div className="mb-6">
        <h2 className="text-sm text-[#0B1221] font-bold mb-3 mt-2 uppercase tracking-wide border-b border-gray-100 pb-1">Recommendations & Notes</h2>
        <div className="flex flex-col gap-2 relative">
          <p className="text-[11px] text-gray-600">
            • <strong className="text-[#0B1221]">Suggested Hotel:</strong> Grand Residency (City Center) - Approx ₹3,200/night
          </p>
          <p className="text-[11px] text-gray-600">
            • <strong className="text-[#0B1221]">Suggested Pit Stop:</strong> Highway Food Court - Approx 120km from origin
          </p>
          <p className="text-[10px] text-gray-500 italic mt-3">
            * Ensure to carry your toll receipts if paid manually. Driver allowance does not cover personal expenses.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-[30px] left-[50px] right-[50px] text-center pt-4 border-t border-gray-200">
        <p className="text-[10px] text-gray-500 mb-1 font-medium">VARAHI ASTRO • Premium Spiritual Journeys</p>
        <p className="text-[10px] text-gray-400 mb-1">For inquiries & support: contact@varahiastro.com | +91 98765 43210</p>
        <p className="text-[10px] text-gray-400">Thank you for choosing Trip Guru for your divine travel needs.</p>
      </div>
    </div>
  );
});

TripManifestPDF.displayName = 'TripManifestPDF';

export default TripManifestPDF;
