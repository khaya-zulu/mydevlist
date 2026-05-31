"use client";

import { useState, type ComponentProps } from "react";
import { motion } from "motion/react";

type ScreenshotProps = { slug: string } & ComponentProps<"img">;

// Shows the digital version of a developer's screenshot by default and
// crossfades to the original on hover, with a shimmer sweep across the swap.
// Sizing comes from the `className` passed through to the (base) image.
export const Screenshot = ({ slug, className, ...props }: ScreenshotProps) => {
  const [hovered, setHovered] = useState(false);

  // Shared name so the screenshot morphs between the card and the dev page
  // hero during a View Transition. Sanitised to a valid CSS custom-ident.
  const viewTransitionName = `vt-${slug.replace(/[^a-zA-Z0-9]+/g, "-")}`;

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{ viewTransitionName }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Digital version (default) — drives the box size. */}
      <img src={`/screenshots/${slug}/digital`} className={className} {...props} />

      {/* Original screenshot, revealed on hover. */}
      <motion.img
        src={`/screenshots/${slug}`}
        aria-hidden
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
    </motion.div>
  );
};
