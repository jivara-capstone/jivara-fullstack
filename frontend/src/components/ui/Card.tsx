"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export default function Card({
  children,
  className = "",
  title,
  description,
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-3xl p-8 shadow-md border border-line/50 ${className}`}
      
    >
      {title && (
        <h3 className="font-display text-xl font-bold text-dark mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-muted text-sm mb-5">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
