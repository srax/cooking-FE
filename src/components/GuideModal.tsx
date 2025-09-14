"use client";

import animate1 from "@/components/lottie/animate1.json";
import animate2 from "@/components/lottie/animate2.json";
import animate3 from "@/components/lottie/animate3.json";
import animate4 from "@/components/lottie/animate4.json";
import animate5 from "@/components/lottie/animate5.json";
import pot from "@/components/lottie/pot.json";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { FaAngleRight, FaChevronLeft } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";
import FancyButton from "./FancyButton";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface GuideModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  className?: string;
}

const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onOpenChange,
  className,
}) => {
  const [step, setStep] = useState(1); // 当前引导步骤

  const guideSteps = [
    {
      title: "🍳 launch tokens. just cook. ",
      animate: animate1,
      description: (
        <>
          <p> got a meme or AI? idea? vibe? turn it into a token </p>
          <p>— fast and safe.</p>
          <ul className="list-disc list-inside mt-2 mb-2 text-xs">
            <li>launch with optional Conviction Pool</li>
            <li>protect your holders from getting burnt 🔥</li>
            {/* <li>protect your holders getting burnt</li> */}
          </ul>
          <p>anyone can be a Michelin token chef.</p>
          <p>yes, even you.</p>
        </>
      ),
      buttonText: `ok I'm cooking`,
    },
    {
      title: "🔒 safety first, chef.",
      animate: animate2,
      description: (
        <>
          Conviction Pool is here, your safety net is here.
          <ul className="list-none list-inside mt-2">
            <li>🍳 devs lock some SOL = serious chefs only</li>
            <li>🔥 traders get a price floor = safer exits, less rug</li>
          </ul>
          if your token graduates, conviction pool kicks in:
          <ul className="list-none list-inside mt-2">
            <li>→ SOL gets used to swap tokens</li>
            <li>→ holders stay protected</li>
            <li>→ trust stays hot</li>
          </ul>
          <p>
            if price stays well? SOL goes back to the dev. no mess, no stress.
          </p>
        </>
      ),
      buttonText: "protect the recipe",
    },
    {
      title: "👥 refer frens, earn rewards",
      animate: animate3,
      description: (
        <>
          you chill, they trade, you win:
          <ul className="list-none list-inside mt-2">
            <li>- 28% of trading fees from your direct invites (Level 1)</li>
            <li>- 7% from their invites (Level 2)</li>
          </ul>
          what you have to do is:
          <ul className="list-disc list-inside mt-2">
            <li>share your invite code to frens</li>
          </ul>
          <p>cook together. eat together.</p>
        </>
      ),
      buttonText: "feed the kitchen",
    },
    {
      title: "🔥 trade spicy tokens. join FIRE raffles",
      animate: animate4,
      description: (
        <>
          buy tokens early? HOLD it till moon it?
          <ul className="list-none list-inside mt-2">
            <li>we give you raffle tickets for rewarding diamond hand</li>
            <li>hit convicted market cap and get more tickets and rewards</li>
            <li>trading = seasoning your bags.</li>
          </ul>
          <p>cook. hodl. get lucky.</p>
        </>
      ),
      buttonText: "gimme those tickets 🎫",
    },
    {
      title: "🧑‍🍳 gm, head chef.",
      animate: animate5,
      description: (
        <>
          <p>boost you cooking points from now.</p>
          <p>the more you cook, the hotter you’ll be.</p>
          <p>spicy rewards coming…</p>
        </>
      ),
      buttonText: `Let's Cook `,
    },
  ];

  const handleNext = () => {
    if (step < guideSteps.length) {
      setStep(step + 1);
    } else {
      onOpenChange();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const pageVariants = {
    initial: { rotateY: 90, opacity: 0 },
    in: { rotateY: 0, opacity: 1 },
    out: { rotateY: -90, opacity: 0 },
  };

  const pageTransition = {
    type: "tween",
    duration: 0.5,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onOpenChange}
          >
            <motion.div
              className={`bg-[#1A0D1A] rounded-lg shadow-lg overflow-y-auto text-white border border-[#332231] max-h-[80vh] ${className}`}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`step${step}`}
                  variants={pageVariants}
                  initial="initial"
                  animate="in"
                  exit="out"
                  transition={pageTransition}
                >
                  <div className="flex justify-between items-center p-4 border-b border-[#332231]">
                    <div className="text-lg font-bold uppercase flex items-end">
                      <Lottie
                        animationData={pot}
                        className="w-[30px] mr-2"
                        loop
                      />
                      <span>BEGINNER'S GUIDE</span>
                    </div>
                    <button
                      onClick={onOpenChange}
                      className="text-[#000] w-5 h-5 bg-[#fcd845] rounded-sm flex items-center justify-center"
                    >
                      <IoCloseSharp className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-col md:flex-row p-6">
                    {/* 左侧动画区域 */}
                    <div className="flex justify-center items-start">
                      <Lottie
                        animationData={guideSteps[step - 1].animate}
                        className="w-[348px]"
                        loop
                      />
                    </div>
                    {/* 右侧文案区域 */}
                    <div className="pl-6">
                      <div>
                        {/* 步骤指示器 */}
                        <div className="flex gap-10 mb-4">
                          {guideSteps.map((_, index) => (
                            <div
                              key={index}
                              className={`w-6 h-6 mx-1 rounded-sm flex items-center justify-center text-sm ${
                                step === index + 1
                                  ? "bg-[#FCD944] text-black"
                                  : "bg-[#332231] text-white"
                              }`}
                            >
                              {index + 1}
                            </div>
                          ))}
                        </div>
                        {/* 文案 */}
                        <h2 className="text-xl font-bold uppercase mb-2">
                          {guideSteps[step - 1].title}
                        </h2>
                        <div className="text-sm font-cofo text-[#857A83]">
                          {guideSteps[step - 1].description}
                        </div>
                      </div>
                      {/* 按钮区域 */}
                      <div className="flex justify-between mt-6">
                        {step > 1 && (
                          <FancyButton
                            onClick={handleBack}
                            buttonText="BACK"
                            icon={<FaChevronLeft />}
                          />
                        )}
                        <FancyButton
                          buttonText={guideSteps[step - 1].buttonText}
                          onClick={handleNext}
                          endIcon={<FaAngleRight />}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GuideModal;
