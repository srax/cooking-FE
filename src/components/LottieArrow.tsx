"use client";

import { useEffect, useRef } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";

interface LottieArrowProps {
  src: string;
  width?: number;
  height?: number;
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
}

export default function LottieArrow({
  src,
  width = 24,
  height = 24,
  className = "",
  autoplay = true,
  loop = true,
}: LottieArrowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotLottieRef = useRef<DotLottie | null>(null);

  useEffect(() => {
    if (canvasRef.current && src && !src.includes("YOUR_ANIMATION_ID")) {
      try {
        dotLottieRef.current = new DotLottie({
          autoplay,
          loop,
          canvas: canvasRef.current,
          src,
        });
      } catch (error) {
        console.warn("Failed to load Lottie animation:", error);
      }
    }

    return () => {
      if (dotLottieRef.current) {
        dotLottieRef.current.destroy();
      }
    };
  }, [src, autoplay, loop]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}