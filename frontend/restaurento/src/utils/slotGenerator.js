export const calculateSlots = (start, end, duration, gap) => {
    if (!start || !end || !duration) return [];

    const slots = [];
    let current = new Date(`2000-01-01T${start}:00`);
    const finish = new Date(`2000-01-01T${end}:00`);

    const durationMs = duration * 60000;
    const gapMs = gap * 60000;

    while (current.getTime() + durationMs <= finish.getTime()) {
        const slotEnd = new Date(current.getTime() + durationMs);

        slots.push({
            startTime: current.toTimeString().substring(0, 5),
            endTime: slotEnd.toTimeString().substring(0, 5)
        });

        current = new Date(slotEnd.getTime() + gapMs);
    }
    return slots;
};