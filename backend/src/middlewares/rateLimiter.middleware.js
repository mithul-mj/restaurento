import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes."
    }
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: "Multiple authentication attempts detected. Please wait 15 minutes before trying again."
    }
});
