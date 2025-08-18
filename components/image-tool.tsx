"use client";

import * as React from "react";
import html2canvas from "html2canvas-pro";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { BrowserBar } from "@/components/image-tool/preview/BrowserBar";
import { PatternOverlay } from "@/components/image-tool/preview/PatternOverlay";
import { GradientWavesBackground } from "@/components/image-tool/preview/GradientWavesBackground";
import { ResizeHandle } from "@/components/image-tool/preview/ResizeHandle";
import { useImageStore, type Options } from "@/lib/store";
import { Frame } from "@/components/image-tool/Frame";
import { shadowMap } from "@/lib/config/shadows";
import { GRID_PARENT_HEIGHT } from "@/lib/config/constants";
import { ImagePlus } from "lucide-react";
import {
  FloatingSuggestionsDock,
  type FloatingSuggestionsDockHandle,
} from "@/components/floating-suggestions-dock";
import type { ScreenshotBlob } from "@/lib/types/image-tool";
import { Sidebar } from "@/components/image-tool/sidebar/Sidebar";

// FrameProps type now lives with the Frame component

// Frame moved to components/image-tool/Frame

// Presets moved to lib/config/presets

// Helpers for hex <-> HSL used by Gradient Waves controls (no external deps)
// Color helpers moved to lib/utils/color

// Shadows moved to lib/config/shadows

// previewSizes moved out; no longer used here

// Constant moved to lib/config/constants

