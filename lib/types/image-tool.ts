export type PatternType =
  | "waves"
  | "dots"
  | "stripes"
  | "zigzag"
  | "graphpaper"
  | "none";

export type ScreenshotBlob = { src: string; w?: number; h?: number };

export type HSLTriplet = { h: number; s: number; l: number };
