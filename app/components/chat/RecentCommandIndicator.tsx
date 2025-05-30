"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RecentCommandIndicatorProps {
  commandLabel: string | null;
}

export function RecentCommandIndicator({ commandLabel }: RecentCommandIndicatorProps) {
  return (
    <AnimatePresence>
      {commandLabel && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black/80 backdrop-blur-md text-white/90 text-sm rounded-lg shadow-xl border border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10, transition: { duration: 0.3 } }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {commandLabel.startsWith("Lade till") ? "Tillagd: " : "Vald: "}
          <span className="font-medium">{commandLabel.replace("Lade till ", "")}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
