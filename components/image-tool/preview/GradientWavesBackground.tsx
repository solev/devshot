"use client";
import * as React from "react";
import { GradientWaves } from "@/components/gradient-waves";

export function GradientWavesBackground() {
  return (
  <div className="absolute inset-0 z-0">
      <GradientWaves />
    </div>
  );
}
