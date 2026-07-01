export const fetchPhoton = async (q) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/geocode/suggest?q=${encodeURIComponent(q)}`
    );
    return await res.json();
  } catch (e) {
    console.error('Proxy suggestions failed:', e);
    return [];
  }
};

export const geocodePhoton = async (address) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/geocode?q=${encodeURIComponent(address)}`
    );
    return await res.json();
  } catch (e) {
    console.error('Proxy geocode failed:', e);
    return null;
  }
};

export const geocodeAddress = (address) => {
  return new Promise(async (resolve) => {
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address, componentRestrictions: { country: 'in' } }, async (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          resolve({ 
            lat: loc.lat(), 
            lon: loc.lng(), 
            name: results[0].formatted_address 
          });
          return;
        }
        console.warn('Google Geocoding failed for address:', address, 'status:', status);
        resolve(await geocodePhoton(address));
      });
    } else {
      resolve(await geocodePhoton(address));
    }
  });
};

export const fetchPlaceDetails = async (placeId) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/geocode/details?place_id=${encodeURIComponent(placeId)}`
    );
    return await res.json();
  } catch (e) {
    console.error('Proxy place details failed:', e);
    return null;
  }
};
