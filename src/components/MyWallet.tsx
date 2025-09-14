"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { shortenAddress } from "@/utils";
import {
  addToast,
  Avatar,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import FancyButton from "./FancyButton";

const SolanaWallet = () => {
  const {
    isLoggedIn,
    loading,
    address,
    isConnected,
    userInfo,
    signAndLogin,
    logout,
  } = useAuth();
  const { open } = useAppKit();
  const { status } = useAppKitAccount();
  const router = useRouter();
  const t = useTranslations("SolanaWallet");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  // Handle connect or login
  const handleConnect = async () => {
    if (isLoggedIn) return;
    setIsLoading(true);
    try {
      if (!isConnected) {
        await open();
      } else {
        await signAndLogin();
      }
    } catch (error) {
      console.error("Connection or login failure:", error);
      addToast({
        title: t("toasts.loginFailed.title"),
        description:
          error instanceof Error
            ? error.message
            : t("toasts.loginFailed.description"),
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      logout();
      addToast({
        title: t("toasts.logoutSuccess.title"),
        description: t("toasts.logoutSuccess.description"),
        color: "success",
      });
    } catch (error) {
      console.error("Exit failed:", error);
      addToast({
        title: t("toasts.logoutFailed.title"),
        description: t("toasts.logoutFailed.description"),
        color: "danger",
      });
    }
  };

  const goAssets = () => {
    router.push("/assets");
  };

  const MotionPopover = motion(Popover);

  return (
    <>
      {isLoggedIn ? (
        <MotionPopover
          placement="bottom"
          showArrow={false}
          offset={20}
          isOpen={isOpenModal}
          onOpenChange={(open) => setIsOpenModal(open)} // 使用 onOpenChange 控制弹窗状态
          classNames={{
            content:
              "w-[333px] h-[144px] flex items-start justify-start p-5 bg-[#150714] rounded-md border border-[#332231]",
          }}
        >
          <PopoverTrigger>
            <motion.div
              className="flex items-center gap-2"
              onMouseEnter={() => setIsOpenModal(true)} // 鼠标进入触发器时打开弹窗
            >
              <Avatar
                radius="full"
                size="sm"
                src={userInfo?.profile.avatar_url || ""}
                className="w-[24px] h-[24px]"
              />
              <p>{shortenAddress(address || "")}</p>
            </motion.div>
          </PopoverTrigger>
          <PopoverContent
            onMouseLeave={() => setIsOpenModal(false)} // 鼠标离开弹窗内容时关闭弹窗
          >
            <div className="w-full">
              <div className="flex items-center justify-between w-full border-b-1 border-[#30212E] pb-4">
                <div className="flex items-center gap-2">
                  <Avatar
                    radius="full"
                    size="sm"
                    src={userInfo?.profile.avatar_url || ""}
                    className="w-[52px] h-[52px]"
                  />
                  <p>{shortenAddress(address || "")}</p>
                </div>
                <div>
                  <Button
                    variant="bordered"
                    className="rounded border border-[#FCD845] uppercase py-[10px] px-[12px] text-sm text-[#FCD845] h-8"
                    endContent={<FaArrowRight />}
                    onPress={goAssets}
                  >
                    Profile
                  </Button>
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  variant="bordered"
                  className="border-none uppercase text-[#FCD845] p-0 h-5"
                  onPress={handleLogout}
                >
                  DISCONNECT
                </Button>
              </div>
            </div>
          </PopoverContent>
        </MotionPopover>
      ) : (
        <FancyButton
          buttonText={` ${isConnected ? "SIGN UP" : "CONNECT"}`}
          onClick={handleConnect}
        ></FancyButton>
      )}
    </>
  );
};

export default SolanaWallet;
