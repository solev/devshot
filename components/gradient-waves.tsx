"use client";
import * as React from "react";
import chroma from "chroma-js";
import { useImageStore } from "@/lib/store";

// Renders the gradient waves as an absolutely positioned SVG filling parent.
// It uses options.gradientWaves configuration from the store.
export function GradientWaves() {
  const { options } = useImageStore();
  const gw = options.gradientWaves;

  const ref = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
  const svgEl = ref.current;
  if (!svgEl) return;
  const s = svgEl as SVGSVGElement;

    // Clear
  while (s.firstChild) s.removeChild(s.firstChild);

    if (!gw.enabled) return;

  const winW = s.clientWidth || s.parentElement?.clientWidth || 1200;
  const winH = s.clientHeight || s.parentElement?.clientHeight || 800;

    const overflow = Math.abs(gw.lines * gw.offsetX);

    const startColor = `hsl(${gw.start.h}, ${gw.start.s}%, ${gw.start.l}%)`;
    const endColor = `hsl(${gw.end.h}, ${gw.end.s}%, ${gw.end.l}%)`;
    const Colors = chroma
      .scale([startColor, endColor])
      .mode("lch")
      .colors(gw.lines + 2);

    // Background
  s.style.backgroundColor = gw.fill ? Colors[0] : "#000";

    // Helper create path from roots
    function createPath(root: Array<{ x: number; y: number }>, color: string) {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      if (gw.fill) {
        path.setAttribute("fill", color);
        path.setAttribute("stroke", color);
      } else {
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", "1");
      }

      let d = `M -${overflow} ${winH + overflow}`;
      d += ` L ${root[0].x} ${root[0].y}`;

      for (let i = 1; i < root.length - 1; i++) {
        const prevPoint = root[i - 1];
        const actualPoint = root[i];
        const diffX = (actualPoint.x - prevPoint.x) / gw.smoothness;
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
  s.appendChild(path);
    }

    // Build lines
    const paths: Array<{
      root: Array<{ x: number; y: number }>;
      color: string;
    }>[] = [] as any;

    for (let i = 0; i < gw.lines + 1; i++) {
      const rootY = Math.floor((winH / gw.lines) * i);
      const root: Array<{ x: number; y: number }> = [];
      let x = -overflow + gw.offsetX * i;
      let y = 0;
      let upSideDown = 0;
      root.push({ x, y: rootY });

      while (x < winW) {
        if (gw.crazyness) {
          x += Math.floor(
            (Math.random() * gw.amplitudeX) / 2 + gw.amplitudeX / 2
          );
          const value = Math.random() > 0.5 ? 1 : -1;
          y =
            Math.floor(
              (Math.random() * gw.amplitudeY) / 2 + gw.amplitudeY / 2
            ) *
              value +
            rootY;
        } else {
          upSideDown = upSideDown ? 0 : 1;
          const value = upSideDown === 0 ? 1 : -1;
          x += gw.amplitudeX;
          y = gw.amplitudeY * value + rootY;
        }
        root.push({ x, y });
      }

      root.push({ x: winW + overflow, y: rootY });

  createPath(root, Colors[i + 1]);
    }
  }, [options]);

  if (!gw.enabled) return null;

  return (
    <svg ref={ref} className="absolute inset-0 w-full h-full" aria-hidden role="img" />
  );
}
