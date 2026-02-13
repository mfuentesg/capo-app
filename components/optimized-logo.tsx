import Image, { type ImageProps } from "next/image"

interface OptimizedLogoProps extends Omit<ImageProps, "src" | "srcSet"> {
  name: "capo" | "capo-text"
  width: number
  height: number
  /**
   * Whether to use SVG fallback if optimized versions are not available
   * @default false (use optimized raster by default)
   */
  useSvg?: boolean
}

/**
 * OptimizedLogo component that serves optimized WebP images with PNG fallback.
 * Uses optimized raster versions (WebP) which are ~32% smaller than SVG.
 * Provides retina support with 2x images for high-DPI displays.
 */
export function OptimizedLogo({
  name,
  width,
  height,
  useSvg = false,
  alt,
  priority,
  className,
  ...props
}: OptimizedLogoProps) {
  if (useSvg) {
    // Fallback to SVG if requested
    return (
      <Image
        src={`/img/${name}.svg`}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={className}
        {...props}
      />
    )
  }

  // Use picture element for WebP with PNG fallback
  // Next.js Image doesn't handle format selection for static files, so we use native picture element
  // Explicit width/height prevent layout shift
  const imgProps = {
    alt,
    width,
    height,
    className,
    loading: (priority ? "eager" : "lazy") as "eager" | "lazy",
    fetchPriority: (priority ? "high" : "auto") as "high" | "auto" | "low",
    decoding: "async" as const,
    style: { width: `${width}px`, height: `${height}px`, ...props.style },
    ...(props as React.ImgHTMLAttributes<HTMLImageElement>)
  }

  return (
    <picture>
      <source
        srcSet={`/img/optimized/${name}@2x.webp 2x, /img/optimized/${name}.webp 1x`}
        type="image/webp"
      />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img
        src={`/img/optimized/${name}.png`}
        srcSet={`/img/optimized/${name}@2x.png 2x, /img/optimized/${name}.png 1x`}
        {...imgProps}
      />
    </picture>
  )
}
