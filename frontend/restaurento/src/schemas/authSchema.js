import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email format").max(100, "Email too long"),
    password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password too long"),
});

export const signupSchema = z.object({
    fullName: z.string().min(3, "Name must be at least 3 characters").max(100, "Name too long"),
    email: z.string().email("Invalid email format").max(100, "Email too long"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(50, "Password too long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
