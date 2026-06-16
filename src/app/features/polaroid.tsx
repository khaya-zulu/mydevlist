"use client";

import { motion } from "motion/react";
import { Screenshot } from "@/app/components/screenshot";

import { ArrowUpRightIcon } from "@/app/components/icons/arrow-up-right";
import { ArrowRightIcon } from "@/app/components/icons/arrow-right";

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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      className="bg-white p-4 flex flex-col gap-4 border border-neutral-200/50 rounded-md"
    >
      <a
        href={dev.url}
        target="_blank"
        rel="noreferrer"
        className="relative group"
      >
        <Screenshot
          slug={dev.slug}
          alt={dev.name ?? dev.slug}
          className="h-64 w-full object-cover bg-neutral-100"
        />

        <div className="absolute bottom-5 transition-colors duration-300 border-2 border-transparent group-hover:border-neutral-800 right-5 text-xs bg-white rounded-2xl px-3 py-1.5 flex items-center gap-2">
          {displayUrl}
          <ArrowUpRightIcon size={14} />
        </div>
      </a>
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold flex">{dev.name ?? displayUrl}</div>
          <div className="font-instrument">{dev.role ?? "Developer"}</div>
        </div>

        <a href={`/${dev.slug}`} target="_blank" rel="noreferrer">
          <ArrowRightIcon size={18} />
        </a>
      </div>
    </motion.div>
  );
};
