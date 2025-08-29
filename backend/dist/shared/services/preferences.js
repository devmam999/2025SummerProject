import admin from 'firebase-admin';
const DEFAULT_PREFERENCES = {
    budget: 'medium',
    avoidTolls: false,
    cuisine: [],
    minRating: 3.5,
};
export async function fetchUserPreferences(userId) {
    try {
        const doc = await admin.firestore().collection('preferences').doc(userId).get();
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
