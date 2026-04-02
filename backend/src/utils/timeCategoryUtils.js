
export const getCategoryFromMinutes = (minutes) => {
    if (minutes === undefined || minutes === null) return null;

    const hour = Math.floor(minutes / 60);

    if (hour < 11) return "Breakfast";
    if (hour < 16) return "Lunch";
    return "Dinner";
};
