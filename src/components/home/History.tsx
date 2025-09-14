"use client";
import { TradeItem } from "@/api/token";
import { formatQuantity, shortenAddress } from "@/utils";
import { Avatar, useDisclosure } from "@heroui/react";
import { motion, useTime, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import CreateTokenModal from "../CreateTokenModal";
import button_fire from "../lottie/button_fire.json";
import pot from "../lottie/pot.json";
import tradelist from "./tradelist.json";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function History() {
  const [tokens, setTokens] = useState<TradeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(30); // 动画时长秒数

  // 复制一份token确保无缝滚动
  const duplicatedTokens = [...tokens, ...tokens];

  const getRandomTokens = (data: TradeItem[], count: number) => {
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    return selected;
  };

  useEffect(() => {
    const loadTokens = () => {
      try {
        setIsLoading(true);
        const response: any = tradelist;
        const randomTokens = getRandomTokens(response.data, 80);
        setTokens(randomTokens);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, []);

  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const isMobile = window.innerWidth <= 640;
      const tokenWidth = isMobile ? 160 : 200; // Token box width (px)
      const totalContentWidth = tokens.length * tokenWidth; // Width of original tokens
      const speedPxPerSec = isMobile ? 50 : 50; // Faster speed for mobile

      contentRef.current.style.width = `${totalContentWidth * 2}px`;

      const newDuration = totalContentWidth / speedPxPerSec;
      setDuration(newDuration);
    }
  }, [tokens]);

  const renderContent = useCallback(() => {
    if (isLoading) {
      return (
        <div className="h-[80px] max-sm:h-[60px] flex items-center justify-center text-white/50">
          Loading...
        </div>
      );
    }

    if (error || tokens.length === 0) {
      return (
        <div className="h-[80px] max-sm:h-[60px] flex items-center justify-center text-white/50">
          {error || "No data available"}
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        onMouseEnter={() => {
          if (contentRef.current) {
            contentRef.current.style.animationPlayState = "paused";
          }
        }}
        onMouseLeave={() => {
          if (contentRef.current) {
            contentRef.current.style.animationPlayState = "running";
          }
        }}
      >
        <div
          ref={contentRef}
          className="flex whitespace-nowrap"
          style={{
            animation: `marqueeX ${duration}s linear infinite`,
            willChange: "transform",
          }}
        >
          {duplicatedTokens.map((item, idx) => (
            <div
              key={`${item.signature}-${idx}`}
              className="flex gap-2 h-11 max-sm:h-9 pr-[56px] max-sm:pr-[40px] cursor-pointer flex-shrink-0 w-[200px] max-sm:w-[160px]"
            >
              <div className="flex items-start justify-center relative">
                <Image
                  src="/images/home/plate.svg"
                  alt="Token plate"
                  width={44}
                  height={10}
                  priority
                  className="object-contain absolute -z-10 bottom-[2px] max-sm:w-8 max-sm:h-2"
                />
                <Avatar
                  src={item.logo}
                  fallback={item.symbol[0]}
                  alt={`Token avatar for ${item.symbol}`}
                  className="w-8 h-8 max-sm:w-6 max-sm:h-6 flex-shrink-0"
                />
              </div>

              <div className="flex flex-col h-11 max-sm:h-9 justify-center min-w-0 ml-2 max-sm:ml-1">
                <p className="text-white text-lg max-sm:text-sm leading-[18px] max-sm:leading-[14px] -tracking-wide uppercase">
                  {item.symbol}
                </p>
                <p
                  className={`${
                    !item.is_buy ? "text-[#FF4949]" : "text-[#58ff49]"
                  } whitespace-nowrap text-xs max-sm:text-[10px] leading-none uppercase`}
                >
                  {!item.is_buy ? "sell" : "buy"} $
                  {formatQuantity(
                    Number(item.token_amount) * Number(item.new_price_usd)
                  )}
                </p>
                <p className="text-xs max-sm:text-[10px] text-white/80 font-cofo leading-[14px] max-sm:leading-[12px]">
                  {shortenAddress(item.mint || "")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [isLoading, error, tokens, duration, duplicatedTokens]);

  const time = useTime();
  const rotate = useTransform(time, (t) => Math.sin((t / 1000) * Math.PI) * 10);
  const glow = useTransform(
    time,
    (t) =>
      `drop-shadow(0 0 8px rgba(255, 141, 247, ${
        0.5 + Math.sin((t / 500) * Math.PI) * 0.4
      }))`
  );

  const hoverGlow = `drop-shadow(0px 0px 1px #ff8df7)`;

  const [isHovered, setIsHovered] = useState(false);

  useLayoutEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes marqueeX {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    hoverAudioRef.current = new Audio("/sounds/hover.mp3");
  }, []);

  return (
    <div className="h-[63px] max-sm:h-[48px] relative group mt-3 max-sm:mt-2">
      {renderContent()}
      <div className="absolute inset-y-0 left-0 w-20 max-sm:w-12 bg-gradient-to-r from-[#000] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 max-sm:w-12 bg-gradient-to-l from-[#000] to-transparent pointer-events-none" />
      <div className="w-[180px] max-sm:w-[120px] h-[180px] max-sm:h-[120px] z-10 absolute left-1/2 -top-0 -translate-x-[90px] max-sm:-translate-x-[60px] -translate-y-[130px] max-sm:-translate-y-[90px]">
        <Lottie animationData={pot} loop={true} />
      </div>
      <div className="max-sm:h-10 w-[400px] max-sm:w-[200px] h-[100px] max-sm:h-[60px] absolute left-1/2 -translate-x-[200px] max-sm:-translate-x-[100px] top-0 bg-[radial-gradient(circle_at_center,#000_0%,transparent_100%)]"></div>
      {isHovered ? (
        <div className="absolute w-[180px] max-sm:w-[120px] h-[100px] max-sm:h-[60px] left-1/2 -translate-x-[90px] max-sm:-translate-x-[60px] z-10 top-0 -translate-y-[40px] max-sm:-translate-y-[24px] opacity-45 blur-lg">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,141,247,0.6)_0%,transparent_80%)]"></div>
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,141,247,0.4)_0%,transparent_90%)]"></div>
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,141,247,0.2)_0%,transparent_100%)]"></div>
        </div>
      ) : (
        ""
      )}
      <div className="w-[160px] max-sm:w-[100px] h-[34px] max-sm:h-[24px] absolute left-1/2 -top-1 z-20 -translate-x-[80px] max-sm:-translate-x-[50px]">
        <motion.div
          className="relative z-20"
          whileHover={{ scale: 1.05, y: -3, opacity: 0.8 }}
          whileTap={{ scale: 0.95, y: 2 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          onHoverStart={() => {
            setIsHovered(true);
            if (hoverAudioRef.current) {
              hoverAudioRef.current.currentTime = 0;
              hoverAudioRef.current.play().catch((err) => {
                console.warn("Audio playback failed:", err);
              });
            }
          }}
          onHoverEnd={() => {
            setIsHovered(false);
            if (hoverAudioRef.current) {
              hoverAudioRef.current.currentTime = 0;
              hoverAudioRef.current.pause();
            }
          }}
          style={{ filter: isHovered ? hoverGlow : "" }}
        >
          <div className="absolute top-0.5 left-0 w-full h-[36px] max-sm:h-[26px] bg-[#413640] rounded-sm z-10" />
          <motion.button
            whileHover={{
              boxShadow:
                "0 8px 20px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.8)",
            }}
            whileTap={{
              boxShadow: "0 2px 5px rgba(0,0,0,0.8)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="relative whitespace-nowrap px-2 w-full h-[34px] max-sm:h-[24px] bg-[#0f040e] text-[#ff8df7] text-xl max-sm:text-sm font-semibold rounded-[3px] flex items-center justify-center z-20 border-b-2 border-black overflow-hidden"
          >
            <div className="absolute top-0 w-full h-[2px] bg-[#413640]" />
            <div
              className="flex items-center justify-between w-full"
              onClick={onOpen}
            >
              <motion.ul
                style={{ rotate, filter: glow }}
                initial={["visible", "active"]}
              >
                <Image
                  className="w-6 h-6 max-sm:w-4 max-sm:h-4"
                  src={"/images/home/create_icon_pink.svg"}
                  width={24}
                  height={24}
                  alt=""
                />
              </motion.ul>
              <motion.p style={{ filter: glow }} className="uppercase">
                Create Token
              </motion.p>
            </div>
          </motion.button>
        </motion.div>
        <div className="absolute -bottom-1 max-sm:-bottom-2 z-[15]">
          {isHovered ? <Lottie animationData={button_fire} loop={true} /> : ""}
        </div>
      </div>
      <CreateTokenModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </div>
  );
}
