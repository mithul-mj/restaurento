export const getCategoryFromTimeSlot = (timeSlot) => {
    if (!timeSlot) return null;
    const timeParts = timeSlot.match(/(\d+):(\d+)\s(AM|PM)/);
    if (!timeParts) return null;

    let hour = parseInt(timeParts[1]);
    const ampm = timeParts[3];
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;

    if (hour < 11) return "Breakfast";
    if (hour < 16) return "Lunch";
    return "Dinner";
};
