const express = require('express');
const router = express.Router();

const fetchPhoton = async (q) => {
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`
    );
    const data = await res.json();
    return data.features || [];
  } catch (e) {
    console.error('Photon backend fetch failed:', e);
    return [];
  }
};

const fetchOlaAutocomplete = async (q) => {
  try {
    const apiKey = process.env.OLA_MAPS_API_KEY;
    if (!apiKey || apiKey === 'YOUR_OLA_MAPS_API_KEY') {
      return null;
    }
    const res = await fetch(
      `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(q)}&api_key=${apiKey}`
    );
    if (!res.ok) {
      console.warn(`Ola Autocomplete API error status: ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (!data.predictions) {
      console.warn('Ola Autocomplete response missing predictions:', data);
      return null;
    }
    return data.predictions;
  } catch (e) {
    console.error('Ola Autocomplete fetch failed:', e);
    return null;
  }
};

const fetchOlaGeocode = async (address) => {
  try {
    const apiKey = process.env.OLA_MAPS_API_KEY;
    if (!apiKey || apiKey === 'YOUR_OLA_MAPS_API_KEY') {
      return null;
    }
    const res = await fetch(
      `https://api.olamaps.io/places/v1/geocode?address=${encodeURIComponent(address)}&api_key=${apiKey}`
    );
    if (!res.ok) {
      console.warn(`Ola Geocode API error status: ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    } else if (data.geocodingResults) {
      return data.geocodingResults;
    }
    console.warn('Ola Geocode response unrecognized structure:', data);
    return null;
  } catch (e) {
    console.error('Ola Geocode fetch failed:', e);
    return null;
  }
};

const fetchOlaDetails = async (placeId) => {
  try {
    const apiKey = process.env.OLA_MAPS_API_KEY;
    if (!apiKey || apiKey === 'YOUR_OLA_MAPS_API_KEY') {
      return null;
    }
    const res = await fetch(
      `https://api.olamaps.io/places/v1/details?place_id=${encodeURIComponent(placeId)}&api_key=${apiKey}`
    );
    const data = await res.json();
    return data.result || null;
  } catch (e) {
    console.error('Ola Place Details fetch failed:', e);
    return null;
  }
};

const mapPhotonResult = (item) => {
  const p = item.properties;
  const parts = [
    p.name,
    p.street,
    p.district,
    p.city,
    p.state,
    p.postcode
  ].filter(Boolean);
  
  const name = parts.join(', ');
  
  return {
    lat: item.geometry.coordinates[1],
    lon: item.geometry.coordinates[0],
    name: name || 'Unknown Location'
  };
};

// Common Tamil Nadu places and temple keywords to correct spelling/typos fuzzy matches
const TAMIL_NADU_PLACES = [
  // Major Cities / Towns
  "Chennai", "Madurai", "Tiruchirappalli", "Trichy", "Coimbatore", "Salem", "Tirunelveli", "Thanjavur", "Tanjore", 
  "Vellore", "Erode", "Thoothukudi", "Tuticorin", "Dindigul", "Ranipet", "Sivakasi", "Karur", "Ooty", "Udhagamandalam", 
  "Kodaikanal", "Pollachi", "Karaikudi", "Neyveli", "Hosur", "Nagercoil", "Kanchipuram", "Conjeevaram", 
  "Tiruvannamalai", "Thiruvannamalai", "Kumbakonam", "Chidambaram", "Rameswaram", "Rameshwaram", "Nagapattinam", 
  "Velankanni", "Tiruchendur", "Thiruchendur", "Palani", "Pazhani", "Thiruthani", "Tiruttani", "Pazhamudircholai", 
  "Pazhamuthircholai", "Alagar Kovil", "Srirangam", "Chitlapakkam", "Tambaram", "Sanatorium", "Chromepet", 
  "Pallavaram", "Mylapore", "Velachery", "Adyar", "Guindy", "T Nagar", "Saidapet", "Nanganallur", "Chidambaram", 
  "Jambukeswarar", "Thiruvanaikaval", "Srivilliputhur", "Andal", "Suchindram", "Thanumalayan", "Darasuram", 
  "Airavatesvara", "Thirumanancheri", "Vaitheeswaran", "Thirunageswaram", "Alangudi", "Kanjanoor", "Kanjanur", 
  "Tirunallar", "Thirunallar", "Keezhaperumpallam", "Keelaperumpallam", "Suriyanar", "Suryanar", "Tirupati", 
  "Venkateswara", "Gunaseelam", "Samayapuram", "Bannari", "Punnainallur", "Swamimalai", "Swamimali", "Thirupparankundram"
];

const levenshteinDistance = (a, b) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const correctTypos = (q) => {
  if (!q) return q;
  const words = q.split(/([\s,]+)/);
  const correctedWords = words.map(word => {
    if (/^[\s,]+$/.test(word)) return word;
    
    const cleanWord = word.trim().toLowerCase();
    if (cleanWord.length < 4) return word; 

    let bestMatch = word;
    let minDistance = 3; 

    for (const place of TAMIL_NADU_PLACES) {
      const placeLower = place.toLowerCase();
      if (cleanWord === placeLower) return word;

      const dist = levenshteinDistance(cleanWord, placeLower);
      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = place;
      }
    }

    if (minDistance <= 2) {
      return bestMatch;
    }
    return word;
  });

  return correctedWords.join('');
};

