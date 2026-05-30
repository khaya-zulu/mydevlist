"use client";

import { motion } from "motion/react";
import { ArrowUpRightIcon } from "@/app/components/icons/arrow-up-right";

export const Polaroid = ({
  dev,
  index,
}: {
  dev: {
    slug: string;
    url: string;
    name: string | null;
    role: string | null;
  };
  index: number;
}) => {
  const displayUrl = dev.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <motion.a
      href={`/${dev.slug}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="bg-white p-4 flex flex-col gap-4 border border-neutral-200/50 rounded-md"
    >
      <div className="relative">
        <img
          src={`/screenshots/${dev.slug}`}
          alt={dev.name ?? dev.slug}
          className="h-64 w-full object-cover bg-neutral-100"
        />
        <div className="absolute bottom-5 right-5 text-xs bg-white rounded-2xl px-3 py-1.5">
          {displayUrl}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold">{dev.name ?? displayUrl}</div>
          <div className="font-instrument">{dev.role ?? "Developer"}</div>
        </div>
        <ArrowUpRightIcon size={18} />
      </div>
    </motion.a>
  );
};
