import { z } from "zod";

export const environment = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.string().min(1),
    NIDHI_FIXTURE_MODE: z.coerce.boolean().default(true),
  })
  .parse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    NIDHI_FIXTURE_MODE: process.env.NIDHI_FIXTURE_MODE,
  });
