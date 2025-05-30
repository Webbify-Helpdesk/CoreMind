"use client";

import React from "react";
import { motion } from "framer-motion";

export function ChatHeader() {
  return (
    <div className="text-center space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="inline-block"
      >
        <h1 className="text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40 pb-1">
          Hur kan jag hjälpa till idag?
        </h1>
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </motion.div>
      <motion.p
        className="text-sm text-white/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Fråga om ditt projekt eller lägg till ny dokumentation
      </motion.p>
    </div>
  );
}
