"use client"

import * as React from "react"
import html2canvas from "html2canvas-pro"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { EnhancedSlider } from "@/components/enhanced-slider"
import { useImageStore, type Options } from "@/lib/store"
import { Grip, ImagePlus } from "lucide-react"
import { FloatingSuggestionsDock } from "@/components/floating-suggestions-dock"
import GradientWaves from "./gradient-waves"

type PatternType = "waves" | "dots" | "stripes" | "zigzag" | "graphpaper" | "gradientwaves" | "none"
type ScreenshotBlob = { src: string; w?: number; h?: number }

type FrameProps = React.PropsWithChildren<{
  type: "none" | "arc" | "stack"
  backgroundColor: string
  borderRadius: number
}>

const Frame = ({ type, borderRadius, backgroundColor, children }: FrameProps) => {
  if (type === "arc") {
    return (
      <div className="relative pointer-events-none">
        <div
          style={{
            borderRadius: borderRadius + 7,
            boxShadow: "rgba(0, 0, 0, 0.22) 0px 18px 88px -4px, rgba(0, 0, 0, 0.22) 0px 8px 28px -6px",
            backgroundColor: "rgba(255, 255, 255, 0.314)",
            zIndex: 2,
            border: "1px solid rgba(255, 255, 255, 0.376)",
            padding: "7px",
          }}
        >
          {children}
        </div>
      </div>
    )
  }
  if (type === "stack") {
    return (
      <div className="relative pointer-events-none">
        <div className="absolute inset-0">
          {Array.from({ length: 3 }).map((_, index) => {
            const reverseIndex = 3 - index - 1
            const translateY = reverseIndex * -10
            const scale = 1 - reverseIndex * 0.06
            const opacity = Math.pow(0.8, reverseIndex)
            return (
              <div
                key={index}
                className="absolute w-full"
                style={{
                  height: borderRadius,
                  borderTopLeftRadius: borderRadius,
                  borderTopRightRadius: borderRadius,
                  backgroundColor,
                  transform: `translateY(${translateY}px) scaleX(${scale})`,
                  transformOrigin: "top center",
                  opacity,
                  clipPath: "inset(0 0 calc(100% - 10px) 0)",
                }}
              />
            )
          })}
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    )
  }
  return <>{children}</>
}

const gradientPresets: string[] = [
  "bg-gradient-to-br from-rose-300 to-orange-400",
  "bg-gradient-to-br from-amber-300 to-rose-400",
  "bg-gradient-to-br from-emerald-300 to-teal-400",
  "bg-gradient-to-br from-fuchsia-300 to-purple-400",
  "bg-gradient-to-br from-stone-900 to-stone-950",
  "bg-gradient-to-br from-stone-50 to-stone-100",
  "bg-gradient-to-br from-lime-300 to-emerald-400",
  "bg-gradient-to-br from-pink-300 to-rose-500",
  "bg-gradient-to-br from-orange-300 to-red-400",
  "bg-gradient-to-br from-purple-300 to-fuchsia-400",
]

const solidPresets: string[] = [
  "#111827",
  "#1f2937",
  "#374151",
  "#4b5563",
  "#f9fafb",
  "#f3f4f6",
  "#e5e7eb",
  "#fef3c7",
  "#fff1f2",
  "#ecfccb",
]

const shadowMap: Record<number, string> = {
  0: "none",
  1: "rgba(0, 0, 0, 0.1) 0px 0px 10px",
  2: "rgba(0, 0, 0, 0.15) 0px 10px 35px 0px",
  3: "rgba(0, 0, 0, 0.2) 0px 20px 40px 0px",
  4: "rgba(0, 0, 0, 0.25) 0px 25px 45px 0px",
}

const previewSizes: Record<Exclude<PatternType, "none">, string> = {
  waves: "250%",
  dots: "250%",
  stripes: "25%",
  zigzag: "25%",
  graphpaper: "225%",
  gradientwaves: "100%",
}

const GRID_PARENT_HEIGHT = 800

