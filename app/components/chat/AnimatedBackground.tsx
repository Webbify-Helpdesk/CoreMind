"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      <div
        className={cn(
          "gradient-orb",
          "top-0 left-1/4 w-96 h-96 bg-violet-500/10 blur-[128px]" // Reverted to original violet
        )}
      />
      <div
        className={cn(
          "gradient-orb",
          "bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 blur-[128px] delay-700" // Reverted to original indigo
        )}
      />
      <div
        className={cn(
          "gradient-orb",
          "top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/10 blur-[96px] delay-1000" // Reverted to original fuchsia
        )}
      />
    </div>
  );
}
