import React, { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';

// Define the shape for the map options
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

// Define the shape for the libraries to load
const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

// Initial map center (San Jose, CA) - good starting point
const initialCenter: google.maps.LatLngLiteral = {
  lat: 37.3355,
  lng: -121.8939
};

const Dashboard: React.FC = () => {
  const API_KEY = import.meta.env.VITE_MAPS_API_KEY;

  if (!API_KEY) {
    console.error("Google Maps API Key is missing! Please set VITE_MAPS_API_KEY in your .env file.");
    return (
      <div className="flex items-center justify-center h-screen bg-red-100 text-red-700">
        <p className="text-lg font-semibold">Error: Google Maps API Key is not configured. Please check your .env file.</p>
      </div>
    );
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY,
    libraries: libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null); // Keep map in state for fitBounds
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');

  // Autocomplete instance states
  const [originAutocomplete, setOriginAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [destinationAutocomplete, setDestinationAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  // NEW: State to store the actual PlaceResult objects for precise routing
  const [originPlaceResult, setOriginPlaceResult] = useState<google.maps.places.PlaceResult | null>(null);
  const [destinationPlaceResult, setDestinationPlaceResult] = useState<google.maps.places.PlaceResult | null>(null);


  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
    // Set initial map view when map is loaded
    if (mapInstance) {
      mapInstance.setCenter(initialCenter);
      mapInstance.setZoom(10); // A good zoom level for a city area
    }
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // Handlers for Autocomplete component load and place selection
  const onOriginLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setOriginAutocomplete(autocomplete);
  }, []);

  const onDestinationLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setDestinationAutocomplete(autocomplete);
  }, []);

  const onOriginPlaceChanged = useCallback(() => {
    if (originAutocomplete) {
      const place = originAutocomplete.getPlace();
      // Store the full place object
      setOriginPlaceResult(place);
      if (place.name) {
        console.log('Origin Place Selected:', place.name || place.formatted_address);
      } else {
        console.log('Origin: No details available for input:', place);
      }
    }
  }, [originAutocomplete]);

  const onDestinationPlaceChanged = useCallback(() => {
    if (destinationAutocomplete) {
      const place = destinationAutocomplete.getPlace();
      // Store the full place object
      setDestinationPlaceResult(place);
      if (place.name) {
        console.log('Destination Place Selected:', place.name || place.formatted_address);
      } else {
        console.log('Destination: No details available for input:', place);
      }
    }
  }, [destinationAutocomplete]);


  const calculateRoute = async () => {
    if (!isLoaded || !window.google || !window.google.maps || !window.google.maps.DirectionsService) {
      alert("Map services are not ready yet. Please wait a moment and try again.");
      console.error("Attempted to calculateRoute before Google Maps API was fully loaded.");
      return;
    }

    // NEW: Use the stored PlaceResult objects for routing
    if (!originPlaceResult || !originPlaceResult.place_id) {
        alert('Please select a valid origin from the suggestions.');
        return;
    }
    if (!destinationPlaceResult || !destinationPlaceResult.place_id) {
        alert('Please select a valid destination from the suggestions.');
        return;
    }

    const directionsService = new google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        // Pass the place_id directly for precise routing!
        origin: { placeId: originPlaceResult.place_id },
        destination: { placeId: destinationPlaceResult.place_id },
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirectionsResponse(results);
      setDistance(results.routes[0].legs[0].distance?.text || '');
      setDuration(results.routes[0].legs[0].duration?.text || '');

      // Fit map to bounds of the route
      if (map && results.routes[0].bounds) {
        map.fitBounds(results.routes[0].bounds);
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      setDirectionsResponse(null);
      setDistance('');
      setDuration('');
      alert('Could not find directions. Please check your inputs and ensure they are valid locations.');
    }
  };

  const clearRoute = () => {
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');

    // Clear the Autocomplete instances and their associated PlaceResult states
    if (originAutocomplete) {
        originAutocomplete.set('place', null); // Clears Autocomplete's internal place
        const originInput = document.getElementById('start-point') as HTMLInputElement;
        if (originInput) originInput.value = ''; // Manually clear the input text
    }
    setOriginPlaceResult(null); // Clear our stored PlaceResult

    if (destinationAutocomplete) {
        destinationAutocomplete.set('place', null); // Clears Autocomplete's internal place
        const destinationInput = document.getElementById('end-point') as HTMLInputElement;
        if (destinationInput) destinationInput.value = ''; // Manually clear the input text
    }
    setDestinationPlaceResult(null); // Clear our stored PlaceResult

    // Reset map center/zoom after clearing route
    if (map) {
        map.setCenter(initialCenter);
        map.setZoom(10);
    }
  };

  const mapOptions: MapOptions = useMemo(() => {
    if (!isLoaded || !window.google || !window.google.maps) {
      return { zoom: 2, center: initialCenter };
    }

    return {
      zoom: 10,
      center: initialCenter,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControlOptions: {
        position: window.google.maps.ControlPosition.LEFT_BOTTOM,
      },
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.LEFT_BOTTOM,
      }
    };
  }, [isLoaded]);


  if (loadError) return <div>Error loading maps: {loadError.message}</div>;
  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="relative w-screen h-screen">
      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              polylineOptions: {
                strokeColor: '#3B82F6',
                strokeOpacity: 0.8,
                strokeWeight: 6,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Directions Panel - positioned on top-left, now much smaller */}
      <div className="absolute top-4 left-4 z-10 bg-white p-3 rounded-lg shadow-md w-72">
        <h1 className="text-lg font-bold text-center mb-2 text-gray-800">Directions</h1>

        <div className="mb-2">
          <label htmlFor="start-point" className="block text-gray-700 text-xs font-bold mb-1">
            Start:
          </label>
          <Autocomplete onLoad={onOriginLoad} onPlaceChanged={onOriginPlaceChanged}>
            <input
              type="text"
              id="start-point" // Important for document.getElementById later
              placeholder="Enter a start point"
              className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs"
            />
          </Autocomplete>
        </div>

        <div className="mb-3">
          <label htmlFor="end-point" className="block text-gray-700 text-xs font-bold mb-1">
            End:
          </label>
          <Autocomplete onLoad={onDestinationLoad} onPlaceChanged={onDestinationPlaceChanged}>
            <input
              type="text"
              id="end-point" // Important for document.getElementById later
              placeholder="Enter an end point"
              className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs"
            />
          </Autocomplete>
        </div>

        <div className="flex space-x-2 mb-3">
          <button
            onClick={calculateRoute}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs focus:outline-none focus:shadow-outline transition duration-150 ease-in-out flex-grow"
          >
            Get Route
          </button>
          <button
            onClick={clearRoute}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs focus:outline-none focus:shadow-outline transition duration-150 ease-in-out flex-grow"
          >
            Clear
          </button>
        </div>

        {distance && duration && (
          <div className="mt-2 p-2 bg-gray-100 rounded-md text-gray-700 text-xs">
            <p><strong>Distance:</strong> {distance}</p>
            <p><strong>Duration:</strong> {duration}</p>
          </div>
        )}

        {directionsResponse && (
          <div className="mt-3 text-gray-700 text-xs max-h-32 overflow-y-auto">
            <h3 className="font-semibold mb-1 text-sm">Steps:</h3>
            {directionsResponse.routes[0]?.legs[0]?.steps.map((step, index) => (
              <p key={index} className="mb-0.5" dangerouslySetInnerHTML={{ __html: `${index + 1}. ${step.instructions}` }}></p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;