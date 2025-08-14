import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';

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

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];
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
    const originInput = document.getElementById('start-point') as HTMLInputElement;
    if (originInput) originInput.value = '';
    const destInput = document.getElementById('end-point') as HTMLInputElement;
    if (destInput) destInput.value = '';
    if (map) {
      map.setCenter(initialCenter);
      map.setZoom(10);
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
      </div>
    </div>
  );
};

export default Dashboard;