const matchCustomLocation = (q) => {
  if (!q) return null;
  const lowerQ = q.toLowerCase();
  if (
    lowerQ.includes('varahi astro') || 
    lowerQ.includes('varahiastro') ||
    (lowerQ.includes('varahi') && lowerQ.includes('astro')) ||
    (lowerQ.includes('jeevan ankur') && lowerQ.includes('tambaram'))
  ) {
    return {
      lat: 12.9381061,
      lon: 80.1345309,
      name: 'Varahi Astro, Flat No 5, Jeevan Ankur, Street Number 2, Kamakoti Nagar, Judge Colony, Tambaram Sanatorium, Chennai, Tamil Nadu 600047, India',
      structured_formatting: {
        main_text: 'Varahi Astro Office',
        secondary_text: 'Tambaram Sanatorium, Chennai, Tamil Nadu'
      }
    };
  }
  return null;
};

const geocodePhoton = async (address) => {
  try {
    const cleanAddress = address.trim();
    if (!cleanAddress) return null;

    // 1. Try original search
    let data = await fetchPhoton(cleanAddress);
    if (data && data.length > 0) return mapPhotonResult(data[0]);

    // 2. Comma progressive cutting from left (drops specific house numbers/details to isolate the suburb)
    if (cleanAddress.includes(',')) {
      const parts = cleanAddress.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length > 2) {
        for (let i = 1; i <= parts.length - 3; i++) {
          const subQuery = parts.slice(i).join(', ');
          data = await fetchPhoton(subQuery);
          if (data && data.length > 0) return mapPhotonResult(data[0]);
        }
      }
    }

    // 3. Comma trimming from right (drops trailing typos like "Tar")
    if (cleanAddress.includes(',')) {
      const parts = cleanAddress.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        const subQuery = parts.slice(0, parts.length - 1).join(', ');
        data = await fetchPhoton(subQuery);
        if (data && data.length > 0) return mapPhotonResult(data[0]);

        // Try searching each segment individually from left to right (skipping country/broad state terms)
        const skipTerms = ['india', 'tamil nadu', 'tamilnadu', 'flat', 'street', 'road', 'near', 'opposite'];
        for (let i = 0; i < parts.length; i++) {
          if (!skipTerms.includes(parts[i].toLowerCase())) {
            data = await fetchPhoton(parts[i]);
            if (data && data.length > 0) return mapPhotonResult(data[0]);
          }
        }
      }
    }

    // 4. Space fallback (no commas)
    const simplified = cleanAddress.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const words = simplified.split(' ');
    if (words.length > 1) {
      // Try stripping the last word
      const queryWithoutLast = words.slice(0, words.length - 1).join(' ');
      if (queryWithoutLast.length >= 3) {
        data = await fetchPhoton(queryWithoutLast);
        if (data && data.length > 0) return mapPhotonResult(data[0]);
      }

      // Try finding the most important word from the beginning
      const ignoreWords = ['street', 'road', 'colony', 'nagar', 'flat', 'house', 'ward', 'zone', 'floor', 'near', 'opposite'];
      for (let i = 0; i < words.length; i++) {
        const word = words[i].toLowerCase();
        if (word.length >= 4 && !ignoreWords.includes(word)) {
          data = await fetchPhoton(words[i]);
          if (data && data.length > 0) return mapPhotonResult(data[0]);
          break; 
        }
      }
    }
  } catch (err) {
    console.error('Photon geocode error:', err);
  }
  return null;
};

