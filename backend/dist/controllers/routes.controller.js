"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refineRoute = exports.getRouteSuggestions = void 0;
const zod_1 = require("zod");
const preferences_1 = require("../services/preferences");
const googlePlaces_1 = require("../services/googlePlaces");
const refinement_1 = require("../services/refinement");
const waypointSchema = zod_1.z.object({ lat: zod_1.z.number(), lng: zod_1.z.number() });
const routeSchema = zod_1.z.object({
    origin: waypointSchema,
    destination: waypointSchema,
    waypoints: zod_1.z.array(waypointSchema).optional(),
});
const getRouteSuggestions = async (req, res) => {
    try {
        const parse = routeSchema.safeParse(req.body?.route);
        if (!parse.success)
            return res.status(400).json({ error: 'Invalid route payload', details: parse.error.flatten() });
        const userId = req.userId;
        const preferences = await (0, preferences_1.fetchUserPreferences)(userId);
        const categories = ['restaurant', 'gas_station', 'lodging'];
        const suggestedStops = await (0, googlePlaces_1.querySuggestedStops)(parse.data, categories, preferences);
        const enriched = await (0, googlePlaces_1.enrichRouteWithPolyline)(parse.data, suggestedStops);
        return res.json(enriched);
    }
    catch (error) {
        console.error('suggestions error', error);
        return res.status(500).json({ error: 'Failed to generate route suggestions' });
    }
};
exports.getRouteSuggestions = getRouteSuggestions;
const refineSchema = zod_1.z.object({
    route: routeSchema,
    feedback: zod_1.z.string().min(1),
    previousStops: zod_1.z.array(zod_1.z.union([
        zod_1.z.object({
            placeId: zod_1.z.string(),
            name: zod_1.z.string().optional(),
            category: zod_1.z.string().optional(),
            location: zod_1.z.object({ lat: zod_1.z.number(), lng: zod_1.z.number() }),
            rating: zod_1.z.number().optional(),
            priceLevel: zod_1.z.number().optional(),
        }),
        zod_1.z.object({
            placeId: zod_1.z.string(),
            name: zod_1.z.string().optional(),
            category: zod_1.z.string().optional(),
            lat: zod_1.z.number(),
            lng: zod_1.z.number(),
            rating: zod_1.z.number().optional(),
            priceLevel: zod_1.z.number().optional(),
        })
    ])).optional(),
});
const refineRoute = async (req, res) => {
    try {
        const parse = refineSchema.safeParse(req.body);
        if (!parse.success)
            return res.status(400).json({ error: 'Invalid refine payload', details: parse.error.flatten() });
        const userId = req.userId;
        const preferences = await (0, preferences_1.fetchUserPreferences)(userId);
        const refinedCategories = (0, refinement_1.refineQuery)(parse.data.feedback, preferences);
        const suggestedStops = await (0, googlePlaces_1.querySuggestedStops)(parse.data.route, refinedCategories, preferences);
        const enriched = await (0, googlePlaces_1.enrichRouteWithPolyline)(parse.data.route, suggestedStops);
        return res.json(enriched);
    }
    catch (error) {
        console.error('refine error', error);
        return res.status(500).json({ error: 'Failed to refine route suggestions' });
    }
};
exports.refineRoute = refineRoute;
exports.default = { getRouteSuggestions: exports.getRouteSuggestions, refineRoute: exports.refineRoute };
