"use client";

import React from "react";
import { motion } from "framer-motion";
import { CommandSuggestion } from "./CommandPalette";
import { Button } from "@/components/ui/button"; // Import the Button component
import { cn } from "@/lib/utils"; // cn might be needed if we add specific classes

interface CommandSuggestionButtonsProps {
  suggestions: CommandSuggestion[];
  onSelectSuggestion: (index: number) => void;
}

export function CommandSuggestionButtons({
  suggestions,
  onSelectSuggestion,
}: CommandSuggestionButtonsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {suggestions.map((suggestion, index) => (
        <Button
          key={suggestion.prefix}
          variant="ghost"
          size="sm"
          onClick={() => onSelectSuggestion(index)}
          asChild
        >
          <motion.button
            className="relative group" // Keep for the inner border effect, Button variant handles base style
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {suggestion.icon}
            <span>{suggestion.label}</span>
            {/* This motion.div is for the animated border. 
                It relies on 'group' class on the parent motion.button if it uses group-hover for effects.
                The Button component itself doesn't have this specific animated border.
                We keep it here as an enhancement specific to these suggestion buttons.
            */}
            <motion.div
              className="absolute inset-0 border border-white/[0.05] rounded-lg pointer-events-none"
              initial={false}
              animate={{
                opacity: [0, 1], // Example: could be tied to group-hover if desired
                scale: [0.98, 1],   // Example: could be tied to group-hover
              }}
              // Example of tying to group hover if motion variants were used:
              // variants={{ hover: { opacity: 1, scale: 1 }, initial: { opacity: 0, scale: 0.98 } }}
              // whileHover="hover" // This would require motion.button to be a motion component that propagates hover
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            />
          </motion.button>
        </Button>
      ))}
    </div>
  );
}
