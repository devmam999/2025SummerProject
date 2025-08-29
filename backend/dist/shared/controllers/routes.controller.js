import { z } from 'zod';
import { fetchUserPreferences } from '../services/preferences';
import { querySuggestedStops, enrichRouteWithPolyline } from '../services/googlePlaces';
import { refineQuery } from '../services/refinement';
const waypointSchema = z.object({ lat: z.number(), lng: z.number() });
const routeSchema = z.object({
    origin: waypointSchema,
    destination: waypointSchema,
    waypoints: z.array(waypointSchema).optional(),
});
export const getRouteSuggestions = async (req, res) => {
    try {
        const parse = routeSchema.safeParse(req.body?.route);
        if (!parse.success)
            return res.status(400).json({ error: 'Invalid route payload', details: parse.error.flatten() });
        const userId = req.userId;
        const preferences = await fetchUserPreferences(userId);
        const categories = ['restaurant', 'gas_station', 'lodging'];
        const suggestedStops = await querySuggestedStops(parse.data, categories, preferences);
        const enriched = await enrichRouteWithPolyline(parse.data, suggestedStops);
        return res.json(enriched);
    }
    catch (error) {
        console.error('suggestions error', error);
        return res.status(500).json({ error: 'Failed to generate route suggestions' });
    }
};
const refineSchema = z.object({
    route: routeSchema,
    feedback: z.string().min(1),
    previousStops: z.array(z.object({ placeId: z.string(), lat: z.number(), lng: z.number(), name: z.string().optional(), category: z.string().optional() })).optional(),
});
export const refineRoute = async (req, res) => {
    try {
        const parse = refineSchema.safeParse(req.body);
        if (!parse.success)
            return res.status(400).json({ error: 'Invalid refine payload', details: parse.error.flatten() });
        const userId = req.userId;
        const preferences = await fetchUserPreferences(userId);
        const refinedCategories = refineQuery(parse.data.feedback, preferences);
        const suggestedStops = await querySuggestedStops(parse.data.route, refinedCategories, preferences);
        const enriched = await enrichRouteWithPolyline(parse.data.route, suggestedStops);
        return res.json(enriched);
    }
    catch (error) {
        console.error('refine error', error);
        return res.status(500).json({ error: 'Failed to refine route suggestions' });
    }
};
export default { getRouteSuggestions, refineRoute };
