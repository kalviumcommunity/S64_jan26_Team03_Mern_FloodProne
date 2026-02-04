import { z } from "zod";
import { AlertType, Severity, RiskLevel, Role } from "@prisma/client";

export const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  name: z.string().min(2, "Name must be at least 2 characters long"),
  locationId: z.number().int().positive().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const userUpdateSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  name: z.string().min(2, "Name must be at least 2 characters long").optional(),
  role: z.nativeEnum(Role).optional(),
  locationId: z.number().int().positive().optional(),
});

export const locationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  riskLevel: z.nativeEnum(RiskLevel).optional().default(RiskLevel.SAFE),
});

export const locationUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").optional(),
  latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90").optional(),
  longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180").optional(),
  riskLevel: z.nativeEnum(RiskLevel).optional(),
});

export const alertSchema = z.object({
  type: z.nativeEnum(AlertType, { errorMap: () => ({ message: "Invalid alert type" }) }),
  message: z.string().min(5, "Message must be at least 5 characters long"),
  severity: z.nativeEnum(Severity).optional().default(Severity.INFO),
  locationId: z.number().int().positive("Location ID must be a positive integer"),
});
