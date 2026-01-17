import { timeToMinutes } from './timeUtils';

export const calculateSlots = (startStr, endStr, durationStr, gapStr) => {
    const duration = Number(durationStr);
    const gap = Number(gapStr || 0);

    if (!startStr || !endStr || !duration) return [];

    const slots = [];
    const startMinutes = timeToMinutes(startStr);
    const endMinutes = timeToMinutes(endStr);

    let current = startMinutes;

    while (current + duration <= endMinutes) {
        const slotEnd = current + duration;

        slots.push({
            startTime: current,  // Store as total minutes (e.g., 540 for 09:00)
            endTime: slotEnd     // Store as total minutes
        });

        current = slotEnd + gap;
    }
    return slots;
};