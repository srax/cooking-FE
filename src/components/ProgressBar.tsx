"use client";

import { motion } from "framer-motion";
import React from "react";

interface ProgressBarProps {
  progress?: number;
  color?: string;
  animatedColor?: string;
  animationNode?: React.ReactNode;
  isGraduated?: boolean;
  plSize?: string;
  width?: string | number; // 新增 width 属性
  height?: string | number; // 新增 height 属性
  showLabel?: boolean; // 是否显示百分比标签
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  color = "#FF8DF7",
  animatedColor = "rgba(255, 141, 247, 0.8)",
  animationNode,
  isGraduated,
  plSize,
  width = "100%", // 默认宽度为 100%
  height = 10, // 默认高度为 10px
  showLabel = false, // 是否显示百分比标签
}) => {
  // 动态计算块数，基于容器宽度
  const blockWidth = 8; // 每个块的宽度保持不变
  const gap = 2; // 块之间的间距
  const animatedBlocks = isGraduated ? 0 : 4; // 动画块数量

  // 使用 ref 获取容器宽度
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [totalBlocks, setTotalBlocks] = React.useState(0);

  // 处理宽度和高度，确保带单位
  const containerWidth = typeof width === "number" ? `${width}px` : width;
  const containerHeight = typeof height === "number" ? `${height}px` : height;

  // 计算总块数
  React.useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth - 20;
      const calculatedBlocks = Math.floor(containerWidth / (blockWidth + gap));
      setTotalBlocks(
        progress === 100 ? calculatedBlocks + 2 : calculatedBlocks
      );
    }
  }, [width]); // 添加 width 作为依赖，确保宽度变化时重新计算

  // const filledBlocks =
  //   progress === 100
  //     ? totalBlocks
  //     : Math.min(Math.floor((progress / 100) * totalBlocks), totalBlocks);

  let filledBlocks = 0;
  if (progress >= 0 && progress <= 5) {
    filledBlocks = Math.min(Math.floor((1 / 10) * totalBlocks), totalBlocks);
  } else if (progress > 25 && progress < 30) {
    filledBlocks = Math.min(Math.floor((6 / 20) * totalBlocks), totalBlocks);
  } else if (progress > 95 && progress < 100) {
    filledBlocks = Math.min(20, totalBlocks);
  } else if (progress >= 100) {
    filledBlocks = totalBlocks;
  }

  const animatedStart =
    filledBlocks > animatedBlocks ? filledBlocks - animatedBlocks : 0;

  return (
    <div
      className="relative"
      ref={containerRef}
      style={{ width: containerWidth, height: containerHeight }}
    >
      {animationNode && animationNode}
      <div
        className={`w-full bg-[#3d343e] rounded-full flex items-center px-1 ${plSize} space-x-[2px] overflow-hidden`}
        style={{ height: containerHeight }}
      >
        {Array.from({ length: totalBlocks }).map((_, i) => {
          const isFilled = i < filledBlocks;
          const isAnimated = i >= animatedStart && i < filledBlocks;

          return (
            <motion.div
              key={i}
              className="flex-shrink-0"
              style={{ width: `${blockWidth}px`, height: containerHeight }}
              animate={{
                backgroundColor: isFilled
                  ? isAnimated
                    ? animatedColor
                    : color
                  : "transparent",
                opacity: isAnimated ? [1, 0.5, 1] : 1,
              }}
              transition={{
                backgroundColor: { duration: 0.3 },
                opacity: isAnimated
                  ? {
                      duration: 1,
                      repeat: Infinity,
                      delay: (i - animatedStart) * 0.2,
                    }
                  : { duration: 0 },
              }}
            />
          );
        })}
      </div>
      {!isGraduated && showLabel ? (
        <span
          className="text-xs absolute bottom-0 right-0"
          style={{ textShadow: "none" }}
        >
          {progress}%
        </span>
      ) : null}
    </div>
  );
};

export default ProgressBar;
