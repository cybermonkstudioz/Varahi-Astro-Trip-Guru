import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import TripForm from '../../components/trip/TripForm';
import MapDisplay from '../../components/trip/MapDisplay';
import CostPanel from '../../components/trip/CostPanel';
import POIRecommendations from '../../components/trip/POIRecommendations';
import TripManifestPDF from '../../components/trip/TripManifestPDF';
import { Download, Share2, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const libraries = ['marker'];

const TripPlanner = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const manifestRef = React.useRef(null);
  const [tripData, setTripData] = useState({
    type: 'Round',
    source: '',
    sourceCoords: null,
    destination: '',
    destinationCoords: null,
    stops: [],
    stopsCoords: [],
    vehicle: { name: '', rate: '', driver: '', night: '', minKm: '' },
    extraCharges: { tripAssistance: '', temple: '', stateEntry: '', other: '' },
    dates: { start: '', end: '' },
    passengers: 1,
    days: 1,
    meals: { breakfast: { description: '', cost: '' }, lunch: { description: '', cost: '' }, dinner: { description: '', cost: '' } },
    parking: { description: '', charges: '' },
    hotel: { name: '', days: '', persons: '', price: '' },
    pariharam: { description: '', fees: '' },
    homam: { type: '', cost: '', dakshina: '' },
    tripTimeline: { startTime: '', refreshmentPlace: '', refreshmentTime: '', destinationArrival: '', places: [] },
    notes: '',
  });

  const [routeResult, setRouteResult] = useState(null); 
  const [manifestResult, setManifestResult] = useState(null);
  const [loading, setLoading] = useState({ route: false, manifest: false, pdf: false });
  const [error, setError] = useState('');

  // Decode OSRM polyline (polyline6 format)
  const decodePolyline = (encoded) => {
    const points = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;
      points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return points;
  };

  const handleFetchRoute = async () => {
    if (!tripData.sourceCoords || !tripData.destinationCoords) {
      setError("Please ensure both source and destination are correctly selected from the dropdown.");
      return false;
    }

    try {
      setLoading(prev => ({ ...prev, route: true }));
      setError('');
      
      // Build OSRM coordinates string: lon,lat;lon,lat;...
      const coords = [];
      coords.push(`${tripData.sourceCoords.lon},${tripData.sourceCoords.lat}`);
      
      const validStops = (tripData.stopsCoords || []).filter(c => c && c.lat && c.lon);
      validStops.forEach(c => coords.push(`${c.lon},${c.lat}`));
      
      coords.push(`${tripData.destinationCoords.lon},${tripData.destinationCoords.lat}`);

      const url = `https://router.project-osrm.org/route/v1/driving/${coords.join(';')}?overview=full&geometries=polyline&steps=true`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        setError("Failed to fetch route. OSRM returned: " + (data.message || data.code));
        setRouteResult(null);
        setLoading(prev => ({ ...prev, route: false }));
        return false;
      }

      const route = data.routes[0];
      const distanceKm = Number((route.distance / 1000).toFixed(2));
      const durationMinutes = Math.round(route.duration / 60);

      let durStr = `${Math.floor(durationMinutes/60)} h ${durationMinutes%60} m`;
      if (tripData.type === 'Round') durStr = `(One Way) ${durStr}`;

      let actualDistance = distanceKm;
      if (tripData.type === 'Round') actualDistance *= 2;

      const suggestedDays = Math.max(1, Math.ceil(actualDistance / 250));
      setTripData(prev => ({ ...prev, days: suggestedDays }));

      // Decode the polyline geometry for map display
      const routePath = decodePolyline(route.geometry);

      setRouteResult({
        routePath: routePath,
        distance: distanceKm,
        duration: durationMinutes,
        durationStr: durStr,
        origin: { lat: tripData.sourceCoords.lat, lng: tripData.sourceCoords.lon },
        destination: { lat: tripData.destinationCoords.lat, lng: tripData.destinationCoords.lon },
        waypoints: validStops.map(c => ({ lat: c.lat, lng: c.lon })),
      });
      setManifestResult(null);
      setLoading(prev => ({ ...prev, route: false }));
      return true;
      
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to calculate route data.");
      setRouteResult(null);
      setLoading(prev => ({ ...prev, route: false }));
      return false;
    }
  };

  const calculateManifest = useCallback((routeInfo, data) => {
    if (!routeInfo || !data.vehicle.rate) return null;
    
    let days = parseInt(data.days) || 1;
    if (days < 1) days = 1;

    let actualDistance = routeInfo.distance;
    if (data.type === 'Round') {
      actualDistance *= 2;
    }

    const minDailyKm = parseInt(data.vehicle.minKm) || 0;
    const minTotalKmLimit = minDailyKm * days;
    const billableDistance = Math.max(actualDistance, minTotalKmLimit);

    const vRate = parseFloat(data.vehicle.rate) || 0;
    const vDriver = parseFloat(data.vehicle.driver) || 0;
    const vNight = parseFloat(data.vehicle.night) || 0;

    const baseFare = billableDistance * vRate;
    const driverCost = days * vDriver;
    const nightCost = (days > 1 ? days - 1 : 0) * vNight;
    const tolls = Math.floor(actualDistance * 1.5); 

    const tripAssistance = parseFloat(data.extraCharges?.tripAssistance) || 0;
    const templeFees = parseFloat(data.extraCharges?.temple) || 0;
    const stateEntry = parseFloat(data.extraCharges?.stateEntry) || 0;
    const otherCharges = parseFloat(data.extraCharges?.other) || 0;

    // New section costs
    const mealsCost = (parseFloat(data.meals?.breakfast?.cost) || 0) + (parseFloat(data.meals?.lunch?.cost) || 0) + (parseFloat(data.meals?.dinner?.cost) || 0);
    const parkingCost = parseFloat(data.parking?.charges) || 0;
    const hotelCost = parseFloat(data.hotel?.price) || 0;
    const pariharamCost = parseFloat(data.pariharam?.fees) || 0;
    const homamCost = (parseFloat(data.homam?.cost) || 0) + (parseFloat(data.homam?.dakshina) || 0);

    return {
      distance: actualDistance,
      billableDistance: billableDistance,
      duration: routeInfo.durationStr,
      tolls: tolls,
      baseFare: baseFare,
      driverCost: driverCost,
      nightCost: nightCost,
      tripAssistance: tripAssistance,
      templeFees: templeFees,
      stateEntry: stateEntry,
      otherCharges: otherCharges,
      mealsCost: mealsCost,
      parkingCost: parkingCost,
      hotelCost: hotelCost,
      pariharamCost: pariharamCost,
      homamCost: homamCost,
      total: baseFare + driverCost + nightCost + tolls + tripAssistance + templeFees + stateEntry + otherCharges + mealsCost + parkingCost + hotelCost + pariharamCost + homamCost
    };
  }, []);

  useEffect(() => {
    if (manifestResult) {
      const newManifest = calculateManifest(routeResult, tripData);
      if (newManifest) {
        setManifestResult(newManifest);
      }
    }
  }, [tripData, routeResult, calculateManifest]);

  const handleGenerateManifest = () => {
    if (!routeResult) {
      setError("Please ensure Route is fully calculated first.");
      return;
    }
    
    setLoading({ ...loading, manifest: true });
    
    setTimeout(() => {
      const newManifest = calculateManifest(routeResult, tripData);
      if (newManifest) {
        setManifestResult(newManifest);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      } else {
        setError("Missing vehicle rate or pricing parameters.");
      }
      setLoading({ ...loading, manifest: false });
    }, 400); 
  };

  const handleExportPDF = async () => {
    if (!manifestRef.current) return;
    
    try {
      setLoading(prev => ({ ...prev, pdf: true }));
      setError('');

      const canvas = await html2canvas(manifestRef.current, {
        scale: 2,
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const dateStr = new Date().toISOString().split('T')[0];
      pdf.save(`Varahi_Trip_${dateStr}.pdf`);
      
    } catch (err) {
      console.error("PDF Generate Error:", err);
      setError("Doc Error: Failed to generate PDF. " + err.message);
    } finally {
      setLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  return (
    <div className="space-y-6 flex flex-col w-full max-w-[1600px] mb-12">
      <div className="shrink-0 mb-2 border-b border-white/5 pb-4 flex justify-between items-end print:border-black/20 print:pb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Journey Itinerary</h1>
          <p className="text-gray-400 mt-1 text-sm">Calculated manifest and intelligence itinerary.</p>
        </div>
        {manifestResult && (
           <div className="flex items-center gap-3">
             <button
               onClick={handleExportPDF}
               disabled={loading.pdf}
               className={`bg-[#111C35] border border-white/10 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-white/5 transition-colors flex items-center gap-2 ${loading.pdf ? 'opacity-70 cursor-not-allowed' : ''}`}
             >
               {loading.pdf ? <span className="animate-pulse">Generating PDF...</span> : <><Download size={16} /> Export PDF</>}
             </button>
             <button onClick={() => alert('Link copied to clipboard!')} className="bg-[#D4AF37] text-[#0B1221] px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#F2CD5C] transition-colors flex items-center gap-2">
               <Share2 size={16} /> Share
             </button>
           </div>
        )}
      </div>

      {/* Hidden PDF Content */}
      <div className="absolute top-[-10000px] left-[-10000px] pointer-events-none">
         <TripManifestPDF ref={manifestRef} tripData={tripData} manifestResult={manifestResult} />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 mt-4">
        {/* Left Column Layout */}
        <div className="lg:w-[400px] shrink-0 flex flex-col gap-6">
          <TripForm 
             tripData={tripData} 
             setTripData={setTripData} 
             onFetchRoute={handleFetchRoute}
             onGenerateManifest={handleGenerateManifest} 
             loading={loading}
          />
          {manifestResult && <CostPanel mapResult={manifestResult} tripData={tripData} />}
        </div>

        {/* Right Column Layout */}
        <div className="flex-1 bg-[#111C35] rounded-xl border border-white/5 overflow-hidden shadow-lg min-h-[500px] lg:h-[calc(100vh-250px)]">
           <MapDisplay mapResult={routeResult} tripData={tripData} isLoaded={isLoaded} />
        </div>
      </div>
      
      {/* Route Intelligence POI Recommendations */}
      {manifestResult && <POIRecommendations tripData={tripData} mapResult={manifestResult} />}
    </div>
  );
};

export default TripPlanner;
