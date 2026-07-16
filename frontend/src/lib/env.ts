import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional().or(z.literal("")),
});

const parsedEnv = clientEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

if (!parsedEnv.success) {
  throw new Error("Invalid frontend environment variables.");
}

export const env = {
  NEXT_PUBLIC_API_URL: parsedEnv.data.NEXT_PUBLIC_API_URL || undefined,
} as const;
