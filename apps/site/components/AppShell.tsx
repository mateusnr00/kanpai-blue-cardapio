"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { Category } from "@/lib/menu-types";

type AppShellProps = {
  children: ReactNode;
  categories: Category[];
};

export function AppShell({ children, categories: _categories }: AppShellProps) {
  return (
    <motion.div
      className="app-shell theme-transition"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}
