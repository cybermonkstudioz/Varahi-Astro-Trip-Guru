import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Calendar, Users, Car, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, UtensilsCrossed, ParkingCircle, Hotel, Flame, Clock, FileText } from 'lucide-react';

// Custom autocomplete using Nominatim (free OpenStreetMap geocoding)
const PlacesAutocompleteInput = ({ value, onChange, onCoordinates, placeholder, disabled, className }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchPlaces = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setSuggestions(data);
      setShowDropdown(data.length > 0);
    } catch (err) {
      console.error('Nominatim search error:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    if (onCoordinates) onCoordinates(null); // Clear coords when typing

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPlaces(val), 400);
  };

  const handleSelect = (place) => {
    const displayName = place.display_name.split(',').slice(0, 3).join(',');
    onChange(displayName);
    if (onCoordinates) {
      onCoordinates({ lat: parseFloat(place.lat), lon: parseFloat(place.lon) });
    }
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <div className="relative flex-1" ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        className={className || "w-full bg-[#0B1221] border border-white/5 text-white rounded-lg py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-[#D4AF37]"}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a2744] border border-white/10 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-gray-400 text-xs flex items-center gap-2">
              <div className="w-3 h-3 border border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              Searching...
            </div>
          )}
          {suggestions.map((place, i) => (
            <button
              key={place.place_id || i}
              onClick={() => handleSelect(place)}
              className="w-full text-left px-4 py-3 hover:bg-[#D4AF37]/10 transition-colors border-b border-white/5 last:border-b-0 flex items-start gap-3"
            >
              <MapPin size={14} className="text-[#D4AF37] mt-0.5 shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">{place.display_name.split(',').slice(0, 2).join(',')}</p>
                <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{place.display_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Shared input class
const inputCls = "w-full bg-[#0B1221] border border-white/5 text-white rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-[#D4AF37]";
const inputClsIcon = "w-full bg-[#0B1221] border border-white/5 text-white rounded-lg py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-[#D4AF37]";
const sectionTitle = "text-xs font-semibold text-[#D4AF37] mb-3 uppercase tracking-wider flex items-center gap-2";

const TripForm = ({ tripData, setTripData, onFetchRoute, onGenerateManifest, loading }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const handleNext1 = async () => {
    if (onFetchRoute) {
      const success = await onFetchRoute();
      if (success) setStep(2);
    } else {
      setStep(2);
    }
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const addStop = () => {
    setTripData(prev => ({
      ...prev,
      stops: [...(prev.stops || []), ''],
      stopsCoords: [...(prev.stopsCoords || []), null]
    }));
  };

  const updateStop = (index, value) => {
    const newStops = [...(tripData.stops || [])];
    newStops[index] = value;
    setTripData(prev => ({ ...prev, stops: newStops }));
  };

  const updateStopCoords = (index, coords) => {
    const newStopsCoords = [...(tripData.stopsCoords || [])];
    newStopsCoords[index] = coords;
    setTripData(prev => ({ ...prev, stopsCoords: newStopsCoords }));
  };

  const removeStop = (index) => {
    const newStops = (tripData.stops || []).filter((_, i) => i !== index);
    const newStopsCoords = (tripData.stopsCoords || []).filter((_, i) => i !== index);
    setTripData(prev => ({ ...prev, stops: newStops, stopsCoords: newStopsCoords }));
  };

  // Trip Timeline helpers
  const addTimelinePlace = () => {
    setTripData(prev => ({
      ...prev,
      tripTimeline: {
        ...prev.tripTimeline,
        places: [...(prev.tripTimeline?.places || []), { name: '', hours: '' }]
      }
    }));
  };

  const updateTimelinePlace = (index, field, value) => {
    const newPlaces = [...(tripData.tripTimeline?.places || [])];
    newPlaces[index] = { ...newPlaces[index], [field]: value };
    setTripData(prev => ({
      ...prev,
      tripTimeline: { ...prev.tripTimeline, places: newPlaces }
    }));
  };

  const removeTimelinePlace = (index) => {
    const newPlaces = (tripData.tripTimeline?.places || []).filter((_, i) => i !== index);
    setTripData(prev => ({
      ...prev,
      tripTimeline: { ...prev.tripTimeline, places: newPlaces }
    }));
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8 relative px-2 mt-4">
      <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 z-0"></div>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 h-0.5 bg-[#D4AF37] z-0 transition-all duration-300" style={{ width: `calc(${((step - 1) / (totalSteps - 1)) * 100}% - 16px)` }}></div>

      {Array.from({ length: totalSteps }, (_, i) => i + 1).map(num => (
        <div key={num} className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-all duration-300 ${step >= num ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0B1221]' : 'bg-[#0B1221] border-white/20 text-gray-500'}`}>
          {step > num ? <CheckCircle2 size={16} /> : num}
        </div>
      ))}
    </div>
  );

  // Navigation buttons
  const NavButtons = ({ nextDisabled, isLast }) => (
    <div className="flex gap-3 pt-2 mt-auto">
      {step > 1 && (
        <button onClick={handleBack} className="px-5 py-2.5 bg-[#0B1221] border border-white/10 text-white rounded-lg font-semibold text-sm hover:bg-white/5 transition-colors flex items-center justify-center"><ArrowLeft size={16} /></button>
      )}
      {isLast ? (
        <button
          onClick={onGenerateManifest}
          disabled={loading?.manifest || !tripData.vehicle.name || !tripData.vehicle.rate}
          className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F2CD5C] text-[#0B1221] rounded-lg font-bold text-sm hover:shadow-lg transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading?.manifest ? <span className="animate-pulse">Generating Manifest...</span> : 'Generate Manifest'}
        </button>
      ) : (
        <button onClick={step === 1 ? handleNext1 : handleNext} disabled={nextDisabled} className="flex-1 py-2.5 bg-[#D4AF37] text-[#0B1221] rounded-lg font-semibold text-sm hover:bg-[#F2CD5C] transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
          {step === 1 && loading?.route ? 'Decoding Routes...' : <>Continue <ArrowRight size={16} /></>}
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-[#111C35] rounded-xl border border-white/5 p-6 shrink-0 w-full shadow-lg min-h-[460px] flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Configure Manifest</h3>
        <span className="text-xs font-bold text-[#D4AF37]">Step {step} of {totalSteps}</span>
      </div>

      <StepIndicator />

      <div className="relative flex-1 flex flex-col">
        {/* STEP 1: Route */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in w-full flex flex-col flex-1">
            <div className="flex bg-[#0B1221] p-1 rounded-lg border border-white/5">
              {['One-way', 'Round', 'Multi-city'].map(type => (
                <button
                  key={type}
                  onClick={() => setTripData(prev => ({ ...prev, type, stops: type === 'Multi-city' && (prev.stops || []).length === 0 ? [''] : (prev.stops || []) }))}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${tripData.type === type ? 'bg-[#D4AF37] text-[#0B1221]' : 'text-gray-400 hover:text-white'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2 pb-2">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Source Node</label>
                <div className="relative flex">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                  <PlacesAutocompleteInput
                    value={tripData.source}
                    onChange={(val) => setTripData(prev => ({ ...prev, source: val }))}
                    onCoordinates={(coords) => setTripData(prev => ({ ...prev, sourceCoords: coords }))}
                    placeholder="e.g. New Delhi"
                    disabled={false}
                    className={inputClsIcon}
                  />
                </div>
              </div>

              {tripData.type === 'Multi-city' && (tripData.stops || []).map((stop, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-white/10 ml-4 py-1">
                  <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#D4AF37]/50"></div>
                  <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wide">Stop {i + 1}</label>
                  <div className="flex gap-2 relative">
                    <PlacesAutocompleteInput
                      value={stop}
                      onChange={(val) => updateStop(i, val)}
                      onCoordinates={(coords) => updateStopCoords(i, coords)}
                      placeholder="Intermediate city"
                      disabled={false}
                      className="w-full bg-[#0B1221] border border-white/5 text-white rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button onClick={() => removeStop(i)} className="px-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 shrink-0"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}

              {tripData.type === 'Multi-city' && (
                <button onClick={addStop} className="ml-10 text-xs font-semibold text-[#D4AF37] flex items-center gap-1 hover:text-[#F2CD5C] transition-colors"><Plus size={14} /> Add Another Stop</button>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">{tripData.type === 'Multi-city' ? 'Final Destination' : 'Destination Node'}</label>
                <div className="relative flex">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                  <PlacesAutocompleteInput
                    value={tripData.destination}
                    onChange={(val) => setTripData(prev => ({ ...prev, destination: val }))}
                    onCoordinates={(coords) => setTripData(prev => ({ ...prev, destinationCoords: coords }))}
                    placeholder="e.g. Jaipur"
                    disabled={false}
                    className={inputClsIcon}
                  />
                </div>
              </div>
            </div>

            <NavButtons nextDisabled={!tripData.source || !tripData.destination || !tripData.sourceCoords || !tripData.destinationCoords || loading?.route} />
          </div>
        )}

        {/* STEP 2: Dates & Passengers */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in w-full flex flex-col flex-1">
            <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2">

              <div className="col-span-2 bg-[#0B1221]/80 p-3 rounded-xl border border-[#D4AF37]/30 flex justify-between items-center mb-1">
                <div>
                  <h4 className="text-sm font-bold text-white">Trip Duration</h4>
                  <p className="text-[10px] text-gray-400">Total number of days for the trip</p>
                </div>
                <div className="flex items-center gap-3 bg-[#111C35] rounded-lg border border-white/10 p-1">
                  <button
                    onClick={() => setTripData(prev => ({ ...prev, days: Math.max(1, (parseInt(prev.days) || 1) - 1) }))}
                    className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-md text-white transition-colors"
                  >-</button>
                  <span className="w-8 text-center text-sm font-bold text-[#D4AF37]">{tripData.days || 1}</span>
                  <button
                    onClick={() => setTripData(prev => ({ ...prev, days: (parseInt(prev.days) || 1) + 1 }))}
                    className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-[#D4AF37]/20 rounded-md text-[#D4AF37] transition-colors"
                  >+</button>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Passengers</label>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="number" min="1" max="20" value={tripData.passengers} onChange={e => setTripData({ ...tripData, passengers: e.target.value })} className={inputClsIcon} placeholder="1" />
                </div>
              </div>
              <div className={tripData.type === 'One-way' ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Departure Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="date" value={tripData.dates.start} onChange={e => setTripData({ ...tripData, dates: { ...tripData.dates, start: e.target.value } })} className={`${inputClsIcon} text-gray-300 [color-scheme:dark]`} />
                </div>
              </div>
              {tripData.type !== 'One-way' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Return Date</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="date" value={tripData.dates.end} onChange={e => setTripData({ ...tripData, dates: { ...tripData.dates, end: e.target.value } })} min={tripData.dates.start} className={`${inputClsIcon} text-gray-300 [color-scheme:dark]`} />
                  </div>
                </div>
              )}
            </div>

            <NavButtons nextDisabled={!tripData.dates.start || (tripData.type !== 'One-way' && !tripData.dates.end)} />
          </div>
        )}

        {/* STEP 3: Vehicle & Extra Charges */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in w-full flex flex-col flex-1">
            <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Vehicle Type / Model</label>
                <div className="relative">
                  <Car size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" value={tripData.vehicle.name} onChange={e => setTripData({ ...tripData, vehicle: { ...tripData.vehicle, name: e.target.value } })} className={inputClsIcon} placeholder="e.g. Innova Crysta" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Rate (₹/km)</label>
                <input type="number" value={tripData.vehicle.rate} onChange={e => setTripData({ ...tripData, vehicle: { ...tripData.vehicle, rate: e.target.value } })} className={inputCls} placeholder="e.g. 15" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Min Km/Day</label>
                <input type="number" value={tripData.vehicle.minKm} onChange={e => setTripData({ ...tripData, vehicle: { ...tripData.vehicle, minKm: e.target.value } })} className={inputCls} placeholder="e.g. 250" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Driver Allowance (/day)</label>
                <input type="number" value={tripData.vehicle.driver} onChange={e => setTripData({ ...tripData, vehicle: { ...tripData.vehicle, driver: e.target.value } })} className={inputCls} placeholder="e.g. 500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Night Charge (/night)</label>
                <input type="number" value={tripData.vehicle.night} onChange={e => setTripData({ ...tripData, vehicle: { ...tripData.vehicle, night: e.target.value } })} className={inputCls} placeholder="e.g. 300" />
              </div>

              <div className="col-span-2 mt-1 pt-3 border-t border-white/5">
                <h4 className={sectionTitle}>Extra Trip Charges</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Trip Assist (₹)</label>
                    <input type="number" min="0" value={tripData.extraCharges?.tripAssistance || ''} onChange={e => setTripData({ ...tripData, extraCharges: { ...(tripData.extraCharges || {}), tripAssistance: e.target.value } })} className={inputCls} placeholder="e.g. 500" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">State Entry Tax (₹)</label>
                    <input type="number" min="0" value={tripData.extraCharges?.stateEntry || ''} onChange={e => setTripData({ ...tripData, extraCharges: { ...(tripData.extraCharges || {}), stateEntry: e.target.value } })} className={inputCls} placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Temple Pariharam Fees (₹)</label>
                    <input type="number" min="0" value={tripData.extraCharges?.temple || ''} onChange={e => setTripData({ ...tripData, extraCharges: { ...(tripData.extraCharges || {}), temple: e.target.value } })} className={inputCls} placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Other Misc (₹)</label>
                    <input type="number" min="0" value={tripData.extraCharges?.other || ''} onChange={e => setTripData({ ...tripData, extraCharges: { ...(tripData.extraCharges || {}), other: e.target.value } })} className={inputCls} placeholder="0" />
                  </div>
                </div>
              </div>
            </div>

            <NavButtons />
          </div>
        )}

        {/* STEP 4: Meals, Parking, Hotel Stay */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in w-full flex flex-col flex-1">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2 space-y-5">
              {/* Meals */}
              <div>
                <h4 className={sectionTitle}><UtensilsCrossed size={14} /> Food & Meals</h4>
                <div className="space-y-3">
                  {['breakfast', 'lunch', 'dinner'].map(meal => (
                    <div key={meal} className="grid grid-cols-5 gap-2 items-end">
                      <div className="col-span-3">
                        <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wide">{meal}</label>
                        <input
                          type="text"
                          value={tripData.meals?.[meal]?.description || ''}
                          onChange={e => setTripData(prev => ({ ...prev, meals: { ...prev.meals, [meal]: { ...prev.meals[meal], description: e.target.value } } }))}
                          className={inputCls}
                          placeholder="Location / description"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-medium text-gray-400 mb-1">Cost (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={tripData.meals?.[meal]?.cost || ''}
                          onChange={e => setTripData(prev => ({ ...prev, meals: { ...prev.meals, [meal]: { ...prev.meals[meal], cost: e.target.value } } }))}
                          className={inputCls}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parking */}
              <div className="pt-3 border-t border-white/5">
                <h4 className={sectionTitle}><ParkingCircle size={14} /> Parking Charges</h4>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Location / Description</label>
                    <input
                      type="text"
                      value={tripData.parking?.description || ''}
                      onChange={e => setTripData(prev => ({ ...prev, parking: { ...prev.parking, description: e.target.value } }))}
                      className={inputCls}
                      placeholder="Parking location"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Charges (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={tripData.parking?.charges || ''}
                      onChange={e => setTripData(prev => ({ ...prev, parking: { ...prev.parking, charges: e.target.value } }))}
                      className={inputCls}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Hotel Stay */}
              <div className="pt-3 border-t border-white/5">
                <h4 className={sectionTitle}><Hotel size={14} /> Hotel Stay</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Hotel Name</label>
                    <input
                      type="text"
                      value={tripData.hotel?.name || ''}
                      onChange={e => setTripData(prev => ({ ...prev, hotel: { ...prev.hotel, name: e.target.value } }))}
                      className={inputCls}
                      placeholder="e.g. Grand Residency"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">No. of Days</label>
                    <input
                      type="number"
                      min="0"
                      value={tripData.hotel?.days || ''}
                      onChange={e => setTripData(prev => ({ ...prev, hotel: { ...prev.hotel, days: e.target.value } }))}
                      className={inputCls}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">No. of Persons</label>
                    <input
                      type="number"
                      min="1"
                      value={tripData.hotel?.persons || ''}
                      onChange={e => setTripData(prev => ({ ...prev, hotel: { ...prev.hotel, persons: e.target.value } }))}
                      className={inputCls}
                      placeholder="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Total Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={tripData.hotel?.price || ''}
                      onChange={e => setTripData(prev => ({ ...prev, hotel: { ...prev.hotel, price: e.target.value } }))}
                      className={inputCls}
                      placeholder="e.g. 3200"
                    />
                  </div>
                </div>
              </div>
            </div>

            <NavButtons />
          </div>
        )}

        {/* STEP 5: Pariharam, Homam, Timeline, Notes */}
        {step === 5 && (
          <div className="space-y-4 animate-fade-in w-full flex flex-col flex-1">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2 space-y-5">
              {/* Pariharam */}
              <div>
                <h4 className={sectionTitle}><Flame size={14} /> Pariharam Arrangement</h4>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Type / Description</label>
                    <input
                      type="text"
                      value={tripData.pariharam?.description || ''}
                      onChange={e => setTripData(prev => ({ ...prev, pariharam: { ...prev.pariharam, description: e.target.value } }))}
                      className={inputCls}
                      placeholder="Pariharam type"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Fees (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={tripData.pariharam?.fees || ''}
                      onChange={e => setTripData(prev => ({ ...prev, pariharam: { ...prev.pariharam, fees: e.target.value } }))}
                      className={inputCls}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Homam */}
              <div className="pt-3 border-t border-white/5">
                <h4 className={sectionTitle}><Flame size={14} /> Homam</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Type of Homam</label>
                    <input
                      type="text"
                      value={tripData.homam?.type || ''}
                      onChange={e => setTripData(prev => ({ ...prev, homam: { ...prev.homam, type: e.target.value } }))}
                      className={inputCls}
                      placeholder="e.g. Ganapathi Homam"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Cost (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={tripData.homam?.cost || ''}
                        onChange={e => setTripData(prev => ({ ...prev, homam: { ...prev.homam, cost: e.target.value } }))}
                        className={inputCls}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Dakshina (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={tripData.homam?.dakshina || ''}
                        onChange={e => setTripData(prev => ({ ...prev, homam: { ...prev.homam, dakshina: e.target.value } }))}
                        className={inputCls}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Timeline */}
              <div className="pt-3 border-t border-white/5">
                <h4 className={sectionTitle}><Clock size={14} /> Trip Schedule & Timeline</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Trip Start Time</label>
                      <input
                        type="time"
                        value={tripData.tripTimeline?.startTime || ''}
                        onChange={e => setTripData(prev => ({ ...prev, tripTimeline: { ...prev.tripTimeline, startTime: e.target.value } }))}
                        className={`${inputCls} [color-scheme:dark]`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Destination Arrival</label>
                      <input
                        type="time"
                        value={tripData.tripTimeline?.destinationArrival || ''}
                        onChange={e => setTripData(prev => ({ ...prev, tripTimeline: { ...prev.tripTimeline, destinationArrival: e.target.value } }))}
                        className={`${inputCls} [color-scheme:dark]`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Refreshment Break — Place</label>
                      <input
                        type="text"
                        value={tripData.tripTimeline?.refreshmentPlace || ''}
                        onChange={e => setTripData(prev => ({ ...prev, tripTimeline: { ...prev.tripTimeline, refreshmentPlace: e.target.value } }))}
                        className={inputCls}
                        placeholder="Break location"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Refreshment Break — Time</label>
                      <input
                        type="time"
                        value={tripData.tripTimeline?.refreshmentTime || ''}
                        onChange={e => setTripData(prev => ({ ...prev, tripTimeline: { ...prev.tripTimeline, refreshmentTime: e.target.value } }))}
                        className={`${inputCls} [color-scheme:dark]`}
                      />
                    </div>
                  </div>

                  {/* Dynamic Places List */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Spending Hours at Each Place</label>
                    {(tripData.tripTimeline?.places || []).map((place, i) => (
                      <div key={i} className="flex gap-2 mb-2 items-end">
                        <div className="flex-1">
                          {i === 0 && <label className="block text-[10px] text-gray-500 mb-1">Place Name</label>}
                          <input
                            type="text"
                            value={place.name}
                            onChange={e => updateTimelinePlace(i, 'name', e.target.value)}
                            className={inputCls}
                            placeholder="Place name"
                          />
                        </div>
                        <div className="w-24">
                          {i === 0 && <label className="block text-[10px] text-gray-500 mb-1">Hours</label>}
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={place.hours}
                            onChange={e => updateTimelinePlace(i, 'hours', e.target.value)}
                            className={inputCls}
                            placeholder="0"
                          />
                        </div>
                        <button onClick={() => removeTimelinePlace(i)} className="px-2 py-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 shrink-0"><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button onClick={addTimelinePlace} className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1 hover:text-[#F2CD5C] transition-colors mt-1">
                      <Plus size={14} /> Add Place
                    </button>
                  </div>
                </div>
              </div>

              {/* Description / Notes */}
              <div className="pt-3 border-t border-white/5">
                <h4 className={sectionTitle}><FileText size={14} /> Description / Notes</h4>
                <textarea
                  value={tripData.notes || ''}
                  onChange={e => setTripData(prev => ({ ...prev, notes: e.target.value }))}
                  className={`${inputCls} min-h-[80px] resize-y`}
                  placeholder="Add any special instructions, notes, or additional details about the trip..."
                  rows={3}
                />
              </div>
            </div>

            <NavButtons isLast />
          </div>
        )}
      </div>
    </div>
  );
};

export default TripForm;
