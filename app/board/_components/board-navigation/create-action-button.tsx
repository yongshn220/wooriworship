"use client";

import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface CreateActionButtonProps {
  onClick: () => void;
  label?: string;
}

export const CreateActionButton = ({
  onClick,
  label,
}: CreateActionButtonProps) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="flex items-center justify-center gap-2 h-10 bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity rounded-full md:rounded-lg w-10 md:w-auto md:px-4"
  >
    <Plus className="w-[18px] h-[18px]" strokeWidth={2} />
    {label && <span className="hidden md:inline font-medium">{label}</span>}
  </motion.button>
);
