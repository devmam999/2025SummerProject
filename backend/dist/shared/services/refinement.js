// Naive refinement logic parsing common feedback terms into categories or constraints
export function refineQuery(feedback, preferences) {
    const text = feedback.toLowerCase();
    const categories = new Set();
    // Base categories
    categories.add('restaurant');
    categories.add('gas_station');
    categories.add('lodging');
    if (text.includes('hotel') || text.includes('lodging')) {
        categories.add('lodging');
    }
    if (text.includes('gas') || text.includes('fuel')) {
        categories.add('gas_station');
    }
    if (text.includes('food') || text.includes('eat') || text.includes('restaurant')) {
        categories.add('restaurant');
    }
    if (text.includes('coffee')) {
        categories.add('cafe');
    }
    if (text.includes('cheap') || text.includes('inexpensive') || text.includes('budget') || text.includes('too expensive')) {
        // This will be handled by preferences; keeping restaurant to cast a wider net
        categories.add('restaurant');
    }
    if (text.includes('one more')) {
        categories.add('lodging');
    }
    // If user has cuisines, that remains influential in ranking
    if (preferences.cuisine && preferences.cuisine.length) {
        categories.add('restaurant');
    }
    return Array.from(categories);
}
