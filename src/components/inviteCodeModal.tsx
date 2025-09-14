"use client";

import {
  fetchInviterInfo,
  submitInvitationCode,
  SubmitInvitationCodeParams,
} from "@/api/user";
import pot from "@/components/lottie/pot.json";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import React, { useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";
import FancyButton from "./FancyButton";

interface InviteCodeModalProps {
  isOpen: boolean;
  onOpenChange: (status: boolean) => void;
  className?: string;
  urlInviteCode: string;
}

const InviteCodeModal: React.FC<InviteCodeModalProps> = ({
  isOpen,
  onOpenChange,
  className,
  urlInviteCode,
}) => {
  const [inviteCode, setInviteCode] = useState<string>("");
  const { isLoggedIn, address: walletAddress } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!walletAddress) {
      return;
    }
    const checkInviter = async () => {
      const inviterInfo = await fetchInviterInfo();
      const walletPrefix = walletAddress?.slice(0, 4) || "unknown";
      const skipKey = `${walletPrefix}_referral_skipped`;
      const isSkip = localStorage.getItem(skipKey);
      console.log(urlInviteCode, "urlInviteCode");
      if (urlInviteCode && !inviterInfo?.inviter_address) {
        await handleSubmit(urlInviteCode);
        onOpenChange(false);

        return;
      } else if (
        !inviterInfo?.inviter_address &&
        isSkip !== "true" &&
        !urlInviteCode
      ) {
        onOpenChange(true);
      }
    };
    if (isLoggedIn) {
      checkInviter();
    }
  }, [isLoggedIn, walletAddress, urlInviteCode]);

  const handleSubmit = async (inviteCode: string) => {
    if (!inviteCode.trim()) {
      setError("Invalid code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: SubmitInvitationCodeParams = {
        invitation_code: inviteCode,
      };
      const response = await submitInvitationCode(params);
      if (response.code === 200) {
        onOpenChange(false);
      }
    } catch (error: any) {
      setError("Invalid code");
    } finally {
      setLoading(false);
    }
  };
  const handleSkip = () => {
    const walletPrefix = walletAddress?.slice(0, 4) || "unknown";
    const skipKey = `${walletPrefix}_referral_skipped`;
    localStorage.setItem(skipKey, "true");
    onOpenChange(false);
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
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            onOpenChange(false);
          }}
        >
          <motion.div
            className={`bg-[#1A0D1A] rounded-lg shadow-lg overflow-y-auto text-white border border-[#332231] max-h-[80vh] ${className}`}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
            >
              <div className="flex justify-between items-center p-4 border-b border-[#332231]">
                <div className="text-lg font-bold uppercase flex items-end">
                  <Lottie animationData={pot} className="w-[30px] mr-2" loop />
                  <span>Enter Invitation Code</span>
                </div>
                <button
                  onClick={() => {
                    onOpenChange(false);
                  }}
                  className="text-[#000] w-5 h-5 bg-[#fcd845] rounded-sm flex items-center justify-center"
                >
                  <IoCloseSharp className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col md:flex-row p-6">
                <div className="pl-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold uppercase mb-2">
                      Submit Your Invitation Code
                    </h2>
                    <p className="text-sm font-cofo text-[#857A83] mb-4">
                      Enter your invitation code to join our community and
                      unlock extra rewards!
                    </p>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Enter invitation code"
                      className="w-full p-2 rounded bg-[#332231] text-white border border-[#857A83] focus:outline-none focus:border-[#FCD944]"
                    />
                    {error && (
                      <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                  </div>
                  <div className="flex justify-end mt-6 gap-2">
                    <FancyButton buttonText={"SKIP"} onClick={handleSkip} />
                    <FancyButton
                      buttonText={loading ? "SUBMITTING..." : "SUBMIT CODE"}
                      onClick={() => {
                        handleSubmit(inviteCode);
                      }}
                      endIcon={<FaAngleRight />}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InviteCodeModal;
