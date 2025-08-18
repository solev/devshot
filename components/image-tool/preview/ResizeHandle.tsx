"use client";
import * as React from "react";

export function ResizeHandle({
  onMouseDown,
  onTouchStart,
  ariaValueNow,
  ariaValueMin,
  ariaValueMax,
}: {
  onMouseDown: React.MouseEventHandler<HTMLDivElement>;
  onTouchStart: React.TouchEventHandler<HTMLDivElement>;
  ariaValueNow: number;
  ariaValueMin: number;
  ariaValueMax: number;
}) {
  return (
    <div
      data-hide-on-export
      tabIndex={0}
      role="slider"
      aria-label="Resize height"
      aria-valuenow={ariaValueNow}
      aria-valuemin={ariaValueMin}
      aria-valuemax={ariaValueMax}
      className="absolute bottom-2 right-2 size-4 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center cursor-nwse-resize z-50 shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 select-none touch-none"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    />
  );
}
