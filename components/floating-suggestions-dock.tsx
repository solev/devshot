/* eslint-disable */
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { PatternType, useImageStore } from "@/lib/store";
import {
  Sparkles,
  Wand2,
  Zap,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { SuggestionSchema } from "@/lib/schemas";

interface FloatingSuggestionsDockProps {
  imageBlob?: Blob | null;
  isVisible: boolean;
}

export interface FloatingSuggestionsDockHandle {
  /** Imperatively (re)generate AI + fallback suggestions. Prefer blob when available. */
  generate: (opts?: { force?: boolean; blob?: Blob | null }) => void;
}

export const FloatingSuggestionsDock = React.forwardRef<
  FloatingSuggestionsDockHandle,
  FloatingSuggestionsDockProps
>(function FloatingSuggestionsDockInner({ imageBlob, isVisible }, ref) {
  const { toast } = useToast();
  const { updateOptions, setOutlineSize } = useImageStore();

  const [selectedSuggestion, setSelectedSuggestion] =
    React.useState<string>("");
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isDockVisible, setIsDockVisible] = React.useState(true);

  const { object, submit, isLoading, error, stop } = useObject({
    api: "/api/ai/suggestions",
    schema: SuggestionSchema,
  });

  const suggestions = object?.suggestions ?? [];

  const inFlightRef = React.useRef(false);
  const lastRunRef = React.useRef(0);
  async function blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read blob"));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  const runGeneration = React.useCallback(
    async (opts?: { force?: boolean; blob?: Blob | null }) => {
      const providedBlob = opts?.blob ?? imageBlob ?? null;
      if (!providedBlob) return;
      if (!isVisible) return;
      const now = Date.now();
      if (inFlightRef.current) {
        if (!opts?.force) return;
        try {
          stop?.();
        } catch {}
      } else if (!opts?.force && now - lastRunRef.current < 2000) {
        return;
      }
      inFlightRef.current = true;
      lastRunRef.current = now;
      setSelectedSuggestion("");
      // Start AI streaming. We only use the blob -> dataURL to send to the API.
      try {
        const imageData = await blobToDataURL(providedBlob);
        try {
          stop?.();
        } catch {}
        submit({
          imageData,
          currentSettings: {
            theme: useImageStore.getState().options.theme,
            screenshotScale: useImageStore.getState().options.screenshotScale,
            rounded: useImageStore.getState().options.rounded,
            shadow: useImageStore.getState().options.shadow,
            frame: useImageStore.getState().options.frame,
            pattern: useImageStore.getState().options.pattern,
            browserBar: useImageStore.getState().options.browserBar,
            outlineSize: useImageStore.getState().options.outlineSize,
          },
        } as any);
        setIsExpanded(true);
      } catch (err) {
        console.error("Failed to start AI suggestions stream", err);
        toast({
          title: "AI suggestions failed",
          description: "Falling back to smart color suggestions.",
          variant: "destructive",
        });
      } finally {
        inFlightRef.current = false;
      }
    },
    [imageBlob, isVisible, submit, toast, stop]
  );

  // Expose imperative generate method
  React.useImperativeHandle(ref, () => ({ generate: runGeneration }), [
    runGeneration,
  ]);

  const applySuggestion = (suggestion: (typeof suggestions)[number]) => {
    updateOptions({
      theme: suggestion?.settings?.theme,
      screenshotScale: suggestion?.settings?.screenshotScale,
      rounded: suggestion?.settings?.rounded,
      shadow: suggestion?.settings?.shadow,
      frame: suggestion?.settings?.frame,
      pattern: {
        type: suggestion?.settings?.pattern?.type as PatternType,        
        opacity: suggestion?.settings?.pattern?.opacity ?? 1,
        enabled: false,
        intensity: suggestion?.settings?.pattern?.intensity ?? 1,
        rotation: suggestion?.settings?.pattern?.rotation ?? 0,
      },
      browserBar: suggestion?.settings?.browserBar,
    });
    if (suggestion?.settings?.outlineSize) {
      setOutlineSize(suggestion?.settings?.outlineSize);
    }
    toast({
      title: "Style applied!",
      description: `Applied "${suggestion?.name}" styling to your screenshot.`,
    });
  };

  const regenerateSuggestions = async () => {
    if (!imageBlob) return;
    runGeneration({ force: true });
    toast({
      title: "Regenerating",
      description: "Streaming fresh AI suggestions...",
    });
  };

  if (!isVisible || !isDockVisible) return null;
  const loading = isLoading;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <Card className="bg-white/95 backdrop-blur-md border border-stone-200/50 shadow-2xl rounded-2xl overflow-hidden">
        {/* Collapsed State */}
        {!isExpanded && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm text-stone-800">
                  Smart Suggestions
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-purple-100 text-purple-700"
                >
                  AI
                </Badge>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <Badge variant="outline" className="text-xs">
                  {suggestions.length} suggestions ready
                </Badge>
              ) : (
                <span className="text-xs text-stone-500">
                  Upload an image to get suggestions
                </span>
              )}

              <div className="flex items-center gap-1 ml-auto">
                {suggestions.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={regenerateSuggestions}
                    disabled={loading}
                    className="h-7 px-2"
                  >
                    <RefreshCw
                      className={cn("h-3 w-3", loading && "animate-spin")}
                    />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  disabled={suggestions.length === 0 && !loading}
                  className="h-7 px-2"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDockVisible(false)}
                  className="h-7 px-2 text-stone-400 hover:text-stone-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Expanded State */}
        {isExpanded && (
          <div className="p-4 max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm text-stone-800">
                  Smart Suggestions
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-purple-100 text-purple-700"
                >
                  AI-Powered
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={regenerateSuggestions}
                  disabled={loading}
                  className="h-7 px-2 text-xs"
                >
                  <RefreshCw
                    className={cn("h-3 w-3 mr-1", loading && "animate-spin")}
                  />
                  Refresh
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-7 px-2"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDockVisible(false)}
                  className="h-7 px-2 text-stone-400 hover:text-stone-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {suggestions.length > 0 ? (
              <div>
                <p className="text-xs text-stone-500 mb-3">
                  Based on your image's colors and style, here are perfect
                  matches:
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {suggestions.map((suggestion) => (
                    <Card
                      key={suggestion?.name}
                      className={cn(
                        "flex-shrink-0 w-64 p-3 cursor-pointer transition-all hover:shadow-lg border-2",
                        selectedSuggestion === suggestion?.name
                          ? "border-purple-400 bg-purple-50"
                          : "border-stone-200 hover:border-stone-300"
                      )}
                      onClick={() => applySuggestion(suggestion)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm text-stone-800">
                              {suggestion?.name}
                            </h3>
                            <div className="flex items-center gap-1">
                              {suggestion?.confidence! > 0.8 && (
                                <Sparkles className="h-3 w-3 text-yellow-500" />
                              )}
                              {suggestion?.confidence! > 0.7 && (
                                <Zap className="h-3 w-3 text-blue-500" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-stone-600 mb-2 line-clamp-2">
                            {suggestion?.description}
                          </p>
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line */}
                            <div
                              className={cn(
                                "w-6 h-4 rounded-sm border border-stone-200",
                                suggestion?.settings?.theme?.includes(
                                  "bg-gradient"
                                )
                                  ? suggestion.settings.theme
                                  : undefined
                              )}
                              style={{
                                background:
                                  !suggestion?.settings?.theme?.includes(
                                    "bg-gradient"
                                  )
                                    ? suggestion?.settings?.theme
                                    : undefined,
                              }}
                            />
                            <div className="flex items-center gap-1 text-xs text-stone-500">
                              <span>•</span>
                              <span>
                                {suggestion?.settings?.frame === "none"
                                  ? "No frame"
                                  : `${suggestion?.settings?.frame} frame`}
                              </span>
                              <span>•</span>
                              <span>
                                {suggestion?.settings?.shadow}x shadow
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {suggestion?.confidence != null && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                suggestion.confidence > 0.8
                                  ? "border-green-300 text-green-700"
                                  : suggestion.confidence > 0.6
                                  ? "border-blue-300 text-blue-700"
                                  : "border-stone-300 text-stone-600"
                              )}
                            >
                              {Math.round(suggestion.confidence * 100)}%
                            </Badge>
                          )}
                          {selectedSuggestion === suggestion?.name && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-stone-500">
                <Wand2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  Upload an image to get smart styling suggestions
                </p>
                {error && (
                  <p className="text-xs text-red-500 mt-2">
                    AI error: {error.message}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Restore dock button when hidden */}
      {!isDockVisible && isVisible && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsDockVisible(true)}
          className="fixed bottom-6 right-6 rounded-full shadow-lg"
        >
          <Wand2 className="h-4 w-4 mr-1" />
          Smart Suggestions
        </Button>
      )}
    </div>
  );
});
