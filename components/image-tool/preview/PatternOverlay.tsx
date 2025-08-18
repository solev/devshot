"use client";
import * as React from "react";

export function PatternOverlay({
  type,
  intensity,
  rotation,
  opacity,
}: {
  type: string;
  intensity: number;
  rotation: number;
  opacity: number;
}) {
  if (type === "none") return null;
  return (
    <div
      className="w-full h-full absolute inset-0 overflow-hidden pointer-events-none mix-blend-luminosity z-[1]"
      style={{ opacity: opacity / 100 }}
      aria-hidden="true"
    >
  {/* eslint-disable-next-line */}
  <div
        className="w-full h-full absolute inset-0"
        style={{
          backgroundImage: `url("/pattern/${type}.svg")`,
          backgroundRepeat: "repeat",
          backgroundSize: `${intensity}%`,
          transform: `rotate(${rotation}deg) scale(2)`,
          imageRendering: "crisp-edges" as any,
        }}
      />
    </div>
  );
}
