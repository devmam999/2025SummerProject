import axios from 'axios';

type LatLng = { lat: number; lng: number };

export interface SuggestedStop {
  placeId: string;
  name: string;
  location: LatLng;
  category: string;
  rating?: number;
  priceLevel?: number;
}

interface Preferences {
  budget?: 'low' | 'medium' | 'high';
  avoidTolls?: boolean;
  cuisine?: string[];
  minRating?: number;
}

interface RoutePayload {
  origin: LatLng;
  destination: LatLng;
  waypoints?: LatLng[];
}

const PLACES_API = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const DIRECTIONS_API = 'https://maps.googleapis.com/maps/api/directions/json';

function toStringLatLng(p: LatLng): string {
  return `${p.lat},${p.lng}`;
}

function rankStops(stops: SuggestedStop[], preferences: Preferences): SuggestedStop[] {
  const minRating = preferences.minRating ?? 3.5;
  const scored = stops
    .filter(s => (s.rating ?? 0) >= minRating)
    .map(s => {
      let score = (s.rating ?? 0);
      if (preferences.budget === 'low' && (s.priceLevel ?? 0) <= 2) score += 0.5;
      if (preferences.budget === 'high' && (s.priceLevel ?? 0) >= 3) score += 0.5;
      if (preferences.cuisine && preferences.cuisine.length) {
        const matched = preferences.cuisine.some(c => s.name.toLowerCase().includes(c.toLowerCase()));
        if (matched) score += 0.3;
      }
      return { stop: s, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(x => x.stop);
  return scored.slice(0, 20);
}

export async function querySuggestedStops(
  route: RoutePayload,
  categories: string[],
  preferences: Preferences,
): Promise<SuggestedStop[]> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY not set');

  const samplePoints: LatLng[] = [route.origin, ...(route.waypoints || []), route.destination];
  const radius = 15000; // 15km around each sample point along route

  const results: SuggestedStop[] = [];

  for (const p of samplePoints) {
    for (const type of categories) {
      const url = `${PLACES_API}?key=${key}&location=${toStringLatLng(p)}&radius=${radius}&type=${encodeURIComponent(type)}`;
      const { data } = await axios.get(url);
      const places = (data.results || []) as any[];
      for (const place of places) {
        results.push({
          placeId: place.place_id,
          name: place.name,
          location: { lat: place.geometry.location.lat, lng: place.geometry.location.lng },
          category: type,
          rating: place.rating,
          priceLevel: place.price_level,
        });
      }
    }
  }

  // Deduplicate by placeId
  const unique = new Map<string, SuggestedStop>();
  for (const r of results) {
    if (!unique.has(r.placeId)) unique.set(r.placeId, r);
  }

  const ranked = rankStops(Array.from(unique.values()), preferences);
  return ranked;
}

export async function enrichRouteWithPolyline(route: RoutePayload, _stops: SuggestedStop[]) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY not set');

  const origin = toStringLatLng(route.origin);
  const destination = toStringLatLng(route.destination);
  const waypoints = (route.waypoints || []).map(toStringLatLng).join('|');
  const url = `${DIRECTIONS_API}?key=${key}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''}`;
  const { data } = await axios.get(url);
  const overviewPolyline = data?.routes?.[0]?.overview_polyline?.points;

  return {
    polyline: overviewPolyline,
    stops: _stops,
  };
}



