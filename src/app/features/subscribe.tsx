"use client";

import { type FormEvent, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";

import { subscribe } from "./actions";

type Mode = "badge" | "form" | "done";

export const Subscribe = ({ count }: { count: number }) => {
  const [mode, setMode] = useState<Mode>("badge");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!email || isPending) return;

    startTransition(async () => {
      const { ok } = await subscribe(email);
      if (ok) setMode("done");
    });
  };

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className="bg-cyan-600 text-white p-1 text-sm overflow-hidden"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {mode === "form" ? (
          <motion.form
            key="form"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={onSubmit}
            className="flex items-center gap-1"
          >
            <input
              autoFocus
              type="email"
              required
              disabled={isPending}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
              className="bg-white text-black px-2 py-0.5 outline-none placeholder:text-neutral-400 disabled:opacity-60"
            />
            <button type="submit" disabled={isPending} className="px-1">
              <u>{isPending ? "Joining…" : "Join"}</u>
            </button>
          </motion.form>
        ) : mode === "done" ? (
          <motion.span
            key="done"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="block px-1"
          >
            You're on the list ❋
          </motion.span>
        ) : (
          <motion.button
            key="badge"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMode("form")}
          >
            {count} Devs ❋ <u>Subscribe</u>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
