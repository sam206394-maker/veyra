import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: z.string().email("Invalid email address"),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
  })
  .strict();

export const projectCreateSchema = z
  .object({
    name: z.string().min(1, "Project name is required").max(100),
    description: z.string().max(500).optional().nullable(),
  })
  .strict();

export const projectUpdateSchema = z
  .object({
    name: z.string().min(1, "Project name is required").max(100).optional(),
    description: z.string().max(500).optional().nullable(),
  })
  .strict();

export const projectIdSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export const generationCreateSchema = z
  .object({
    type: z.enum([
      "text-to-image",
      "image-to-image",
      "text-to-video",
      "image-to-video",
    ]),
    prompt: z.string().min(1, "Prompt is required").max(2000),
    negativePrompt: z.string().max(1000).optional().nullable(),
    aspectRatio: z
      .enum(["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"])
      .optional(),
    quality: z
      .enum(["draft", "standard", "high"])
      .optional()
      .default("standard"),
    duration: z.number().int().min(1).max(30).optional(),
    stylePreset: z.string().max(50).optional(),
    count: z.number().int().min(1).max(4).optional().default(1),
    projectId: z.string().optional().nullable(),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    email: z.string().email().optional(),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .max(128)
      .regex(/[a-z]/)
      .regex(/[A-Z]/)
      .regex(/[0-9]/),
  })
  .strict();

export const adminAdjustCreditsSchema = z
  .object({
    userId: z.string().min(1),
    amount: z.number().int().min(-100000).max(100000),
    description: z.string().max(300).optional(),
  })
  .strict();

export const adminDisableUserSchema = z
  .object({
    userId: z.string().min(1),
  })
  .strict();

export const googleAuthSchema = z
  .object({
    credential: z.string().min(10, "Invalid Google credential"),
  })
  .strict();

export const phoneSendOtpSchema = z
  .object({
    phone: z.string().min(5, "Enter a valid phone number").max(20),
  })
  .strict();

export const phoneVerifySchema = z
  .object({
    phone: z.string().min(5, "Enter a valid phone number").max(20),
    code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
  })
  .strict();
