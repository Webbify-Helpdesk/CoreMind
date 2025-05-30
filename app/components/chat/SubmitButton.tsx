"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion"; // Import HTMLMotionProps
import { cn } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";

// Define props specific to SubmitButton's logic and standard button interactions
interface SubmitButtonCustomProps {
  isProcessing?: boolean;
  active?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode; // Enforce children for the text label
  onClick?: React.MouseEventHandler<HTMLButtonElement>; // Standard React onClick
  disabled?: boolean; // Standard React disabled
  className?: string; // Standard className
}

// Combine custom props with HTMLMotionProps, ensuring compatibility with motion.button
// Omit keys from HTMLMotionProps that are explicitly defined in SubmitButtonCustomProps to avoid conflicts
// and ensure our definitions take precedence for those specific props.
type SubmitButtonProps = Omit<HTMLMotionProps<"button">, keyof SubmitButtonCustomProps> & SubmitButtonCustomProps;

export function SubmitButton({
  onClick,
  disabled,
  isProcessing,
  active = true,
  icon,
  children,
  className,
  ...rest // These are the remaining HTMLMotionProps compatible with motion.button
}: SubmitButtonProps) {
  const effectiveDisabled = disabled || isProcessing;
  const showActiveStyle = active && !effectiveDisabled;

  return (
    <motion.button
      type="button" // Explicitly set type, though it's default for button
      onClick={onClick}
      disabled={effectiveDisabled} // Pass our managed disabled state
      whileHover={{ scale: effectiveDisabled ? 1 : 1.01 }}
      whileTap={{ scale: effectiveDisabled ? 1 : 0.98 }}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
        "flex items-center gap-2",
        showActiveStyle
          ? "bg-white text-[#0A0A0B] shadow-lg dark:shadow-white/10"
          : "bg-white/[0.05] text-white/40",
        className 
      )}
      {...rest} // Spread the remaining compatible motion props
    >
      {isProcessing ? (
        <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
      ) : (
        icon
      )}
      {children}
    </motion.button>
  );
}
