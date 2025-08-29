import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Autocomplete, Marker, Polyline } from '@react-google-maps/api';
import { auth } from '../firebase';

// Map options interface
interface MapOptions {
  zoom: number;
  center: google.maps.LatLngLiteral;
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  mapTypeControl?: boolean;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
  mapTypeControlOptions?: google.maps.MapTypeControlOptions;
  zoomControlOptions?: google.maps.ZoomControlOptions;
}

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places", "geometry"];
const initialCenter: google.maps.LatLngLiteral = { lat: 37.3355, lng: -121.8939 };

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const API_KEY = import.meta.env.VITE_MAPS_API_KEY || "AIzaSyDpdUDwmjrjTEDrvVCPHjeKIQ4WPKkhqiA";

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY,
    libraries: libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [originAutocomplete, setOriginAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [destinationAutocomplete, setDestinationAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [originPlaceResult, setOriginPlaceResult] = useState<google.maps.places.PlaceResult | null>(null);
  const [destinationPlaceResult, setDestinationPlaceResult] = useState<google.maps.places.PlaceResult | null>(null);

  // Enriched route state (from backend)
  const [enrichedPolyline, setEnrichedPolyline] = useState<string | null>(null);
  const [decodedPath, setDecodedPath] = useState<google.maps.LatLngLiteral[] | null>(null);
  const [suggestedStops, setSuggestedStops] = useState<Array<{ placeId: string; name: string; location: { lat: number; lng: number }; category: string; rating?: number; priceLevel?: number }>>([]);

  // Refinement
  const [feedback, setFeedback] = useState('');

  // UX state
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingRefine, setLoadingRefine] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mapExpanded, setMapExpanded] = useState(false); // toggle map size

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    mapInstance.setCenter(initialCenter);
    mapInstance.setZoom(10);
  }, []);

  const onUnmount = useCallback(() => setMap(null), []);
  const onOriginLoad = useCallback((ac: google.maps.places.Autocomplete) => setOriginAutocomplete(ac), []);
  const onDestinationLoad = useCallback((ac: google.maps.places.Autocomplete) => setDestinationAutocomplete(ac), []);
  const onOriginPlaceChanged = useCallback(() => {
    if (originAutocomplete) {
      const place = originAutocomplete.getPlace();
      setOriginPlaceResult(place);
    }
  }, [originAutocomplete]);
  const onDestinationPlaceChanged = useCallback(() => {
    if (destinationAutocomplete) {
      const place = destinationAutocomplete.getPlace();
      setDestinationPlaceResult(place);
    }
  }, [destinationAutocomplete]);

  const calculateRoute = async () => {
    if (!isLoaded || !window.google?.maps?.DirectionsService) return;
    if (!originPlaceResult?.place_id || !destinationPlaceResult?.place_id) {
      alert('Select valid origin and destination.');
      return;
    }
    const directionsService = new google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        origin: { placeId: originPlaceResult.place_id },
        destination: { placeId: destinationPlaceResult.place_id },
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirectionsResponse(results);
      setDistance(results.routes[0].legs[0].distance?.text || '');
      setDuration(results.routes[0].legs[0].duration?.text || '');
      if (map && results.routes[0].bounds) map.fitBounds(results.routes[0].bounds);

      // After route is selected, request suggestions from backend
      await requestSuggestions();
    } catch (error) {
      console.error('Directions error:', error);
      alert('Could not find directions.');
      setDirectionsResponse(null);
      setDistance('');
      setDuration('');
    }
  };

  const clearRoute = () => {
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');
    setOriginPlaceResult(null);
    setDestinationPlaceResult(null);
    setEnrichedPolyline(null);
    setDecodedPath(null);
    setSuggestedStops([]);
    setFeedback('');
    setError(null);
    const originInput = document.getElementById('start-point') as HTMLInputElement;
    if (originInput) originInput.value = '';
    const destInput = document.getElementById('end-point') as HTMLInputElement;
    if (destInput) destInput.value = '';
    if (map) {
      map.setCenter(initialCenter);
      map.setZoom(10);
    }
  };

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  const buildRoutePayload = () => {
    const o = originPlaceResult?.geometry?.location?.toJSON();
    const d = destinationPlaceResult?.geometry?.location?.toJSON();
    if (!o || !d) return null;
    return { origin: o, destination: d };
  };

  const decodePolyline = (encoded: string) => {
    const points = window.google?.maps?.geometry?.encoding?.decodePath(encoded) || [];
    const path = points.map((p: google.maps.LatLng) => ({ lat: p.lat(), lng: p.lng() }));
    return path as google.maps.LatLngLiteral[];
  };

  const requestSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      setError(null);
      const route = buildRoutePayload();
      if (!route) {
        setError('Invalid route');
        return;
      }
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        navigate('/signin');
        return;
      }
      const resp = await fetch(`${backendUrl}/api/routes/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ route }),
      });
      if (!resp.ok) throw new Error('Failed to get suggestions');
      const data = await resp.json();
      setEnrichedPolyline(data.polyline || null);
      const path = data.polyline ? decodePolyline(data.polyline) : null;
      setDecodedPath(path);
      setSuggestedStops(Array.isArray(data.stops) ? data.stops : []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Suggestion request failed');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const submitRefinement = async () => {
    try {
      setLoadingRefine(true);
      setError(null);
      const route = buildRoutePayload();
      if (!route || !feedback.trim()) return;
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        navigate('/signin');
        return;
      }
      const resp = await fetch(`${backendUrl}/api/routes/refine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ route, feedback, previousStops: suggestedStops }),
      });
      if (!resp.ok) throw new Error('Failed to refine');
      const data = await resp.json();
      setEnrichedPolyline(data.polyline || null);
      const path = data.polyline ? decodePolyline(data.polyline) : null;
      setDecodedPath(path);
      setSuggestedStops(Array.isArray(data.stops) ? data.stops : []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Refine request failed');
    } finally {
      setLoadingRefine(false);
    }
  };

  const mapOptions: MapOptions = useMemo(() => ({
    zoom: 10,
    center: initialCenter,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControlOptions: { position: window.google?.maps?.ControlPosition.LEFT_BOTTOM },
    zoomControlOptions: { position: window.google?.maps?.ControlPosition.LEFT_BOTTOM },
  }), []);

  if (!API_KEY) return <div>Error: Maps API Key missing.</div>;
  if (loadError) return <div>Error loading maps: {loadError.message}</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="relative w-screen h-screen flex flex-col items-center">
      {/* Top bar */}
      <div className="absolute top-0 left-0 m-4 z-20">
        <button
          onClick={() => navigate('/settings')}
          className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700"
        >
          Settings
        </button>
        <button
          onClick={() => setMapExpanded(!mapExpanded)}
          className="ml-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500"
        >
          {mapExpanded ? 'Shrink Map' : 'Expand Map'}
        </button>
      </div>

      {/* Map container */}
      <div
        className={`transition-all duration-300 mt-12 rounded-lg overflow-hidden shadow-md`}
        style={{
          width: mapExpanded ? '90vw' : '50vw',
          height: mapExpanded ? '80vh' : '40vh',
        }}
      >
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={mapOptions}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{ polylineOptions: { strokeColor: '#3B82F6', strokeOpacity: 0.8, strokeWeight: 6 } }}
            />
          )}
          {decodedPath && (
            <Polyline path={decodedPath} options={{ strokeColor: '#16A34A', strokeOpacity: 0.9, strokeWeight: 4 }} />
          )}
          {suggestedStops.map((s) => (
            <Marker
              key={s.placeId}
              position={s.location}
              title={`${s.name} (${s.category})`}
              icon={{
                url:
                  s.category === 'gas_station'
                    ? 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                    : s.category === 'lodging'
                    ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              }}
            />)
          )}
        </GoogleMap>
      </div>

      {/* Directions panel */}
      <div className="mt-4 w-80 bg-white p-3 rounded-lg shadow-md">
        <div className="mb-2">
          <label htmlFor="start-point" className="text-xs font-bold">Start:</label>
          <Autocomplete onLoad={onOriginLoad} onPlaceChanged={onOriginPlaceChanged}>
            <input
              type="text"
              id="start-point"
              placeholder="Enter start"
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </Autocomplete>
        </div>
        <div className="mb-2">
          <label htmlFor="end-point" className="text-xs font-bold">End:</label>
          <Autocomplete onLoad={onDestinationLoad} onPlaceChanged={onDestinationPlaceChanged}>
            <input
              type="text"
              id="end-point"
              placeholder="Enter destination"
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </Autocomplete>
        </div>
        <div className="flex space-x-2">
          <button onClick={calculateRoute} className="bg-blue-600 text-white px-2 py-1 rounded text-xs flex-grow">Get Route</button>
          <button onClick={clearRoute} className="bg-red-500 text-white px-2 py-1 rounded text-xs flex-grow">Clear</button>
        </div>

        {distance && duration && (
          <div className="mt-2 text-xs">
            <p><strong>Distance:</strong> {distance}</p>
            <p><strong>Duration:</strong> {duration}</p>
          </div>
        )}

        {/* Loading & error */}
        {loadingSuggestions && <div className="mt-2 text-xs text-gray-600">Loading suggestions...</div>}
        {loadingRefine && <div className="mt-1 text-xs text-gray-600">Refining...</div>}
        {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
      </div>

      {/* Refinement box */}
      <div className="mt-2 w-80 bg-white p-3 rounded-lg shadow-md">
        <label htmlFor="refine" className="text-xs font-bold">Refine suggestions</label>
        <input
          id="refine"
          type="text"
          placeholder="e.g., Add one more hotel, too expensive, prefer coffee"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full border rounded px-2 py-1 text-xs mb-2"
        />
        <button
          onClick={submitRefinement}
          disabled={!feedback.trim() || loadingRefine}
          className="bg-green-600 disabled:opacity-50 text-white px-2 py-1 rounded text-xs w-full"
        >
          Submit refinement
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
