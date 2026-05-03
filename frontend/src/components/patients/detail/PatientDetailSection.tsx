"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

interface PatientDetailSectionProps {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
}

export default function PatientDetailSection({ title, description, action, children, className = "", delay = 0 }: PatientDetailSectionProps) {
  return (
    <motion.section
      className={`rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-6 ${className}`}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay }}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-[-0.04em] text-text-main">{title}</h2>
          {description && <p className="mt-1 text-sm font-semibold leading-6 text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}
