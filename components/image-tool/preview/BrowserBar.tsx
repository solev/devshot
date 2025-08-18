"use client";
import * as React from "react";

export type BrowserBarVariant = "hidden" | "light" | "dark";

export function BrowserBar({ variant }: { variant: BrowserBarVariant }) {
  if (variant === "hidden") return null;
  const base =
    variant === "light"
      ? "bg-white/80"
      : variant === "dark"
      ? "bg-black/40"
      : "";
  return (
    <div className={`flex items-center w-full px-4 py-[10px] rounded-t-lg ${base}`}>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-400 rounded-full" />
        <div className="w-3 h-3 bg-yellow-300 rounded-full" />
        <div className="w-3 h-3 bg-green-500 rounded-full" />
      </div>
    </div>
  );
}
