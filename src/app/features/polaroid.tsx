"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Screenshot } from "@/app/components/screenshot";

import { ArrowUpRightIcon } from "@/app/components/icons/arrow-up-right";
import { ArrowRightIcon } from "@/app/components/icons/arrow-right";
import { CopyIcon, type CopyIconHandle } from "@/app/components/icons/copy";

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
  const [copied, setCopied] = useState(false);
  const copyIconRef = useRef<CopyIconHandle>(null);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => {
      setCopied(false);
      copyIconRef.current?.stopAnimation();
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(dev.url);
      setCopied(true);
      copyIconRef.current?.startAnimation();
    } catch {}
  };

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
          {copied ? "copied" : displayUrl}
          <ArrowUpRightIcon size={14} />
        </div>
      </a>
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold flex">{dev.name ?? displayUrl}</div>
          <div className="font-instrument">{dev.role ?? "Developer"}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyUrl}
            aria-label="Copy website URL"
            className="cursor-pointer"
          >
            <CopyIcon ref={copyIconRef} size={18} />
          </button>
          <a href={`/${dev.slug}`} target="_blank" rel="noreferrer">
            <ArrowRightIcon size={18} />
          </a>
        </div>
      </div>
    </motion.div>
  );
};
