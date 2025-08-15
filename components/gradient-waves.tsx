"use client"

import { useEffect, useRef } from "react"

interface GradientWavesProps {
  lines?: number
  amplitudeX?: number
  amplitudeY?: number
  offsetX?: number
  smoothness?: number
  hueStart?: number
  saturationStart?: number
  lightnessStart?: number
  hueEnd?: number
  saturationEnd?: number
  lightnessEnd?: number
  opacity?: number
  className?: string
}

// Simple HSL to RGB conversion
function hslToRgb(h: number, s: number, l: number) {
  h /= 360
  s /= 100
  l /= 100

  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h * 12) % 12
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
  }

  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

// Simple color interpolation
function interpolateColors(startHsl: [number, number, number], endHsl: [number, number, number], steps: number) {
  const colors = []
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps
    const h = startHsl[0] + (endHsl[0] - startHsl[0]) * ratio
    const s = startHsl[1] + (endHsl[1] - startHsl[1]) * ratio
    const l = startHsl[2] + (endHsl[2] - startHsl[2]) * ratio
    const [r, g, b] = hslToRgb(h, s, l)
    colors.push(`rgb(${r}, ${g}, ${b})`)
  }
  return colors
}

class WavePath {
  rootY: number
  fill: string
  offsetX: number
  root: Array<{ x: number; y: number }> = []
  winW: number
  winH: number
  overflow: number
  amplitudeX: number
  amplitudeY: number

  constructor(
    rootY: number,
    fill: string,
    offsetX: number,
    winW: number,
    winH: number,
    overflow: number,
    amplitudeX: number,
    amplitudeY: number,
  ) {
    this.rootY = rootY
    this.fill = fill
    this.offsetX = offsetX
    this.winW = winW
    this.winH = winH
    this.overflow = overflow
    this.amplitudeX = amplitudeX
    this.amplitudeY = amplitudeY
  }

  createRoot() {
    this.root = []
    let x = -this.overflow + this.offsetX
    let upSideDown = false

    this.root.push({ x, y: this.rootY })

    while (x < this.winW) {
      upSideDown = !upSideDown
      const value = upSideDown ? 1 : -1
      x += this.amplitudeX
      const y = this.amplitudeY * value + this.rootY
      this.root.push({ x, y })
    }

    this.root.push({ x: this.winW + this.overflow, y: this.rootY })
  }

  createPath(smoothness: number): string {
    if (this.root.length < 2) return ""

    let d = `M -${this.overflow} ${this.winH + this.overflow}`
    d += ` L ${this.root[0].x} ${this.root[0].y}`

    // Create smooth curves between points
    for (let i = 1; i < this.root.length - 1; i++) {
      const prevPoint = this.root[i - 1]
      const actualPoint = this.root[i]
      const diffX = (actualPoint.x - prevPoint.x) / smoothness
      const x1 = prevPoint.x + diffX
      const x2 = actualPoint.x - diffX
      const x = actualPoint.x
      const y1 = prevPoint.y
      const y2 = actualPoint.y
      const y = actualPoint.y

      d += ` C ${x1} ${y1}, ${x2} ${y2}, ${x} ${y}`
    }

    // Close the path
    const lastPoint = this.root[this.root.length - 1]
    d += ` L ${lastPoint.x} ${lastPoint.y}`
    d += ` L ${this.winW + this.overflow} ${this.winH + this.overflow}`
    d += ` Z`

    return d
  }
}

export default function GradientWaves({
  lines = 15,
  amplitudeX = 100,
  amplitudeY = 20,
  offsetX = 10,
  smoothness = 3,
  hueStart = 53,
  saturationStart = 74,
  lightnessStart = 67,
  hueEnd = 216,
  saturationEnd = 100,
  lightnessEnd = 7,
  opacity = 1,
  className = "",
}: GradientWavesProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const winW = rect.width || 800
    const winH = rect.height || 600
    const overflow = Math.abs(lines * offsetX)

    // Clear previous paths
    svg.innerHTML = ""

    // Generate colors
    const startColor: [number, number, number] = [hueStart, saturationStart, lightnessStart]
    const endColor: [number, number, number] = [hueEnd, saturationEnd, lightnessEnd]
    const colors = interpolateColors(startColor, endColor, lines + 1)

    // Set background color
    svg.style.backgroundColor = colors[0]

    // Create wave paths
    for (let i = 0; i < lines; i++) {
      const rootY = (winH / lines) * i
      const wavePath = new WavePath(rootY, colors[i + 1], offsetX * i, winW, winH, overflow, amplitudeX, amplitudeY)

      wavePath.createRoot()
      const pathData = wavePath.createPath(smoothness)

      if (pathData) {
        const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path")
        pathElement.setAttribute("d", pathData)
        pathElement.setAttribute("fill", colors[i + 1])
        pathElement.setAttribute("stroke", "none")
        svg.appendChild(pathElement)
      }
    }
  }, [
    lines,
    amplitudeX,
    amplitudeY,
    offsetX,
    smoothness,
    hueStart,
    saturationStart,
    lightnessStart,
    hueEnd,
    saturationEnd,
    lightnessEnd,
  ])

  return (
    <svg
      ref={svgRef}
      className={`w-full h-full ${className}`}
      style={{ opacity }}
      preserveAspectRatio="none"
      viewBox="0 0 800 600"
    />
  )
}
