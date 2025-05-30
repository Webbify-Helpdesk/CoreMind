"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  description: string; // Kept for potential future use, though not displayed in current minimal version
  prefix: string;
}

interface CommandPaletteProps {
  show: boolean;
  suggestions: CommandSuggestion[];
  activeSuggestion: number;
  onSelectSuggestion: (index: number) => void;
  commandPaletteRef: React.Ref<HTMLDivElement>;
}

export function CommandPalette({
  show,
  suggestions,
  activeSuggestion,
  onSelectSuggestion,
  commandPaletteRef,
}: CommandPaletteProps) {
  if (!show || suggestions.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={commandPaletteRef}
          className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-black/90 rounded-lg z-50 shadow-lg border border-white/10 overflow-hidden"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.15 }}
        >
          <div className="py-1 bg-black/95">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.prefix}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer",
                  activeSuggestion === index
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5"
                )}
                onClick={() => onSelectSuggestion(index)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <div className="w-5 h-5 flex items-center justify-center text-white/60">
                  {suggestion.icon}
                </div>
                <div className="font-medium">{suggestion.label}</div>
                <div className="text-white/40 text-xs ml-1">
                  {suggestion.prefix}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
