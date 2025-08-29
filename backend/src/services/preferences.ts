import admin from 'firebase-admin';

export interface UserPreferences {
  budget?: 'low' | 'medium' | 'high';
  avoidTolls?: boolean;
  cuisine?: string[];
  minRating?: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  budget: 'medium',
  avoidTolls: false,
  cuisine: [],
  minRating: 3.5,
};

export async function fetchUserPreferences(userId: string): Promise<UserPreferences> {
  try {
    const doc = await admin.firestore().collection('preferences').doc(userId).get();
    if (!doc.exists) return DEFAULT_PREFERENCES;
    const data = doc.data() as UserPreferences;
    return { ...DEFAULT_PREFERENCES, ...(data || {}) };
  } catch (error) {
    console.warn('Failed to fetch user preferences, using defaults', error);
    return DEFAULT_PREFERENCES;
  }
}



