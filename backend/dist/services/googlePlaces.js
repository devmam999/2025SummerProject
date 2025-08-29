"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.querySuggestedStops = querySuggestedStops;
exports.enrichRouteWithPolyline = enrichRouteWithPolyline;
const axios_1 = __importDefault(require("axios"));
const PLACES_API = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const DIRECTIONS_API = 'https://maps.googleapis.com/maps/api/directions/json';
function toStringLatLng(p) {
    return `${p.lat},${p.lng}`;
}
function rankStops(stops, preferences) {
    const minRating = preferences.minRating ?? 3.5;
    const scored = stops
        .filter(s => (s.rating ?? 0) >= minRating)
        .map(s => {
        let score = (s.rating ?? 0);
        if (preferences.budget === 'low' && (s.priceLevel ?? 0) <= 2)
            score += 0.5;
        if (preferences.budget === 'high' && (s.priceLevel ?? 0) >= 3)
            score += 0.5;
        if (preferences.cuisine && preferences.cuisine.length) {
            const matched = preferences.cuisine.some(c => s.name.toLowerCase().includes(c.toLowerCase()));
            if (matched)
                score += 0.3;
        }
        return { stop: s, score };
    })
        .sort((a, b) => b.score - a.score)
        .map(x => x.stop);
    return scored.slice(0, 20);
}
async function querySuggestedStops(route, categories, preferences) {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key)
        throw new Error('GOOGLE_MAPS_API_KEY not set');
    const samplePoints = [route.origin, ...(route.waypoints || []), route.destination];
    const radius = 15000; // 15km around each sample point along route
    const results = [];
    for (const p of samplePoints) {
        for (const type of categories) {
            const url = `${PLACES_API}?key=${key}&location=${toStringLatLng(p)}&radius=${radius}&type=${encodeURIComponent(type)}`;
            const { data } = await axios_1.default.get(url);
            const places = (data.results || []);
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
    const unique = new Map();
    for (const r of results) {
        if (!unique.has(r.placeId))
            unique.set(r.placeId, r);
    }
    const ranked = rankStops(Array.from(unique.values()), preferences);
    return ranked;
}
async function enrichRouteWithPolyline(route, _stops) {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key)
        throw new Error('GOOGLE_MAPS_API_KEY not set');
    const origin = toStringLatLng(route.origin);
    const destination = toStringLatLng(route.destination);
    const waypoints = (route.waypoints || []).map(toStringLatLng).join('|');
    const url = `${DIRECTIONS_API}?key=${key}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''}`;
    const { data } = await axios_1.default.get(url);
    const overviewPolyline = data?.routes?.[0]?.overview_polyline?.points;
    return {
        polyline: overviewPolyline,
        stops: _stops,
    };
}
