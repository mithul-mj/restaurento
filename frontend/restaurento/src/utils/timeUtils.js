export const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + minutes;
};

export const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const formatTime12Hour = (time) => {
    if (time === undefined || time === null) return "";

    let timeStr = time;
    if (typeof time === 'number') {
        timeStr = minutesToTime(time);
    }

    if (!timeStr) return "";

    const [h, m] = timeStr.toString().split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Converts 0 to 12
    return `${hour12.toString().padStart(2, '0')}:${m} ${ampm}`;
};

export const formatDate = (dateString, options = {}) => {
    if (!dateString) return "";
    const defaultOptions = {
        month: "short",
        day: "2-digit",
        year: "numeric",
        ...options
    };
    return new Intl.DateTimeFormat("en-US", defaultOptions).format(new Date(dateString));
};
