"use client";

import { motion } from "framer-motion";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.75,
        ease: LUXURY_EASE,
      }}
      className="w-full min-h-full flex flex-col flex-1"
    >
      {children}
    </motion.div>
  );
}
