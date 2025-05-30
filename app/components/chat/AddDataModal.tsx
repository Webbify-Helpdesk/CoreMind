"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { XIcon, ArrowUpIcon, PlusIcon, LoaderIcon } from "lucide-react";
import { SubmitButton } from "./SubmitButton"; // Import SubmitButton

export interface DataType {
  icon: React.ReactNode;
  label: string;
  description: string;
  placeholder: string;
}

interface AddDataModalProps {
  show: boolean;
  onClose: () => void;
  dataTypes: DataType[];
  onDataAdded: (dataTypeLabel: string) => void; // To show toast in parent
  modalRef: React.Ref<HTMLDivElement>;
}

export function AddDataModal({
  show,
  onClose,
  dataTypes,
  onDataAdded,
  modalRef,
}: AddDataModalProps) {
  const [selectedDataType, setSelectedDataType] = useState<DataType | null>(null);
  const [addDataContent, setAddDataContent] = useState("");
  const [isAddingData, setIsAddingData] = useState(false);
  const { textareaRef: addDataTextareaRef, adjustHeight: adjustAddDataHeight } = useAutoResizeTextarea({
    minHeight: 120,
    maxHeight: 300,
  });

  useEffect(() => {
    // Reset internal state when modal is closed externally
    if (!show) {
      setSelectedDataType(null);
      setAddDataContent("");
      adjustAddDataHeight(true);
    }
  }, [show, adjustAddDataHeight]);

  const handleInternalClose = () => {
    setSelectedDataType(null);
    setAddDataContent("");
    adjustAddDataHeight(true);
    onClose();
  };
  
  const handleAddData = async () => {
    if (!selectedDataType || !addDataContent.trim()) return;

    setIsAddingData(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Adding data (from modal):', {
        type: selectedDataType.label,
        content: addDataContent
      });

      onDataAdded(selectedDataType.label); // Notify parent
      handleInternalClose(); // Close and reset modal
      
    } catch (error) {
      console.error('Error adding data:', error);
      // Potentially show an error message within the modal
    } finally {
      setIsAddingData(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleInternalClose} // Close on backdrop click
          />
          <motion.div
            ref={modalRef}
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
                    onClick={handleInternalClose}
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
                          setAddDataContent(""); 
                          adjustAddDataHeight(true); 
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
                      onClick={handleInternalClose}
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
                                        <SubmitButton
                                            onClick={handleAddData}
                                            disabled={!addDataContent.trim()}
                                            isProcessing={isAddingData}
                                            active={!!addDataContent.trim()}
                                            icon={<PlusIcon className="w-4 h-4" />}
                                        >
                                            Lägg till i Kunskapsbasen
                                        </SubmitButton>
                                    </div>
                                </>
                            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
