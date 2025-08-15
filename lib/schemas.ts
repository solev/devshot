import { z } from 'zod';

export const SuggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      reasoning: z.string().optional(),
      confidence: z.number().min(0).max(1),
      settings: z.object({
        theme: z.string(),
        screenshotScale: z.number().min(0.5).max(1.5),
        rounded: z.number().min(0).max(32),
        shadow: z.number().min(0).max(4),
        frame: z.enum(['none', 'arc', 'stack']),
        pattern: z.object({
          enabled: z.boolean(),
          type: z.enum(['waves', 'dots', 'stripes', 'zigzag', 'graphpaper', 'none']),
          intensity: z.number().min(1).max(100),
          opacity: z.number().min(0).max(35),
          rotation: z.number().min(0).max(360),
        }),
        browserBar: z.enum(['hidden', 'light', 'dark']),
        outlineSize: z.number().min(0).max(100),
      }),
    }),
  ),
});

export type SuggestionResponse = z.infer<typeof SuggestionSchema>;
export type AISuggestion = SuggestionResponse['suggestions'][number];
