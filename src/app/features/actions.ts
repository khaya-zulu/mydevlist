"use server";

import { controlDb, subscribers } from "@/db/control";
import { serverQuery } from "rwsdk/worker";
import z from "zod";

const emailSchema = z.email();

export const subscribe = serverQuery(
  async (email: string): Promise<{ ok: boolean }> => {
    const parsed = emailSchema.safeParse(email.trim().toLowerCase());
    if (!parsed.success) return { ok: false };

    await controlDb
      .insert(subscribers)
      .values({ email: parsed.data })
      .onConflictDoNothing();

    return { ok: true };
  },
  { method: "POST" },
);
