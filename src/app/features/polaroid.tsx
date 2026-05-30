"use client";

import { useState } from "react";
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
  const [hovered, setHovered] = useState(false);

  const digitalSrc = `/screenshots/${dev.slug}/digital`;
  const originalSrc = `/screenshots/${dev.slug}`;

  return (
    <motion.a
      href={`/${dev.slug}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="bg-white p-4 flex flex-col gap-4 border border-neutral-200/50 rounded-md"
    >
      <div className="relative h-64 w-full overflow-hidden bg-neutral-100">
        {/* Digital version (default). */}
        <img
          src={digitalSrc}
          alt={dev.name ?? dev.slug}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Original screenshot, revealed on hover. */}
        <motion.img
          src={originalSrc}
          alt={dev.name ?? dev.slug}
          className="absolute inset-0 h-full w-full object-cover"
          initial={false}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        />

        {/* Shimmer sweep across the swap. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
          }}
          initial={{ x: "-130%" }}
          animate={{ x: hovered ? "130%" : "-130%" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
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