export function ImageTool() {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get state and actions from Zustand store
  const {
    options,
    updateOptions,
    setOutlineSize,
    setOutlineColor,
    resetToDefaults,
  } = useImageStore();

  const outlineSize = options.outlineSize;
  const outlineColor = options.outlineColor;

  const [blob, setBlob] = React.useState<ScreenshotBlob>({ src: "" });
  const [uploadedBlob, setUploadedBlob] = React.useState<Blob | null>(null);
  const [canvasWidth, setCanvasWidth] = React.useState<number>(800);
  const [containerHeight, setContainerHeight] = React.useState<number>(800);
  const [canvasHeight, setCanvasHeight] = React.useState<number>(380);
  const [isResizing, setIsResizing] = React.useState<boolean>(false);
  const [resizeStart, setResizeStart] = React.useState<{
    x: number;
    y: number;
    h: number;
  } | null>(null);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [userResized, setUserResized] = React.useState<boolean>(false);
  // imageElement removed; we only track the uploaded blob
  const suggestionsRef = React.useRef<FloatingSuggestionsDockHandle>(null);
  // Gradient Waves popover auto-size handled within component


  // Keep canvas full width of the grid parent; width adjusts on window/container resize.
  React.useEffect(() => {
    const syncSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setCanvasWidth(Math.max(320, Math.round(rect.width)));
      setContainerHeight(Math.max(320, Math.round(rect.height)));
    };
    syncSize();
    const ro = new ResizeObserver(syncSize);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", syncSize);
    return () => {
      if (containerRef.current) ro.unobserve(containerRef.current);
      window.removeEventListener("resize", syncSize);
      ro.disconnect();
    };
  }, []);

  // Handle drag-resize: only height changes, and clamp to grid parent height.
  React.useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!resizeStart) return;
      let clientY: number;
      if (e instanceof TouchEvent) {
        clientY = e.touches[0]!.clientY;
      } else {
        clientY = (e as MouseEvent).clientY;
      }
      const deltaY = clientY - resizeStart.y;
      const MAX = containerHeight - 24;
      const newH = Math.max(
        200,
        Math.min(MAX, Math.round(resizeStart.h + deltaY))
      );
      setCanvasHeight(newH);
    };
    const onUp = () => setIsResizing(false);
    window.addEventListener("mousemove", onMove as any);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove as any);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove as any);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove as any);
      window.removeEventListener("touchend", onUp);
    };
  }, [isResizing, resizeStart, containerHeight]);

  // Paste to upload
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item) continue;
        if (item.kind === "file" && item.type.includes("image")) {
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = (e2) => {
            if (e2.target && e2.target.result) {
              setBlob({ src: e2.target.result as string });
              setUploadedBlob(file);
              // Auto-fit canvas height to image aspect if user hasn't resized yet
              try {
                const url = URL.createObjectURL(file);
                const img = new Image();
                img.onload = () => {
                  const nw = img.naturalWidth || img.width;
                  const nh = img.naturalHeight || img.height;
                  setBlob((prev) => ({ ...prev, w: nw, h: nh }));
                  if (!userResized && containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const maxH = GRID_PARENT_HEIGHT - 16;
                    const aspect = nh > 0 && nw > 0 ? nh / nw : 9 / 16;
                    const idealH = Math.round(rect.width * aspect);
                    const clampedH = Math.max(200, Math.min(maxH, idealH));
                    setCanvasHeight(clampedH);
                  }
                  URL.revokeObjectURL(url);
                };
                img.onerror = () => URL.revokeObjectURL(url);
                img.src = url;
              } catch {}
            }
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  async function exportOrCopy(target: "download" | "copy") {
    try {
      const element = wrapperRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        onclone: (clonedDoc) => {
          const root = clonedDoc.getElementById(
            "capture-root"
          ) as HTMLElement | null;
          if (!root) return;
          root.querySelectorAll("[data-hide-on-export]").forEach((n) => {
            (n as HTMLElement).style.display = "none";
          });
        },
      });

      if (target === "download") {
        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "beautified.png";
        a.click();
        toast({
          title: "Exported",
          description: "PNG downloaded at 2x scale.",
        });
      } else {
        await new Promise<void>((resolve, reject) =>
          canvas.toBlob(async (blob) => {
            try {
              if (!blob) throw new Error("Failed to create blob");
              // @ts-ignore ClipboardItem is available in modern browsers
              await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob }),
              ]);
              toast({
                title: "Copied",
                description: "Image copied to clipboard (2x).",
              });
              resolve();
            } catch (err) {
              reject(err);
            }
          }, "image/png")
        );
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Action failed",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  }

  const onPaste = (event: React.ClipboardEvent | React.DragEvent | Event) => {
    let items: DataTransferItemList | FileList | null = null;
    if ((event as React.ClipboardEvent).clipboardData) {
      items = (event as React.ClipboardEvent).clipboardData.items;
    } else if ((event as React.DragEvent).dataTransfer) {
      items = (event as React.DragEvent).dataTransfer.files;
    } else if ((event as any).target && (event as any).target.files) {
      items = (event as any).target.files;
    }
    if (!items) return;
    for (let i = 0; i < (items as any).length; i++) {
      const item = (items as any)[i];
      if (
        (item as DataTransferItem).kind === "file" ||
        ((item as File).type && (item as File).type.includes("image"))
      ) {
        const file = (item as DataTransferItem).kind
          ? (item as DataTransferItem).getAsFile()
          : (item as File);
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            setBlob({ src: e.target.result as string });
            setUploadedBlob(file);
            // Try to infer and set canvas height to match aspect ratio once file metadata is available
            // We'll attempt to read intrinsic dimensions efficiently using Image without drawing to canvas.
            try {
              const url = URL.createObjectURL(file);
              const img = new Image();
              img.onload = () => {
                const nw = img.naturalWidth || img.width;
                const nh = img.naturalHeight || img.height;
                // Save dimensions for layout calculation
                setBlob((prev) => ({ ...prev, w: nw, h: nh }));
                // Auto-set height only if user hasn't manually resized yet
                if (!userResized && containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect();
                  const maxH = GRID_PARENT_HEIGHT - 16; // match preview container max height
                  const aspect = nh > 0 && nw > 0 ? nh / nw : 9 / 16;
                  const idealH = Math.round(rect.width * aspect);
                  const clampedH = Math.max(200, Math.min(maxH, idealH));
                  setCanvasHeight(clampedH);
                }
                URL.revokeObjectURL(url);
              };
              img.onerror = () => URL.revokeObjectURL(url);
              img.src = url;
            } catch {}
          }
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  // BrowserBar now provided by components/image-tool/preview/BrowserBar

  const isGradient = options.theme.includes("bg-gradient");

  // Helper to compute effective frame size and scale
  const [wrapperSize, setWrapperSize] = React.useState<{
    w: number;
    h: number;
  }>({ w: 0, h: 0 });

  React.useEffect(() => {
    if (!wrapperRef.current) return;
    const update = () => {
      const r = wrapperRef.current!.getBoundingClientRect();
      setWrapperSize({
        w: Math.max(0, Math.floor(r.width)),
        h: Math.max(0, Math.floor(r.height)),
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrapperRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [blob.src]);

  const padding = 12;
  const availW = Math.max(0, wrapperSize.w - padding);
  const availH = Math.max(0, wrapperSize.h - padding);

  const imgAspect = blob.w && blob.h ? blob.h / blob.w : 9 / 16;
  let baseW = availW;
  let baseH = Math.round(baseW * imgAspect);
  if (baseH > availH) {
    baseH = availH;
    baseW = Math.round(baseH / imgAspect);
  }

  const theta = (options.rotation % 360) * (Math.PI / 180);
  const c = Math.abs(Math.cos(theta));
  const s = Math.abs(Math.sin(theta));
  const rotW = baseW * c + baseH * s;
  const rotH = baseW * s + baseH * c;
  const maxScaleByW = rotW > 0 ? availW / rotW : 1;
  const maxScaleByH = rotH > 0 ? availH / rotH : 1;
  const maxFitScale = Math.max(0, Math.min(maxScaleByW, maxScaleByH));
  const effectiveScale = Math.min(options.screenshotScale, maxFitScale);

  function handleNew() {
    setBlob({ src: "" });
    resetToDefaults();
    setUserResized(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-col pt-1">
      <div className="relative w-full flex justify-between gap-6 items-stretch pb-4">
        {/* Gridline parent: fixed height, does not change with image resizing */}
        <div
          className={cn(
            "relative flex-1 flex items-start justify-center rounded-lg",
            "bg-[size:10px_10px] bg-fixed transition-all duration-200 border border-stone-200",
            "bg-[image:repeating-linear-gradient(315deg,rgba(209,213,219,0.4)_0,rgba(209,213,219,0.4)_1px,_transparent_0,_transparent_50%)]",
            "h-[calc(100vh-6rem)]"
          )}
          ref={containerRef}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!blob.src) setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            onPaste(e);
          }}
          onClick={() => {
            if (!blob.src && fileInputRef.current) fileInputRef.current.click();
          }}
          aria-label="Canvas grid area"
        >
          {blob?.src ? (
            <div
              className="overflow-hidden flex items-center justify-center w-full"
              style={{
                height: Math.min(
                  canvasHeight + outlineSize,
                  containerHeight - 16
                ),
                maxHeight: containerHeight - 16,
              }}
            >
              <div
                ref={wrapperRef}
                id="capture-root"
                className={cn(
                  "w-full h-full",
                  !options.gradientWaves.enabled && isGradient
                    ? options.theme
                    : undefined,
                  options.aspectRatio
                )}
                style={{
                  position: "relative",
                  boxShadow: shadowMap[options.shadow],
                  background:
                    !options.gradientWaves.enabled && !isGradient
                      ? options.theme
                      : undefined,
                }}
              >
                <BrowserBar variant={options.browserBar} />

                {/* Remove this entire div
                <div
                  data-noise
                  style={{
                    backgroundImage: 'url("/noise.png")',
                  }}
                  className={cn("absolute inset-0 w-full h-full bg-repeat opacity-[0.15]", {
                    "rounded-t-none": options.browserBar !== "hidden",
                  })}
                />
                */}

                {/* Pattern overlay (hidden when Gradient Waves are enabled) */}
                {options.pattern.enabled &&
                  options.pattern.type !== "none" &&
                  !options.gradientWaves.enabled && (
                    <PatternOverlay
                      type={options.pattern.type}
                      intensity={options.pattern.intensity}
                      rotation={options.pattern.rotation}
                      opacity={options.pattern.opacity}
                    />
                  )}

                {/* Gradient Waves background (replaces background theme visually; hides pattern) */}
                {options.gradientWaves.enabled && <GradientWavesBackground />}

                {/* Centered screenshot holder */}
                <div
                  className="absolute inset-0 flex items-center justify-center transition-all ease-in-out antialiased"
                  style={{ zIndex: 2 }}
                >
                  <div
                    style={{
                      width: baseW,
                      willChange: "transform",
                      borderRadius: `${options.rounded}px`,
                      transition: "400ms cubic-bezier(0.03, 0.98, 0.52, 0.99)",
                      transform: `scale(${effectiveScale}) rotate(${options.rotation}deg)`,
                      transformOrigin: "center center",
                      boxShadow: shadowMap[options.shadow],
                    }}
                  >
                    {/* Remove this entire div
                    {options.reflection && (
                      <div
                        className="pointer-events-none absolute inset-0 z-20"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0) 60%)",
                          borderRadius: `${options.rounded}px`,
                          mixBlendMode: "screen",
                        }}
                      />
                    )}
                    */}

                    <Frame
                      backgroundColor={outlineColor}
                      borderRadius={options.rounded}
                      type={options.frame}
                    >
                      <div
                        className="relative transition-all ease-in-out"
                        style={{
                          overflow: "hidden",
                          borderRadius: `${options.rounded}px`,
                          boxShadow: shadowMap[options.shadow],
                          background: outlineColor,
                          border: `${outlineSize}px solid ${outlineColor}`,
                          transition:
                            "border 400ms cubic-bezier(0.03, 0.98, 0.52, 0.99)",
                        }}
                      >
                        <img
                          crossOrigin="anonymous"
                          src={
                            blob.src ||
                            "/placeholder.svg?height=800&width=1200&query=Screenshot%20placeholder"
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            display: "block",
                          }}
                          alt="Screenshot preview"
                          onLoad={(e) => {
                            const target = e.currentTarget;
                            const nw = target.naturalWidth;
                            const nh = target.naturalHeight;
                            setBlob((prev) => ({ ...prev, w: nw, h: nh }));
                            setUserResized(true);
                            // Imperatively trigger AI suggestion generation (prefer original blob)
                            queueMicrotask(() =>
                              suggestionsRef.current?.generate({
                                blob: uploadedBlob,
                              })
                            );
                          }}
                        />
                      </div>
                    </Frame>
                  </div>
                </div>

                {/* Resize handle (height only) */}
                <ResizeHandle
                  ariaValueNow={canvasHeight}
                  ariaValueMin={200}
                  ariaValueMax={containerHeight - 24}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsResizing(true);
                    setResizeStart({ x: e.clientX, y: e.clientY, h: canvasHeight });
                    setUserResized(true);
                  }}
                  onTouchStart={(e) => {
                    if (e.touches.length === 1) {
                      setIsResizing(true);
                      setResizeStart({ x: e.touches[0]!.clientX, y: e.touches[0]!.clientY, h: canvasHeight });
                      setUserResized(true);
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "flex flex-col items-center justify-center p-12 border bg-white border-stone-200 rounded-xl cursor-pointer hover:border-stone-300 transition-all duration-300 w-full"
              )}
              style={{ height: containerHeight - 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <label
                htmlFor="screenshot-upload"
                className="cursor-pointer w-full"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <ImagePlus
                    className={cn("size-6 text-stone-300", {
                      "text-rose-500": isDragging,
                    })}
                  />
                  <div className="space-y-3">
                    <h3 className="text-xl font-medium text-stone-800">
                      {isDragging ? "Drop your image here" : "Add an image"}
                    </h3>
                    <p className="text-sm text-stone-500 max-w-sm">
                      Drag & drop, paste, or click to upload.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <span className="px-2 py-1 rounded-md bg-stone-100">
                      ⌘V
                    </span>
                    <span>to paste</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  id="screenshot-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPaste as any}
                />
              </label>
            </div>
          )}
        </div>

        {/* Right Controls */}
  <Sidebar
          visible={Boolean(blob.src)}
          options={options}
          outlineSize={outlineSize}
          outlineColor={outlineColor}
          updateOptions={updateOptions}
          setOutlineSize={setOutlineSize}
          setOutlineColor={setOutlineColor}
          handleNew={handleNew}
          exportOrCopy={exportOrCopy}
        />

        {/* Floating Suggestions Dock */}
        <FloatingSuggestionsDock
          ref={suggestionsRef}
          imageBlob={uploadedBlob}
          isVisible={Boolean(blob.src)}
        />
      </div>
    </div>
  );
}
