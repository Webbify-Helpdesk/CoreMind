"use client";

import React, { useEffect, useRef, useCallback, useTransition, useState } from "react";
import { cn } from "@/lib/utils"; 
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
    SendIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
    Command,
    Database,
    FileText,
    Code,
    Settings,
    BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`; // Reset first to get correct scrollHeight
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

interface DataType {
    icon: React.ReactNode;
    label: string;
    description: string;
    placeholder: string;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <div className={cn(
        "relative",
        containerClassName
      )}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {showRing && isFocused && (
          <motion.span 
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export function AnimatedAIChat() {
    const [value, setValue] = useState("");
    const [attachments, setAttachments] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [showAddDataModal, setShowAddDataModal] = useState(false);
    const [selectedDataType, setSelectedDataType] = useState<DataType | null>(null);
    const [addDataContent, setAddDataContent] = useState("");
    const [isAddingData, setIsAddingData] = useState(false);
    const [recentCommand, setRecentCommand] = useState<string | null>(null);
    // const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // Mouse position seems unused for now
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const { textareaRef: addDataTextareaRef, adjustHeight: adjustAddDataHeight } = useAutoResizeTextarea({
        minHeight: 120,
        maxHeight: 300,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const addDataModalRef = useRef<HTMLDivElement>(null);

    const commandSuggestions: CommandSuggestion[] = [
        { 
            icon: <FileText className="w-4 h-4" />, 
            label: "Nytt Dokument", 
            description: "Skapa ett nytt dokument i kunskapsbasen", 
            prefix: "/nytt" 
        },
        { 
            icon: <Sparkles className="w-4 h-4" />, 
            label: "Förbättra Text", 
            description: "Förbättra en befintlig text med AI", 
            prefix: "/förbättra" 
        },
        { 
            icon: <Database className="w-4 h-4" />, 
            label: "Sök Basen", 
            description: "Sök i din kunskapsbas", 
            prefix: "/sök" 
        },
        { 
            icon: <Settings className="w-4 h-4" />, 
            label: "Inställningar", 
            description: "Hantera inställningar för kunskapsbasen", 
            prefix: "/config" 
        },
    ];

    const dataTypes: DataType[] = [
        {
            icon: <FileText className="w-4 h-4" />,
            label: "Dokumentation",
            description: "Lägg till projektdokumentation, guider eller anteckningar",
            placeholder: "Klistra in din dokumentation här...\n\nExempel:\n# Autentiseringsguide\nVår app använder JWT-tokens för autentisering..."
        },
        {
            icon: <Database className="w-4 h-4" />,
            label: "Databas Schema",
            description: "Lägg till databastabeller, relationer eller frågor",
            placeholder: "Klistra in ditt databasschema här...\n\nExempel:\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  created_at TIMESTAMP DEFAULT NOW()\n);"
        },
        {
            icon: <Code className="w-4 h-4" />,
            label: "API Ändpunkter",
            description: "Lägg till API-rutter, parametrar och svar",
            placeholder: "Klistra in din API-dokumentation här...\n\nExempel:\nPOST /api/auth/login\nBody: { email: string, password: string }\nResponse: { token: string, user: User }"
        },
        {
            icon: <Settings className="w-4 h-4" />,
            label: "Konfiguration",
            description: "Lägg till konfigurationsfiler, miljövariabler eller inställningar",
            placeholder: "Klistra in din konfiguration här...\n\nExempel:\nNEXT_PUBLIC_API_URL=https://api.example.com\nDATABASE_URL=postgresql://..."
        },
        {
            icon: <BookOpen className="w-4 h-4" />,
            label: "Bästa Praxis",
            description: "Lägg till kodstandarder, mönster eller riktlinjer",
            placeholder: "Klistra in dina bästa praxis här...\n\nExempel:\n# Kodstilsguide\n- Använd TypeScript för alla nya filer\n- Följ ESLint-regler\n- Skriv beskrivande commit-meddelanden"
        }
    ];

    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ') && commandSuggestions.length > 0) {
            setShowCommandPalette(true);
            
            const matchingSuggestionIndex = commandSuggestions.findIndex(
                (cmd) => cmd.prefix.startsWith(value)
            );
            
            if (matchingSuggestionIndex >= 0) {
                setActiveSuggestion(matchingSuggestionIndex);
            } else {
                setActiveSuggestion(-1);
            }
        } else {
            setShowCommandPalette(false);
        }
    }, [value, commandSuggestions]);

    // Mouse move effect seems unused, can be removed if not needed for future features
    // useEffect(() => {
    //     const handleMouseMove = (e: MouseEvent) => {
    //         setMousePosition({ x: e.clientX, y: e.clientY });
    //     };
    //     window.addEventListener('mousemove', handleMouseMove);
    //     return () => {
    //         window.removeEventListener('mousemove', handleMouseMove);
    //     };
    // }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const commandButton = document.querySelector('[data-command-button]');
            const addDataButton = document.querySelector('[data-add-data-button]');
            
            if (commandPaletteRef.current &&
                !commandPaletteRef.current.contains(target) &&
                (!commandButton || !commandButton.contains(target))) { // Check if commandButton exists
                setShowCommandPalette(false);
            }

            if (addDataModalRef.current &&
                !addDataModalRef.current.contains(target) &&
                (!addDataButton || !addDataButton.contains(target))) { // Check if addDataButton exists
                setShowAddDataModal(false);
                setSelectedDataType(null);
                setAddDataContent("");
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev < commandSuggestions.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev > 0 ? prev - 1 : commandSuggestions.length - 1
                );
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestion >= 0 && activeSuggestion < commandSuggestions.length) {
                    const selectedCommand = commandSuggestions[activeSuggestion];
                    setValue(selectedCommand.prefix + ' ');
                    setShowCommandPalette(false);
                    
                    setRecentCommand(selectedCommand.label);
                    setTimeout(() => setRecentCommand(null), 3500);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                handleSendMessage();
            }
        }
    };

    const handleSendMessage = () => {
        if (value.trim()) {
            startTransition(() => {
                setIsTyping(true);
                // Mock send message
                console.log("Sending message:", value, "Attachments:", attachments);
                setTimeout(() => {
                    setIsTyping(false);
                    setValue("");
                    setAttachments([]);
                    adjustHeight(true);
                }, 3000);
            });
        }
    };

    // Attachment functionality seems irrelevant for a knowledge base focus, can be removed or re-purposed
    // const handleAttachFile = () => {
    //     const mockFileName = `file-${Math.floor(Math.random() * 1000)}.pdf`;
    //     setAttachments(prev => [...prev, mockFileName]);
    // };

    // const removeAttachment = (index: number) => {
    //     setAttachments(prev => prev.filter((_, i) => i !== index));
    // };
    
    const selectCommandSuggestion = (index: number) => {
        if (index >= 0 && index < commandSuggestions.length) {
            const selectedCommand = commandSuggestions[index];
            setValue(selectedCommand.prefix + ' ');
            setShowCommandPalette(false);
            
            setRecentCommand(selectedCommand.label);
            setTimeout(() => setRecentCommand(null), 2000);
        }
    };

    const handleAddData = async () => {
        if (!selectedDataType || !addDataContent.trim()) return;

        setIsAddingData(true);
        
        // Här skulle du anropa din Graphiti-backend
        try {
            // Simulerat API-anrop - ersätt med faktisk Graphiti-integration
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('Lägger till data i Graphiti:', {
                type: selectedDataType.label,
                content: addDataContent
            });

            // Återställ modalens tillstånd
            setShowAddDataModal(false);
            setSelectedDataType(null);
            setAddDataContent("");
            adjustAddDataHeight(true);
            
            // Visa framgångsmeddelande (du kan lägga till en toast här)
            setRecentCommand(`Lade till ${selectedDataType.label}`);
            setTimeout(() => setRecentCommand(null), 3000);
            
        } catch (error) {
            console.error('Fel vid tillägg av data:', error);
        } finally {
            setIsAddingData(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col w-full items-center justify-center bg-transparent text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
                <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
            </div>
            
            <div className="w-full max-w-2xl mx-auto relative">
                <motion.div 
                    className="relative z-10 space-y-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
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

                    <motion.div 
                        className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <AnimatePresence>
                            {showCommandPalette && commandSuggestions.length > 0 && (
                                <motion.div 
                                    ref={commandPaletteRef}
                                    className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-black/90 rounded-lg z-50 shadow-lg border border-white/10 overflow-hidden"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className="py-1 bg-black/95">
                                        {commandSuggestions.map((suggestion, index) => (
                                            <motion.div
                                                key={suggestion.prefix}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer",
                                                    activeSuggestion === index 
                                                        ? "bg-white/10 text-white" 
                                                        : "text-white/70 hover:bg-white/5"
                                                )}
                                                onClick={() => selectCommandSuggestion(index)}
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

                        <div className="p-4">
                            <Textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    adjustHeight();
                                }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
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

                        {/* Attachments removed as per feedback for knowledge base focus */}
                        {/* <AnimatePresence>
                            {attachments.length > 0 && (
                                <motion.div 
                                    className="px-4 pb-3 flex gap-2 flex-wrap"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    {attachments.map((file, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-center gap-2 text-xs bg-white/[0.03] py-1.5 px-3 rounded-lg text-white/70"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                        >
                                            <span>{file}</span>
                                            <button 
                                                onClick={() => removeAttachment(index)}
                                                className="text-white/40 hover:text-white transition-colors"
                                            >
                                                <XIcon className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence> */}

                        <div className="p-4 border-t border-white/[0.05] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {/* Paperclip and Command buttons removed */}
                                <motion.button
                                    type="button"
                                    data-add-data-button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowAddDataModal(prev => !prev);
                                    }}
                                    whileTap={{ scale: 0.94 }}
                                    className={cn(
                                        "p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors relative group",
                                        showAddDataModal && "bg-white/10 text-white/90"
                                    )}
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    <motion.span
                                        className="absolute inset-0 bg-white/[0.05] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        layoutId="button-highlight-plus"
                                    />
                                </motion.button>
                            </div>
                            
                            <motion.button
                                type="button"
                                onClick={handleSendMessage}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isTyping || !value.trim()}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    "flex items-center gap-2",
                                    value.trim()
                                        ? "bg-white text-[#0A0A0B] shadow-lg shadow-white/10"
                                        : "bg-white/[0.05] text-white/40"
                                )}
                            >
                                {isTyping ? (
                                    <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                                ) : (
                                    <SendIcon className="w-4 h-4" />
                                )}
                                <span>Skicka</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    {commandSuggestions.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {commandSuggestions.map((suggestion, index) => (
                                <motion.button
                                    key={suggestion.prefix}
                                    onClick={() => selectCommandSuggestion(index)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg text-sm text-white/60 hover:text-white/90 transition-all relative group"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {suggestion.icon}
                                    <span>{suggestion.label}</span>
                                    <motion.div
                                        className="absolute inset-0 border border-white/[0.05] rounded-lg"
                                        initial={false}
                                        animate={{
                                            opacity: [0, 1],
                                            scale: [0.98, 1],
                                        }}
                                        transition={{
                                            duration: 0.3,
                                            ease: "easeOut",
                                        }}
                                    />
                                </motion.button>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Add Data Modal */}
            <AnimatePresence>
                {showAddDataModal && (
                    <motion.div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <motion.div 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        
                        {/* Modal */}
                        <motion.div 
                            ref={addDataModalRef}
                            className="relative w-full max-w-2xl backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl flex flex-col"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {!selectedDataType ? (
                                // Data Type Selection
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-medium text-white/90">Lägg till Data i Kunskapsbasen</h2>
                                        <button 
                                            onClick={() => setShowAddDataModal(false)}
                                            className="p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors"
                                        >
                                            <XIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {dataTypes.map((dataType, index) => (
                                            <motion.button
                                                key={dataType.label}
                                                onClick={() => setSelectedDataType(dataType)}
                                                className="w-full p-4 text-left bg-white/[0.02] hover:bg-white/[0.05] rounded-lg border border-white/[0.05] transition-all group"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-white/[0.05] rounded-lg text-white/60 group-hover:text-white/90 transition-colors">
                                                        {dataType.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-white/90 mb-1">{dataType.label}</h3>
                                                        <p className="text-sm text-white/40">{dataType.description}</p>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // Data Input Form
                                <>
                                    <div className="p-6 border-b border-white/[0.05]">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedDataType(null);
                                                        setAddDataContent(""); // Rensa innehåll vid tillbakagång
                                                        adjustAddDataHeight(true); // Återställ höjd
                                                    }}
                                                    className="p-1 text-white/40 hover:text-white/90 rounded-lg transition-colors"
                                                >
                                                    <ArrowUpIcon className="w-4 h-4 rotate-[-90deg]" />
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-white/[0.05] rounded-lg text-white/60">
                                                        {selectedDataType.icon}
                                                    </div>
                                                    <h2 className="text-xl font-medium text-white/90">Lägg till {selectedDataType.label}</h2>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setShowAddDataModal(false);
                                                    setSelectedDataType(null);
                                                    setAddDataContent("");
                                                    adjustAddDataHeight(true);
                                                }}
                                                className="p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors"
                                            >
                                                <XIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6 flex-grow">
                                        <Textarea
                                            ref={addDataTextareaRef}
                                            value={addDataContent}
                                            onChange={(e) => {
                                                setAddDataContent(e.target.value);
                                                adjustAddDataHeight();
                                            }}
                                            placeholder={selectedDataType.placeholder}
                                            containerClassName="w-full h-full"
                                            className={cn(
                                                "w-full h-full px-4 py-3",
                                                "resize-none",
                                                "bg-transparent",
                                                "border-none",
                                                "text-white/90 text-sm",
                                                "focus:outline-none",
                                                "placeholder:text-white/30",
                                                "min-h-[120px]"
                                            )}
                                            style={{
                                                overflow: "hidden",
                                            }}
                                            showRing={false}
                                        />
                                    </div>
                                    <div className="p-6 border-t border-white/[0.05] flex justify-end">
                                        <motion.button
                                            type="button"
                                            onClick={handleAddData}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={isAddingData || !addDataContent.trim()}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                                "flex items-center gap-2",
                                                addDataContent.trim() && !isAddingData
                                                    ? "bg-white text-[#0A0A0B] shadow-lg shadow-white/10"
                                                    : "bg-white/[0.05] text-white/40"
                                            )}
                                        >
                                            {isAddingData ? (
                                                <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                                            ) : (
                                                <PlusIcon className="w-4 h-4" />
                                            )}
                                            <span>Lägg till i Kunskapsbasen</span>
                                        </motion.button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recent Command Indicator */}
            <AnimatePresence>
                {recentCommand && (
                    <motion.div
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black/80 backdrop-blur-md text-white/90 text-sm rounded-lg shadow-xl border border-white/10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10, transition: { duration: 0.3 } }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        {recentCommand.startsWith("Lade till") ? "Tillagd: " : "Vald: "}
                        <span className="font-medium">{recentCommand.replace("Lade till ", "")}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