export function ImageTool() {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Get state and actions from Zustand store
  const { options, outlineSize, outlineColor, updateOptions, setOutlineSize, setOutlineColor, resetToDefaults } =
    useImageStore()

  const [blob, setBlob] = React.useState<ScreenshotBlob>({ src: "" })
  const [canvasWidth, setCanvasWidth] = React.useState<number>(800)
  const [canvasHeight, setCanvasHeight] = React.useState<number>(380)
  const [isResizing, setIsResizing] = React.useState<boolean>(false)
  const [resizeStart, setResizeStart] = React.useState<{ x: number; y: number; h: number } | null>(null)
  const [isDragging, setIsDragging] = React.useState<boolean>(false)
  const [userResized, setUserResized] = React.useState<boolean>(false)
  const [imageElement, setImageElement] = React.useState<HTMLImageElement | null>(null)

  // Keep canvas full width of the grid parent; width adjusts on window/container resize.
  React.useEffect(() => {
    const syncWidth = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setCanvasWidth(Math.max(320, Math.round(rect.width)))
    }
    syncWidth()
    const ro = new ResizeObserver(syncWidth)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener("resize", syncWidth)
    return () => {
      if (containerRef.current) ro.unobserve(containerRef.current)
      window.removeEventListener("resize", syncWidth)
      ro.disconnect()
    }
  }, [])

  // Handle drag-resize: only height changes, and clamp to grid parent height.
  React.useEffect(() => {
    if (!isResizing) return
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!resizeStart) return
      let clientY: number
      if (e instanceof TouchEvent) {
        clientY = e.touches[0]!.clientY
      } else {
        clientY = (e as MouseEvent).clientY
      }
      const deltaY = clientY - resizeStart.y
      const MAX = GRID_PARENT_HEIGHT - 24
      const newH = Math.max(200, Math.min(MAX, Math.round(resizeStart.h + deltaY)))
      setCanvasHeight(newH)
    }
    const onUp = () => setIsResizing(false)
    window.addEventListener("mousemove", onMove as any)
    window.addEventListener("mouseup", onUp)
    window.addEventListener("touchmove", onMove as any)
    window.addEventListener("touchend", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove as any)
      window.removeEventListener("mouseup", onUp)
      window.removeEventListener("touchmove", onMove as any)
      window.removeEventListener("touchend", onUp)
    }
  }, [isResizing, resizeStart])

  // Paste to upload
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (!item) continue
        if (item.kind === "file" && item.type.includes("image")) {
          const file = item.getAsFile()
          if (!file) continue
          const reader = new FileReader()
          reader.onload = (e2) => {
            if (e2.target && e2.target.result) {
              setBlob({ src: e2.target.result as string })
            }
          }
          reader.readAsDataURL(file)
          break
        }
      }
    }
    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [])

  async function exportOrCopy(target: "download" | "copy") {
    try {
      const element = wrapperRef.current
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        onclone: (clonedDoc) => {
          const root = clonedDoc.getElementById("capture-root") as HTMLElement | null
          if (!root) return
          root.querySelectorAll("[data-hide-on-export]").forEach((n) => {
            ;(n as HTMLElement).style.display = "none"
          })
        },
      })

      if (target === "download") {
        const dataUrl = canvas.toDataURL("image/png")
        const a = document.createElement("a")
        a.href = dataUrl
        a.download = "beautified.png"
        a.click()
        toast({ title: "Exported", description: "PNG downloaded at 2x scale." })
      } else {
        await new Promise<void>((resolve, reject) =>
          canvas.toBlob(async (blob) => {
            try {
              if (!blob) throw new Error("Failed to create blob")
              // @ts-ignore ClipboardItem is available in modern browsers
              await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
              toast({ title: "Copied", description: "Image copied to clipboard (2x)." })
              resolve()
            } catch (err) {
              reject(err)
            }
          }, "image/png"),
        )
      }
    } catch (e) {
      console.error(e)
      toast({ title: "Action failed", description: "Something went wrong.", variant: "destructive" })
    }
  }

  const onPaste = (event: React.ClipboardEvent | React.DragEvent | Event) => {
    let items: DataTransferItemList | FileList | null = null
    if ((event as React.ClipboardEvent).clipboardData) {
      items = (event as React.ClipboardEvent).clipboardData.items
    } else if ((event as React.DragEvent).dataTransfer) {
      items = (event as React.DragEvent).dataTransfer.files
    } else if ((event as any).target && (event as any).target.files) {
      items = (event as any).target.files
    }
    if (!items) return
    for (let i = 0; i < (items as any).length; i++) {
      const item = (items as any)[i]
      if (
        (item as DataTransferItem).kind === "file" ||
        ((item as File).type && (item as File).type.includes("image"))
      ) {
        const file = (item as DataTransferItem).kind ? (item as DataTransferItem).getAsFile() : (item as File)
        if (!file) continue
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target && e.target.result) setBlob({ src: e.target.result as string })
        }
        reader.readAsDataURL(file)
        break
      }
    }
  }

  const renderBrowserBar = () => {
    if (options.browserBar === "light") {
      return (
        <div className="flex items-center w-full px-4 py-[10px] rounded-t-lg bg-white/80">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full" />
            <div className="w-3 h-3 bg-yellow-300 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
        </div>
      )
    }
    if (options.browserBar === "dark") {
      return (
        <div className="flex items-center w-full px-4 py-[10px] rounded-t-lg bg-black/40">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full" />
            <div className="w-3 h-3 bg-yellow-300 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
        </div>
      )
    }
    return null
  }

  const isGradient = options.theme.includes("bg-gradient")

  // Helper to compute effective frame size and scale
  const [wrapperSize, setWrapperSize] = React.useState<{ w: number; h: number }>({ w: 0, h: 0 })

  React.useEffect(() => {
    if (!wrapperRef.current) return
    const update = () => {
      const r = wrapperRef.current!.getBoundingClientRect()
      setWrapperSize({ w: Math.max(0, Math.floor(r.width)), h: Math.max(0, Math.floor(r.height)) })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(wrapperRef.current)
    window.addEventListener("resize", update)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [blob.src])

  const padding = 12
  const availW = Math.max(0, wrapperSize.w - padding)
  const availH = Math.max(0, wrapperSize.h - padding)

  const imgAspect = blob.w && blob.h ? blob.h / blob.w : 9 / 16
  let baseW = availW
  let baseH = Math.round(baseW * imgAspect)
  if (baseH > availH) {
    baseH = availH
    baseW = Math.round(baseH / imgAspect)
  }

  const theta = (options.rotation % 360) * (Math.PI / 180)
  const c = Math.abs(Math.cos(theta))
  const s = Math.abs(Math.sin(theta))
  const rotW = baseW * c + baseH * s
  const rotH = baseW * s + baseH * c
  const maxScaleByW = rotW > 0 ? availW / rotW : 1
  const maxScaleByH = rotH > 0 ? availH / rotH : 1
  const maxFitScale = Math.max(0, Math.min(maxScaleByW, maxScaleByH))
  const effectiveScale = Math.min(options.screenshotScale, maxFitScale)

  function handleNew() {
    setBlob({ src: "" })
    resetToDefaults()
    setUserResized(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="flex flex-col pt-1">
      <div className="relative w-full flex justify-between gap-6">
        {/* Gridline parent: fixed height, does not change with image resizing */}
        <div
          className={cn(
            "relative flex-1 flex items-start justify-center rounded-lg",
            "bg-[size:10px_10px] bg-fixed transition-all duration-200 border border-stone-200",
            "bg-[image:repeating-linear-gradient(315deg,rgba(209,213,219,0.4)_0,rgba(209,213,219,0.4)_1px,_transparent_0,_transparent_50%)]",
          )}
          ref={containerRef}
          style={{ height: GRID_PARENT_HEIGHT }}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!blob.src) setIsDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)
            onPaste(e)
          }}
          onClick={() => {
            if (!blob.src && fileInputRef.current) fileInputRef.current.click()
          }}
          aria-label="Canvas grid area"
        >
          {blob?.src ? (
            <div
              className="overflow-hidden flex items-center justify-center w-full"
              style={{
                height: Math.min(canvasHeight + outlineSize, GRID_PARENT_HEIGHT - 16),
                maxHeight: GRID_PARENT_HEIGHT - 16,
              }}
            >
              <div
                ref={wrapperRef}
                id="capture-root"
                className={cn("w-full h-full", isGradient ? options.theme : undefined, options.aspectRatio)}
                style={{
                  position: "relative",
                  boxShadow: shadowMap[options.shadow],
                  background: !isGradient ? options.theme : undefined,
                }}
              >
                {renderBrowserBar()}

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

                {options.pattern.enabled && options.pattern.type !== "none" && (
                  <div
                    className="w-full h-full absolute inset-0 overflow-hidden"
                    style={{
                      zIndex: 1,
                      pointerEvents: "none",
                      opacity: options.pattern.opacity / 100,
                      mixBlendMode: options.pattern.type === "gradientwaves" ? "normal" : "luminosity",
                    }}
                  >
                    {options.pattern.type === "gradientwaves" ? (
                      <GradientWaves
                        lines={15}
                        amplitudeX={100}
                        amplitudeY={20}
                        offsetX={10}
                        smoothness={3}
                        hueStart={53}
                        saturationStart={74}
                        lightnessStart={67}
                        hueEnd={216}
                        saturationEnd={100}
                        lightnessEnd={7}
                        opacity={1}
                        className="absolute inset-0"
                      />
                    ) : (
                      <div
                        className="w-full h-full absolute inset-0"
                        style={{
                          backgroundImage: `url("/pattern/${options.pattern.type}.svg")`,
                          backgroundRepeat: "repeat",
                          backgroundSize:
                            previewSizes[options.pattern.type as Exclude<PatternType, "none">] ||
                            `${options.pattern.intensity}%`,
                          transform: `rotate(${options.pattern.rotation}deg) scale(2)`,
                          imageRendering: "crisp-edges",
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Centered screenshot holder */}
                <div
                  className="absolute inset-0 flex items-center justify-center transition-all ease-in-out antialiased"
                  style={{ zIndex: 2 }}
                >
                  <div
                    style={{
                      width: baseW,
                      height: baseH,
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

                    <Frame backgroundColor={outlineColor} borderRadius={options.rounded} type={options.frame}>
                      <div
                        className="relative transition-all ease-in-out"
                        style={{
                          overflow: "hidden",
                          borderRadius: `${options.rounded}px`,
                          boxShadow: shadowMap[options.shadow],
                          background: outlineColor,
                          border: `${outlineSize}px solid ${outlineColor}`,
                          transition: "border 400ms cubic-bezier(0.03, 0.98, 0.52, 0.99)",
                        }}
                      >
                        <img
                          crossOrigin="anonymous"
                          src={blob.src || "/placeholder.svg?height=800&width=1200&query=Screenshot%20placeholder"}
                          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                          alt="Screenshot preview"
                          onLoad={(e) => {
                            const target = e.currentTarget
                            const nw = target.naturalWidth
                            const nh = target.naturalHeight
                            setBlob((prev) => ({ ...prev, w: nw, h: nh }))
                            setImageElement(target)
                            setUserResized(true)
                          }}
                        />
                      </div>
                    </Frame>
                  </div>
                </div>

                {/* Resize handle (height only) */}
                <div
                  tabIndex={0}
                  role="slider"
                  data-hide-on-export
                  aria-label="Resize height"
                  className="absolute bottom-2 right-2 size-4 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center cursor-nwse-resize z-50 shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  style={{ touchAction: "none", userSelect: "none" }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setIsResizing(true)
                    setResizeStart({ x: e.clientX, y: e.clientY, h: canvasHeight })
                    setUserResized(true)
                  }}
                  onTouchStart={(e) => {
                    if (e.touches.length === 1) {
                      setIsResizing(true)
                      setResizeStart({
                        x: e.touches[0]!.clientX,
                        y: e.touches[0]!.clientY,
                        h: canvasHeight,
                      })
                      setUserResized(true)
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "flex flex-col items-center justify-center p-12 border bg-white border-stone-200 rounded-xl cursor-pointer hover:border-stone-300 transition-all duration-300 w-full",
              )}
              style={{ height: GRID_PARENT_HEIGHT - 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <label htmlFor="screenshot-upload" className="cursor-pointer w-full">
                <div className="flex flex-col items-center text-center space-y-3">
                  <ImagePlus className={cn("size-6 text-stone-300", { "text-rose-500": isDragging })} />
                  <div className="space-y-3">
                    <h3 className="text-xl font-medium text-stone-800">
                      {isDragging ? "Drop your image here" : "Add an image"}
                    </h3>
                    <p className="text-sm text-stone-500 max-w-sm">Drag & drop, paste, or click to upload.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <span className="px-2 py-1 rounded-md bg-stone-100">⌘V</span>
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
        <div
          className={cn(
            "bg-stone-50 w-[20rem] rounded-lg min-h-full max-h-[80vh] flex flex-col border border-stone-200",
            { hidden: !Boolean(blob.src) },
          )}
        >
          <div className="flex-1 overflow-y-auto p-5">
            {/* Replace the entire settings section with: */}
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Grip className="h-4 w-4 text-stone-500" />
                  <span className="block font-medium text-xs text-stone-700">Image Settings</span>
                </div>
                <div className="flex items-center justify-end">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-stone-600" onClick={handleNew}>
                    Reset all
                  </Button>
                </div>
              </div>

              <Separator className="bg-stone-200" />

              {/* Frame Popover */}
              <Popover>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1">
                    <span className="block text-xs font-medium text-stone-700">Frame</span>
                  </div>
                  <PopoverTrigger asChild>
                    <button
                      aria-label="Edit frame"
                      className="w-20 h-14 rounded-md border border-stone-300 flex items-center justify-center transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
                    >
                      <div className="w-full h-full rounded-sm relative overflow-hidden bg-gradient-to-br from-rose-300 to-orange-400 flex items-center justify-center">
                        {options.frame === "none" && (
                          <div className="w-10 h-8 bg-white border border-stone-300 rounded-sm" />
                        )}
                        {options.frame === "arc" && (
                          <div className="relative">
                            <div
                              className="w-10 h-8 bg-white border border-stone-300"
                              style={{
                                borderRadius: "5px",
                                boxShadow: "rgba(0, 0, 0, 0.15) 0px 4px 12px -2px",
                                backgroundColor: "rgba(255, 255, 255, 0.314)",
                                border: "1px solid rgba(255, 255, 255, 0.376)",
                                padding: "2px",
                              }}
                            >
                              <div className="w-full h-full bg-white rounded-[3px]" />
                            </div>
                          </div>
                        )}
                        {options.frame === "stack" && (
                          <div className="relative">
                            <div className="absolute">
                              {Array.from({ length: 3 }).map((_, index) => {
                                const reverseIndex = 3 - index - 1
                                const translateY = reverseIndex * -2.5
                                const scale = 1 - reverseIndex * 0.06
                                const opacity = Math.pow(0.7, reverseIndex)
                                return (
                                  <div
                                    key={index}
                                    className="absolute w-10"
                                    style={{
                                      height: "5px",
                                      borderTopLeftRadius: "5px",
                                      borderTopRightRadius: "5px",
                                      backgroundColor: "#e5e7eb",
                                      transform: `translateY(${translateY}px) scaleX(${scale})`,
                                      transformOrigin: "top center",
                                      opacity,
                                      clipPath: "inset(0 0 calc(100% - 5px) 0)",
                                    }}
                                  />
                                )
                              })}
                            </div>
                            <div className="relative z-10">
                              <div className="w-10 h-8 bg-white border border-stone-300 rounded-sm" />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  </PopoverTrigger>
                </div>
                <PopoverContent align="end" className="z-[9999] w-80">
                  <span className="block font-medium text-sm text-stone-900 mb-2">Frame style</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: "none" as const, label: "None" },
                      { type: "arc" as const, label: "Arc" },
                      { type: "stack" as const, label: "Stack" },
                    ].map((frame) => (
                      <div
                        key={frame.type}
                        className={cn("cursor-pointer flex flex-col items-center gap-1.5")}
                        onClick={() => updateOptions({ frame: frame.type })}
                      >
                        <div
                          className={cn(
                            "w-full h-14 rounded-md border border-stone-200 flex items-center justify-center bg-gradient-to-br from-rose-300 to-orange-400 overflow-hidden",
                            { "ring-2 ring-rose-400": frame.type === options.frame },
                          )}
                        >
                          {frame.type === "none" && (
                            <div className="w-10 h-8 bg-white border border-stone-300 rounded-sm" />
                          )}
                          {frame.type === "arc" && (
                            <div className="relative">
                              <div
                                className="w-10 h-8 bg-white border border-stone-300"
                                style={{
                                  borderRadius: "5px",
                                  boxShadow: "rgba(0, 0, 0, 0.15) 0px 4px 12px -2px",
                                  backgroundColor: "rgba(255, 255, 255, 0.314)",
                                  border: "1px solid rgba(255, 255, 255, 0.376)",
                                  padding: "2px",
                                }}
                              >
                                <div className="w-full h-full bg-white rounded-[3px]" />
                              </div>
                            </div>
                          )}
                          {frame.type === "stack" && (
                            <div className="relative">
                              <div className="absolute">
                                {Array.from({ length: 3 }).map((_, index) => {
                                  const reverseIndex = 3 - index - 1
                                  const translateY = reverseIndex * -2.5
                                  const scale = 1 - reverseIndex * 0.06
                                  const opacity = Math.pow(0.7, reverseIndex)
                                  return (
                                    <div
                                      key={index}
                                      className="absolute w-10"
                                      style={{
                                        height: "5px",
                                        borderTopLeftRadius: "5px",
                                        borderTopRightRadius: "5px",
                                        backgroundColor: "#e5e7eb",
                                        transform: `translateY(${translateY}px) scaleX(${scale})`,
                                        transformOrigin: "top center",
                                        opacity,
                                        clipPath: "inset(0 0 calc(100% - 5px) 0)",
                                      }}
                                    />
                                  )
                                })}
                              </div>
                              <div className="relative z-10">
                                <div className="w-10 h-8 bg-white border border-stone-300 rounded-sm" />
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-stone-600">{frame.label}</span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Background Popover */}
              <Popover>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1">
                    <span className="block text-xs font-medium text-stone-700">Background</span>
                  </div>
                  <PopoverTrigger asChild>
                    <button
                      aria-label="Edit background"
                      className="size-8 rounded-md border border-stone-300 flex items-center justify-center transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
                    >
                      <div
                        className={cn(
                          "size-7 rounded-sm",
                          options.theme.includes("bg-gradient") ? options.theme : undefined,
                        )}
                        style={{ background: !options.theme.includes("bg-gradient") ? options.theme : undefined }}
                      />
                    </button>
                  </PopoverTrigger>
                </div>
                <PopoverContent align="end" className="z-[9999] w-80">
                  <span className="block font-medium text-sm text-stone-900 mb-2">Background Presets</span>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {gradientPresets.map((theme) => (
                      <div
                        key={theme}
                        className={cn(
                          "cursor-pointer w-full h-8 rounded-md border",
                          theme,
                          theme === options.theme && "ring-2 ring-rose-400",
                        )}
                        onClick={() => updateOptions({ theme })}
                        aria-label={theme}
                      />
                    ))}
                  </div>
                  <span className="block font-medium text-sm text-stone-900 mb-2">Solid Colors</span>
                  <div className="grid grid-cols-10 gap-2">
                    {solidPresets.map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "h-6 w-6 rounded-md border",
                          options.theme === color ? "ring-2 ring-rose-400" : "ring-0",
                        )}
                        style={{ background: color }}
                        aria-label={`Color ${color}`}
                        onClick={() => updateOptions({ theme: color })}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Pattern Popover */}
              <Popover>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1">
                    <span className="block text-xs font-medium text-stone-700">Pattern</span>
                  </div>
                  <PopoverTrigger asChild>
                    <button
                      aria-label="Edit pattern overlay"
                      className={cn(
                        "size-8 rounded-md border border-stone-300 flex items-center justify-center transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white",
                        options.pattern.enabled ? "opacity-100" : "opacity-50",
                      )}
                    >
                      <div className="size-7 rounded-sm relative overflow-hidden bg-white flex items-center justify-center">
                        {options.pattern.enabled ? (
                          <div className="w-full h-full relative">
                            {options.pattern.type === "gradientwaves" ? (
                              <GradientWaves
                                lines={8}
                                amplitudeX={60}
                                amplitudeY={12}
                                offsetX={6}
                                smoothness={2}
                                hueStart={53}
                                saturationStart={74}
                                lightnessStart={67}
                                hueEnd={216}
                                saturationEnd={100}
                                lightnessEnd={7}
                                opacity={0.8}
                              />
                            ) : (
                              <div
                                style={{
                                  backgroundImage: `url("/pattern/${options.pattern.type}.svg")`,
                                  backgroundRepeat: "repeat",
                                  backgroundSize: ["stripes", "zigzag"].includes(options.pattern.type) ? "25%" : "85%",
                                  opacity: 0.3,
                                  transform: "rotate(45deg) scale(2)",
                                  imageRendering: "crisp-edges",
                                }}
                                className="w-full h-full"
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-400 text-xs">Off</span>
                        )}
                      </div>
                    </button>
                  </PopoverTrigger>
                </div>
                <PopoverContent align="end" className="z-[9999] w-80">
                  <span className="block font-medium text-sm text-stone-900 mb-2">Pattern Options</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: "none", label: "None" },
                      { type: "waves", label: "Waves" },
                      { type: "dots", label: "Dots" },
                      { type: "stripes", label: "Stripes" },
                      { type: "zigzag", label: "Zigzag" },
                      { type: "graphpaper", label: "Graph Paper" },
                      { type: "gradientwaves", label: "Gradient Waves" },
                    ].map((pattern) => (
                      <div
                        key={pattern.type}
                        className={cn("cursor-pointer flex flex-col items-center gap-1.5")}
                        onClick={() =>
                          updateOptions({
                            pattern: {
                              ...options.pattern,
                              type: pattern.type as any,
                              enabled: pattern.type !== "none",
                            },
                          })
                        }
                      >
                        <div
                          className={cn(
                            "w-full h-14 rounded-md border border-stone-200 flex items-center justify-center bg-white overflow-hidden",
                            { "ring-2 ring-rose-400": pattern.type === options.pattern.type },
                          )}
                        >
                          {pattern.type !== "none" ? (
                            <div className="w-full h-full relative">
                              {pattern.type === "gradientwaves" ? (
                                <GradientWaves
                                  lines={8}
                                  amplitudeX={60}
                                  amplitudeY={12}
                                  offsetX={6}
                                  smoothness={2}
                                  hueStart={53}
                                  saturationStart={74}
                                  lightnessStart={67}
                                  hueEnd={216}
                                  saturationEnd={100}
                                  lightnessEnd={7}
                                  opacity={0.8}
                                />
                              ) : (
                                <div
                                  style={{
                                    backgroundImage: `url("/pattern/${pattern.type}.svg")`,
                                    backgroundRepeat: "repeat",
                                    backgroundSize: ["stripes", "zigzag"].includes(pattern.type) ? "25%" : "85%",
                                    opacity: 0.3,
                                    transform: "rotate(45deg) scale(2)",
                                    imageRendering: "crisp-edges",
                                  }}
                                  className="w-full h-full"
                                />
                              )}
                            </div>
                          ) : null}
                        </div>
                        <span className="text-xs text-stone-600">{pattern.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-3">
                    <EnhancedSlider
                      disabled={options.pattern.type === "none"}
                      label="Size"
                      value={options.pattern.intensity}
                      onChange={(v) => updateOptions({ pattern: { ...options.pattern, intensity: v } })}
                      min={1}
                      max={100}
                      step={1}
                      defaultValue={15}
                      onReset={() =>
                        updateOptions({
                          pattern: { ...options.pattern, intensity: 15 },
                        })
                      }
                    />
                    <EnhancedSlider
                      disabled={options.pattern.type === "none"}
                      label="Rotation"
                      value={options.pattern.rotation}
                      onChange={(v) => updateOptions({ pattern: { ...options.pattern, rotation: v } })}
                      min={0}
                      max={360}
                      step={1}
                      unit="°"
                      defaultValue={0}
                      onReset={() =>
                        updateOptions({
                          pattern: { ...options.pattern, rotation: 0 },
                        })
                      }
                    />
                    <EnhancedSlider
                      disabled={options.pattern.type === "none"}
                      label="Opacity"
                      value={options.pattern.opacity}
                      onChange={(v) => updateOptions({ pattern: { ...options.pattern, opacity: v } })}
                      min={0}
                      max={35}
                      step={1}
                      defaultValue={6}
                      onReset={() =>
                        updateOptions({
                          pattern: { ...options.pattern, opacity: 6 },
                        })
                      }
                    />
                  </div>
                </PopoverContent>
              </Popover>

              <EnhancedSlider
                label="Size"
                value={options.screenshotScale}
                onChange={(v) => updateOptions({ screenshotScale: v })}
                min={0.5}
                max={1.5}
                step={0.01}
                unit="x"
                defaultValue={0.9}
                onReset={() => updateOptions({ screenshotScale: 0.9 })}
              />
              <EnhancedSlider
                label="Rotation"
                value={options.rotation}
                onChange={(v) => updateOptions({ rotation: v })}
                min={0}
                max={360}
                step={1}
                unit="°"
                defaultValue={0}
                onReset={() => updateOptions({ rotation: 0 })}
              />
              <EnhancedSlider
                label="Roundness"
                value={options.rounded}
                onChange={(v) => updateOptions({ rounded: v })}
                min={0}
                max={32}
                step={1}
                unit="px"
                defaultValue={16}
                onReset={() => updateOptions({ rounded: 16 })}
              />
              <EnhancedSlider
                label="Shadow"
                value={options.shadow}
                onChange={(v) => updateOptions({ shadow: Math.round(v) })}
                min={0}
                max={4}
                step={1}
                defaultValue={2}
                onReset={() => updateOptions({ shadow: 2 })}
              />
              <EnhancedSlider
                label="Inset"
                value={outlineSize}
                onChange={setOutlineSize}
                min={0}
                max={100}
                step={1}
                defaultValue={8}
                onReset={() => setOutlineSize(8)}
              />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1">
                  <span className="block text-xs font-medium text-stone-700">Inset color</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={outlineColor}
                    onChange={(e) => setOutlineColor(e.target.value)}
                    className="w-8 h-8 rounded-md border border-stone-300 cursor-pointer transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400"
                    aria-label="Inset color"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-stone-600"
                    onClick={() => setOutlineColor("#ffffff")}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <Separator className="bg-stone-200" />

              {/* Browser bar style */}
              <div className="flex items-center justify-between">
                <Label className="text-sm text-stone-700">Browser bar</Label>
                <div className="flex items-center gap-2">
                  <select
                    className="h-8 rounded-md border border-stone-300 bg-white px-2 text-sm"
                    value={options.browserBar}
                    onChange={(e) => updateOptions({ browserBar: e.target.value as Options["browserBar"] })}
                  >
                    <option value="hidden">Hidden</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-stone-200">
            <div className="flex gap-3 flex-wrap">
              <Button variant="outline" className="h-11 bg-transparent" onClick={handleNew}>
                New
              </Button>
              <Button className="flex-1 h-11" onClick={() => exportOrCopy("download")}>
                Export PNG (2x)
              </Button>
              <Button variant="secondary" className="h-11" onClick={() => exportOrCopy("copy")}>
                Copy Image
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Suggestions Dock */}
        <FloatingSuggestionsDock imageElement={imageElement} isVisible={Boolean(blob.src)} />
      </div>
    </div>
  )
}
