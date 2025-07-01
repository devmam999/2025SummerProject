import React, { useState, useRef, useCallback, useMemo } from 'react';
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

// Initial map center (worldwide view)
const initialCenter: google.maps.LatLngLiteral = {
  lat: 37.3355,
  lng: -121.8939
};

const Dashboard: React.FC = () => {
  const API_KEY = import.meta.env.VITE_MAPS_API_KEY;

  if (!API_KEY) {
    console.error("Google Maps API Key is missing! Please set REACT_APP_Maps_API_KEY in your .env file.");
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

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');

  // Autocomplete instance states - These store the actual Autocomplete objects
  const [originAutocomplete, setOriginAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [destinationAutocomplete, setDestinationAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  // We no longer need these refs because Autocomplete directly manages the input's value
  // and we get the final place information from the Autocomplete instance itself.
  // We can remove them, or keep them if you need them for something else (e.g., direct DOM manipulation).
  // For simplicity and direct addressing of the type error, I'm removing direct input refs for value retrieval.
  // If you *must* have direct refs to the inputs (e.g., for `focus()`), then the best practice
  // is to create a separate ref for the *input element itself* and attach it, while Autocomplete also attaches its own.
  // For now, let's simplify to avoid the type error.

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
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

  // When a place is selected, we can get its formatted address directly
  const onOriginPlaceChanged = useCallback(() => {
    if (originAutocomplete) {
      const place = originAutocomplete.getPlace();
      if (place.name) { // Use name or formatted_address
         // The Autocomplete input itself is already updated, so no need to set input.value
         console.log('Origin Place Selected:', place.name || place.formatted_address);
      } else {
        console.log('Origin: No details available for input:', originAutocomplete.getPlace());
      }
    }
  }, [originAutocomplete]);

  const onDestinationPlaceChanged = useCallback(() => {
    if (destinationAutocomplete) {
      const place = destinationAutocomplete.getPlace();
      if (place.name) {
        console.log('Destination Place Selected:', place.name || place.formatted_address);
      } else {
        console.log('Destination: No details available for input:', destinationAutocomplete.getPlace());
      }
    }
  }, [destinationAutocomplete]);


  // Function to calculate and display the route
  const calculateRoute = async () => {
    if (!isLoaded || !window.google || !window.google.maps || !window.google.maps.DirectionsService) {
      alert("Map services are not ready yet. Please wait a moment and try again.");
      console.error("Attempted to calculateRoute before Google Maps API was fully loaded.");
      return;
    }

    let originValue = '';
    let destinationValue = '';

    // Get the place details from the Autocomplete instances
    if (originAutocomplete && originAutocomplete.getPlace() && (originAutocomplete.getPlace().name || originAutocomplete.getPlace().formatted_address)) {
        originValue = originAutocomplete.getPlace().formatted_address || originAutocomplete.getPlace().name || '';
    } else {
        // Fallback: If no place selected, or place has no address, try to use current input value directly
        // This is where a direct ref to the input would be useful, if Autocomplete doesn't clear on invalid entry.
        // For now, if getPlace() fails, we assume input is not valid
        alert('Please select a valid origin from the suggestions.');
        return;
    }

    if (destinationAutocomplete && destinationAutocomplete.getPlace() && (destinationAutocomplete.getPlace().name || destinationAutocomplete.getPlace().formatted_address)) {
        destinationValue = destinationAutocomplete.getPlace().formatted_address || destinationAutocomplete.getPlace().name || '';
    } else {
        alert('Please select a valid destination from the suggestions.');
        return;
    }

    if (originValue === '' || destinationValue === '') {
      alert('Please ensure both a start and an end point are selected from the suggestions.');
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        origin: originValue,
        destination: destinationValue,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirectionsResponse(results);
      setDistance(results.routes[0].legs[0].distance?.text || '');
      setDuration(results.routes[0].legs[0].duration?.text || '');
    } catch (error) {
      console.error('Error fetching directions:', error);
      setDirectionsResponse(null);
      setDistance('');
      setDuration('');
      alert('Could not find directions. Please check your inputs and ensure they are valid locations.');
    }
  };

  // Function to clear the route and inputs
  const clearRoute = () => {
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');
    // To clear the Autocomplete inputs, you typically need to set their value.
    // Since Autocomplete controls the input, you might need to grab the direct DOM element.
    // Or, a simpler way is to re-render the Autocomplete component with an empty value,
    // but that's more complex. For now, we'll try to directly manipulate the input.
    // If you need direct input refs for clearing, re-introduce them but be careful with Autocomplete.
    // For now, let's assume Autocomplete implicitly clears its input when no place is selected or if you hit backspace.
    // A more robust way would be to set a state for the input value and pass it as a `value` prop to the input.

    // A common workaround for clearing Autocomplete inputs:
    if (originAutocomplete) {
        originAutocomplete.set('place', null); // This effectively clears the selection
        // You might still need to manually clear the input's text value if set('place', null) doesn't visually clear it.
        // The Autocomplete component doesn't expose a direct `clear()` method for the input itself readily.
    }
    if (destinationAutocomplete) {
        destinationAutocomplete.set('place', null);
    }
    // As a fallback/alternative for visual clearing, you might still need to directly manipulate the input.
    // If you add inputRef back for this purpose, just don't pass it to Autocomplete as `ref`.
    // Let's re-introduce the refs, but rename them to emphasize they are for the input element, not Autocomplete object.
    if (document.getElementById('start-point')) {
        (document.getElementById('start-point') as HTMLInputElement).value = '';
    }
    if (document.getElementById('end-point')) {
        (document.getElementById('end-point') as HTMLInputElement).value = '';
    }

  };

  const mapOptions: MapOptions = useMemo(() => {
    if (!isLoaded) return { zoom: 2, center: initialCenter };

    return {
      zoom: 2,
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
              id="start-point"
              // Removed 'ref={originInputRef}' here
              placeholder="Type a starting point"
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
              id="end-point"
              // Removed 'ref={destinationInputRef}' here
              placeholder="Type a destination"
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