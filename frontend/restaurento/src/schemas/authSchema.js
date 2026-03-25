import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email format").max(30, "Email must be less than 30 characters"),
    password: z.string().min(6, "Minimum 6 characters").max(30, "Password too long"),
});

export const signupSchema = z.object({
    fullName: z.string().min(3, "Name must be at least 3 characters").max(30, "Name too long"),
    email: z.string().email("Invalid email format").max(30, "Email must be less than 30 characters"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(30, "Password cannot exceed 30 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
