"use client";
import * as React from "react";
import chroma from "chroma-js";
import type { Options } from "@/lib/store";

export function GradientWavesPreview({ 
  gradientWaves, 
  width = 28, 
  height = 28,
  className 
}: { 
  gradientWaves: Options["gradientWaves"];
  width?: number;
  height?: number;
  className?: string;
}) {
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || !gradientWaves.enabled) return;

    // Clear previous content
    while (svgEl.firstChild) {
      svgEl.removeChild(svgEl.firstChild);
    }

    const winW = width;
    const winH = height;
    
    // Scale down parameters for preview
    const previewLines = Math.max(2, Math.floor(gradientWaves.lines / 4));
    const previewAmplitudeX = Math.max(8, gradientWaves.amplitudeX / 4);
    const previewAmplitudeY = Math.max(2, gradientWaves.amplitudeY / 4);
    const overflow = Math.abs(previewLines * (gradientWaves.offsetX / 4));

    const startColor = `hsl(${gradientWaves.start.h}, ${gradientWaves.start.s}%, ${gradientWaves.start.l}%)`;
    const endColor = `hsl(${gradientWaves.end.h}, ${gradientWaves.end.s}%, ${gradientWaves.end.l}%)`;
    const colors = chroma
      .scale([startColor, endColor])
      .mode("lch")
      .colors(previewLines + 2);

    // Set background
    svgEl.style.backgroundColor = gradientWaves.fill ? colors[0] : "#000";

    // Helper to create path
    function createPath(root: Array<{ x: number; y: number }>, color: string) {
      if (!svgEl) return;
      
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      
      if (gradientWaves.fill) {
        path.setAttribute("fill", color);
        path.setAttribute("stroke", color);
      } else {
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", "0.5");
      }

      let d = `M -${overflow} ${winH + overflow}`;
      d += ` L ${root[0].x} ${root[0].y}`;

      for (let i = 1; i < root.length - 1; i++) {
        const prevPoint = root[i - 1];
        const actualPoint = root[i];
        const diffX = (actualPoint.x - prevPoint.x) / gradientWaves.smoothness;
        const x1 = prevPoint.x + diffX;
        const x2 = actualPoint.x - diffX;
        const x = actualPoint.x;
        const y1 = prevPoint.y;
        const y2 = actualPoint.y;
        const y = actualPoint.y;
        d += ` C ${x1} ${y1}, ${x2} ${y2}, ${x} ${y}`;
      }

      const reverseRoot = [...root].reverse();
      d += ` L ${reverseRoot[0].x} ${reverseRoot[0].y}`;
      d += ` L ${winW + overflow} ${winH + overflow}`;
      d += ` Z`;

      path.setAttribute("d", d);
      svgEl.appendChild(path);
    }

    // Build simplified wave lines for preview
    for (let i = 0; i < previewLines + 1; i++) {
      const rootY = Math.floor((winH / previewLines) * i);
      const root: Array<{ x: number; y: number }> = [];
      let x = -overflow + (gradientWaves.offsetX / 4) * i;
      let upSideDown = 0;
      root.push({ x, y: rootY });

      while (x < winW) {
        if (gradientWaves.crazyness) {
          x += Math.floor((Math.random() * previewAmplitudeX) / 2 + previewAmplitudeX / 2);
          const value = Math.random() > 0.5 ? 1 : -1;
          const y = Math.floor((Math.random() * previewAmplitudeY) / 2 + previewAmplitudeY / 2) * value + rootY;
          root.push({ x, y });
        } else {
          upSideDown = upSideDown ? 0 : 1;
          const value = upSideDown === 0 ? 1 : -1;
          x += previewAmplitudeX;
          const y = previewAmplitudeY * value + rootY;
          root.push({ x, y });
        }
      }

      root.push({ x: winW + overflow, y: rootY });
      createPath(root, colors[i + 1]);
    }
  }, [gradientWaves, width, height]);

  if (!gradientWaves.enabled) {
    return (
      <div className={className} style={{ width, height }}>
        <span className="text-stone-400 text-xs">Off</span>
      </div>
    );
  }

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height} 
      className={className}
      style={{ display: 'block' }}
      aria-hidden 
      role="img" 
    />
  );
}
