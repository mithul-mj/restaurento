import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email format").max(30, "Email must be less than 30 characters"),
    password: z.string().min(6, "Password must be at least 6 characters").max(30, "Password too long"),
    role: z.enum(["USER", "RESTAURANT", "ADMIN"]).optional(),
});

export const signupSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(30, "Full name too long"),
    email: z.string().email("Invalid email format").max(30, "Email must be less than 30 characters"),
    password: z.string().min(6, "Password must be at least 6 characters").max(30, "Password too long"),
    referralCode: z.string().optional(),
});

export const verifyEmailSchema = z.object({
    email: z.string().email("Invalid email format"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    role: z.enum(["USER", "RESTAURANT", "ADMIN"]),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email format"),
    role: z.enum(["USER", "RESTAURANT", "ADMIN"]),
});

export const resetPasswordSchema = z.object({
    id: z.string().min(1, "ID is required"),
    token: z.string().min(1, "Token is required"),
    role: z.enum(["USER", "RESTAURANT", "ADMIN"]),
    newPassword: z.string().min(6, "Password must be at least 6 characters").max(50, "Password too long"),
});
