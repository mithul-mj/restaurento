import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(100, "Name cannot exceed 100 characters"),

  email: z.string().email("Invalid email format").min(1, "Email is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});
