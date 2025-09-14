import { motion } from "framer-motion";
import React from "react";

interface FancyButtonProps {
  buttonText?: string;
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  disabled?: boolean;
  bgColor?: string;
  downColor?: string;
  textColor?: string;
  height?: string | number; // 新增 height 属性
}

const FancyButton: React.FC<FancyButtonProps> = ({
  buttonText = "button",
  className = "",
  onClick,
  icon,
  endIcon,
  disabled = false,
  bgColor,
  downColor,
  textColor,
  height = 26, // 默认高度为 26px
}) => {
  // 确保高度值包含单位
  const buttonHeight = typeof height === "number" ? `${height}px` : height;
  // 计算下层 div 的高度（比按钮高 2px）
  const outerHeight =
    typeof height === "number" ? `${height + 2}px` : `calc(${height} + 2px)`;

  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={disabled ? {} : { scale: 1.05, y: -3 }}
      whileTap={disabled ? {} : { scale: 0.95, y: 2 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <div
        className="absolute top-0.5 left-0 w-full rounded-sm z-10"
        style={{
          height: outerHeight,
          backgroundColor: disabled ? "#A1A1A1" : downColor || "#A19900",
        }}
      />
      <motion.button
        whileHover={
          disabled
            ? {}
            : {
                boxShadow:
                  "0 8px 20px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.2)",
              }
        }
        whileTap={disabled ? {} : { boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        onHoverStart={() => !disabled && console.log("hover started!")}
        onClick={() => {
          if (!disabled) {
            console.log("button clicked!");
            onClick?.();
          }
        }}
        disabled={disabled}
        className={`relative w-full whitespace-nowrap px-2 text-base font-semibold rounded-[3px] flex items-center justify-center z-20 border-b-2 border-black overflow-hidden ${
          disabled
            ? "bg-[#FCD845] cursor-not-allowed"
            : `${bgColor ? `bg-${bgColor}` : "bg-[#FCD845]"} cursor-pointer`
        }`}
        style={{ height: buttonHeight }}
      >
        <div
          className="absolute top-0 left-0 w-full h-[2px]"
          style={{
            backgroundColor: disabled ? "#FFEA96" : bgColor || "#FFEA96",
          }}
        />
        <div className="flex items-center">
          {icon && <span className="mr-1">{icon}</span>}
          {buttonText && (
            <p className={textColor ? `text-${textColor}` : "text-black"}>
              {buttonText}
            </p>
          )}
          {endIcon && <span className="ml-1">{endIcon}</span>}
        </div>
      </motion.button>
    </motion.div>
  );
};

export default FancyButton;
