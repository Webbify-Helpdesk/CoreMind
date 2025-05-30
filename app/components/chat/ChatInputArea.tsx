"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { CommandPalette, CommandSuggestion } from "./CommandPalette";
import { PlusIcon, SendIcon, LoaderIcon } from "lucide-react";
import { SubmitButton } from "./SubmitButton"; // Import SubmitButton

interface ChatInputAreaProps {
  value: string;
  onValueChange: (value: string) => void;
  onSendMessage: () => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.Ref<HTMLTextAreaElement>;
  adjustTextareaHeight: () => void;
  isTyping: boolean;
  showAddDataModal: boolean;
  onToggleAddDataModal: (e: React.MouseEvent<HTMLButtonElement>) => void;
  // Command Palette Props
  showCommandPalette: boolean;
  commandSuggestions: CommandSuggestion[];
  activeCommandSuggestion: number;
  onSelectCommandSuggestion: (index: number) => void;
  commandPaletteRef: React.Ref<HTMLDivElement>;
  onInputFocus: () => void;
  onInputBlur: () => void;
}

export function ChatInputArea({
  value,
  onValueChange,
  onSendMessage,
  onInputKeyDown,
  textareaRef,
  adjustTextareaHeight,
  isTyping,
  showAddDataModal,
  onToggleAddDataModal,
  showCommandPalette,
  commandSuggestions,
  activeCommandSuggestion,
  onSelectCommandSuggestion,
  commandPaletteRef,
  onInputFocus,
  onInputBlur,
}: ChatInputAreaProps) {
  return (
    <motion.div
      className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
      initial={{ scale: 0.98 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      <CommandPalette
        show={showCommandPalette}
        suggestions={commandSuggestions}
        activeSuggestion={activeCommandSuggestion}
        onSelectSuggestion={onSelectCommandSuggestion}
        commandPaletteRef={commandPaletteRef}
      />

      <div className="p-4">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value);
            adjustTextareaHeight();
          }}
          onKeyDown={onInputKeyDown}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          placeholder="Fråga om din kunskapsbas, databasschema eller bästa praxis..."
          containerClassName="w-full"
          className={cn(
            "w-full px-4 py-3",
            "resize-none",
            "bg-transparent",
            "border-none",
            "text-white/90 text-sm",
            "focus:outline-none",
            "placeholder:text-white/20",
            "min-h-[60px]"
          )}
          style={{
            overflow: "hidden",
          }}
          showRing={false}
        />
      </div>

      <div className="p-4 border-t border-white/[0.05] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            data-add-data-button // Keep this for click-outside logic if still needed by parent
            onClick={onToggleAddDataModal}
            whileTap={{ scale: 0.94 }}
            className={cn(
              "p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors relative group",
              showAddDataModal && "bg-white/10 text-white/90"
            )}
          >
            <PlusIcon className="w-4 h-4" />
            <motion.span
              className="absolute inset-0 bg-white/[0.05] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              layoutId="button-highlight-plus" // Ensure this layoutId is unique or managed if multiple instances
            />
          </motion.button>
        </div>

        <SubmitButton
          onClick={onSendMessage}
          disabled={!value.trim()} // SubmitButton handles isProcessing internally for disabled state
          isProcessing={isTyping}
          active={!!value.trim()} // Pass explicit active state based on value
          icon={<SendIcon className="w-4 h-4" />}
        >
          Skicka
        </SubmitButton>
      </div>
    </motion.div>
  );
}
