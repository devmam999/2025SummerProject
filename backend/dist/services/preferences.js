"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserPreferences = fetchUserPreferences;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const DEFAULT_PREFERENCES = {
    budget: 'medium',
    avoidTolls: false,
    cuisine: [],
    minRating: 3.5,
};
async function fetchUserPreferences(userId) {
    try {
        const doc = await firebase_admin_1.default.firestore().collection('preferences').doc(userId).get();
        if (!doc.exists)
            return DEFAULT_PREFERENCES;
        const data = doc.data();
        return { ...DEFAULT_PREFERENCES, ...(data || {}) };
    }
    catch (error) {
        console.warn('Failed to fetch user preferences, using defaults', error);
        return DEFAULT_PREFERENCES;
    }
}
