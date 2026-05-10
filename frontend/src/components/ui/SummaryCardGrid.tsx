"use client";

import { motion } from "motion/react";
import SummaryCard, { type SummaryCardItem } from "./SummaryCard";

interface SummaryCardGridProps {
  readonly stats: readonly SummaryCardItem[];
  readonly className?: string;
  readonly desktopColumns?: 3 | 4;
}

export default function SummaryCardGrid({ stats, className = "", desktopColumns = 3 }: SummaryCardGridProps) {
  const desktopGridClass = desktopColumns === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3";

  return (
    <section className={`mt-6 grid auto-rows-fr grid-cols-2 items-stretch gap-4 ${desktopGridClass} ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className={`h-full ${stats.length === 3 && index === 2 ? "col-span-2 xl:col-span-1" : ""}`}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.08 + index * 0.08 }}
        >
          <SummaryCard stat={stat} />
        </motion.div>
      ))}
    </section>
  );
}
