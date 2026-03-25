import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(30, "Name cannot exceed 30 characters"),

  email: z.string().email("Invalid email format").min(1, "Email is required").max(30, "Email cannot exceed 30 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(30, "Password cannot exceed 30 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").max(30, "Email cannot exceed 30 characters"),
  password: z.string().min(1, "Password is required").max(30, "Password cannot exceed 30 characters"),
});