// GET /api/geocode?q=...
router.get('/', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  // 1. Check custom locations first
  const custom = matchCustomLocation(q);
  if (custom) {
    return res.json({
      lat: custom.lat,
      lon: custom.lon,
      name: custom.name
    });
  }

  // 2. Try Ola Maps first if key is configured
  const olaResults = await fetchOlaGeocode(q);
  if (olaResults && olaResults.length > 0) {
    const first = olaResults[0];
    const lat = parseFloat(first.lat || first.geometry?.location?.lat);
    const lon = parseFloat(first.lon || first.geometry?.location?.lng);
    const name = first.display_name || first.formatted_address || first.name;
    return res.json({ lat, lon, name });
  }

  // 3. Otherwise run typo correction and geocode via Photon
  const correctedQ = correctTypos(q);
  let result = await geocodePhoton(correctedQ);
  if (!result && correctedQ !== q) {
    result = await geocodePhoton(q);
  }
  res.json(result);
});

// GET /api/geocode/suggest?q=...
router.get('/suggest', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  try {
    let data = [];

    // 1. Check custom location match
    const custom = matchCustomLocation(q);

    // 2. Fetch Ola Autocomplete suggestions if API key is present
    const olaPredictions = await fetchOlaAutocomplete(q);
    if (olaPredictions !== null) {
      let finalSuggestions = [];
      if (custom) {
        finalSuggestions.push({
          place_id: 'custom_varahi_astro',
          description: 'Varahi Astro, Flat No 5, Jeevan Ankur, Street Number 2, Kamakoti Nagar, Judge Colony, Tambaram Sanatorium, Chennai, Tamil Nadu 600047, India',
          structured_formatting: {
            main_text: 'Varahi Astro Office',
            secondary_text: 'Tambaram Sanatorium, Chennai, Tamil Nadu'
          },
          isPhoton: true,
          lat: 12.9381061,
          lon: 80.1345309
        });
      }

      const mappedOla = olaPredictions.map(item => {
        const parts = item.description.split(',').map(s => s.trim()).filter(Boolean);
        return {
          place_id: item.place_id,
          description: item.description,
          structured_formatting: {
            main_text: item.structured_formatting?.main_text || parts[0] || 'Location',
            secondary_text: item.structured_formatting?.secondary_text || parts.slice(1, 3).join(', ') || ''
          },
          isOla: true
        };
      });

      finalSuggestions = finalSuggestions.concat(mappedOla);
      return res.json(finalSuggestions.slice(0, 5));
    }

    // 3. Fallback: Check custom location match
    if (custom) {
      data.push({
        properties: {
          osm_id: 'custom_varahi_astro',
          name: 'Varahi Astro Office',
          street: 'Flat No 5, Jeevan Ankur, Street Number 2, Kamakoti Nagar, Judge Colony',
          district: 'Tambaram Sanatorium',
          city: 'Chennai',
          state: 'Tamil Nadu',
          postcode: '600047'
        },
        geometry: {
          coordinates: [80.1345309, 12.9381061]
        }
      });
    }

    // 4. Fetch Photon suggestions using corrected spelling
    const correctedQ = correctTypos(q);
    let photonData = await fetchPhoton(correctedQ);
    if ((!photonData || photonData.length === 0) && correctedQ !== q) {
      photonData = await fetchPhoton(q);
    }
    
    if (photonData && photonData.length > 0) {
      data = data.concat(photonData);
    }

    // 5. Fallback: Progressive cutting from left (drops specific street details to isolate locality)
    if (data.length === 0 && q.includes(',')) {
      const parts = q.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length > 2) {
        for (let i = 1; i <= parts.length - 3; i++) {
          const subQuery = parts.slice(i).join(', ');
          const correctedSub = correctTypos(subQuery);
          let subData = await fetchPhoton(correctedSub);
          if ((!subData || subData.length === 0) && correctedSub !== subQuery) {
            subData = await fetchPhoton(subQuery);
          }
          if (subData && subData.length > 0) {
            data = data.concat(subData);
            break;
          }
        }
      }
    }

    // 6. Fallback: Progressive cutting from right (drops trailing segments)
    if (data.length === 0 && q.includes(',')) {
      const parts = q.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        const subQuery = parts.slice(0, parts.length - 1).join(', ');
        const correctedSub = correctTypos(subQuery);
        let subData = await fetchPhoton(correctedSub);
        if ((!subData || subData.length === 0) && correctedSub !== subQuery) {
          subData = await fetchPhoton(subQuery);
        }
        if (subData && subData.length > 0) {
          data = data.concat(subData);
        }
      }
    }

    // 7. Fallback: Search individual segments from left to right
    if (data.length === 0 && q.includes(',')) {
      const parts = q.split(',').map(p => p.trim()).filter(Boolean);
      const skipTerms = ['india', 'tamil nadu', 'tamilnadu', 'flat', 'street', 'road', 'near', 'opposite'];
      for (let i = 0; i < parts.length; i++) {
        const cleanPart = parts[i].toLowerCase();
        if (cleanPart.length >= 3 && !skipTerms.includes(cleanPart)) {
          const correctedPart = correctTypos(parts[i]);
          let segmentData = await fetchPhoton(correctedPart);
          if ((!segmentData || segmentData.length === 0) && correctedPart !== parts[i]) {
            segmentData = await fetchPhoton(parts[i]);
          }
          if (segmentData && segmentData.length > 0) {
            data = data.concat(segmentData);
            break;
          }
        }
      }
    }

    // 8. Fallback: Space fallback (no commas)
    if (data.length === 0) {
      const simplified = q.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
      const words = simplified.split(' ');
      if (words.length > 1) {
        const queryWithoutLast = words.slice(0, words.length - 1).join(' ');
        if (queryWithoutLast.length >= 3) {
          const correctedSub = correctTypos(queryWithoutLast);
          let subData = await fetchPhoton(correctedSub);
          if (subData && subData.length > 0) {
            data = data.concat(subData);
          }
        }

        if (data.length === 0) {
          const ignoreWords = ['street', 'road', 'colony', 'nagar', 'flat', 'house', 'ward', 'zone', 'floor', 'near', 'opposite'];
          for (let i = 0; i < words.length; i++) {
            const word = words[i].toLowerCase();
            if (word.length >= 4 && !ignoreWords.includes(word)) {
              const correctedWord = correctTypos(words[i]);
              let wordData = await fetchPhoton(correctedWord);
              if (wordData && wordData.length > 0) {
                data = data.concat(wordData);
                break;
              }
            }
          }
        }
      }
    }

    // Map and de-duplicate results by description/name
    const seen = new Set();
    const mapped = [];

    for (const item of data) {
      const p = item.properties;
      const parts = [
        p.name,
        p.street,
        p.district,
        p.city,
        p.state,
        p.postcode
      ].filter(Boolean);
      const description = parts.join(', ');
      
      if (seen.has(description)) continue;
      seen.add(description);

      mapped.push({
        place_id: p.osm_id || Math.random().toString(),
        description: description,
        structured_formatting: {
          main_text: p.name || parts[0] || 'Location',
          secondary_text: parts.slice(1, 3).join(', ') || p.city || p.state || ''
        },
        isPhoton: true,
        lat: item.geometry.coordinates[1],
        lon: item.geometry.coordinates[0]
      });
    }

    res.json(mapped.slice(0, 5));
  } catch (err) {
    console.error('Suggest endpoint error:', err);
    res.status(500).json({ error: 'Suggestions failed' });
  }
});

// GET /api/geocode/details?place_id=...
router.get('/details', async (req, res) => {
  const { place_id } = req.query;
  if (!place_id) {
    return res.status(400).json({ error: 'Query parameter place_id is required' });
  }

  if (place_id === 'custom_varahi_astro') {
    return res.json({
      lat: 12.9381061,
      lon: 80.1345309,
      name: 'Varahi Astro, Flat No 5, Jeevan Ankur, Street Number 2, Kamakoti Nagar, Judge Colony, Tambaram Sanatorium, Chennai, Tamil Nadu 600047, India'
    });
  }

  const result = await fetchOlaDetails(place_id);
  if (result) {
    const loc = result.geometry?.location;
    return res.json({
      lat: loc?.lat,
      lon: loc?.lng || loc?.lon,
      name: result.formatted_address || result.name
    });
  }

  res.status(404).json({ error: 'Place details not found or Ola Maps key not configured' });
});

module.exports = router;
// Trigger restart to load verified key xuMZRrv4BpxdoYIVW4hVCriQioA1Hn3S7L4j3V2P
