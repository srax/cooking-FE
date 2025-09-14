"use client";

import { getConvictionPool, TokenDetailResponse } from "@/api/token";
import { useAuth } from "@/context/AuthContext";
import { usePrice } from "@/context/PriceContext";
import { formatQuantity, shortenAddress } from "@/utils";
import { refundInsurance } from "@/utils/redeem";
import { addToast } from "@heroui/react";
import type { Provider } from "@reown/appkit-adapter-solana";
import { useAppKitProvider } from "@reown/appkit/react";
import { Connection } from "@solana/web3.js";
import Bignumber from "bignumber.js";
import Image from "next/image";
import { useEffect, useState } from "react";

interface InsurancePoolProps {
  tokenData: TokenDetailResponse["data"] | null;
}

export default function InsurancePool({ tokenData }: InsurancePoolProps) {
  // 判断用户类型：普通用户 or Dev 用户
  const [countdown, setCountdown] = useState<string>("N/A");
  const [isDevUser, setIsDevUser] = useState<boolean>(false);
  const [redeemLoading, setRedeemLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const { prices } = usePrice();
  const { address: currentWalletAddress } = useAuth();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const [localInsuranceStatus, setLocalInsuranceStatus] = useState<
    string | null
  >(null);
  const [convictionPool, setConvictionPool] = useState<string>("");

  const getConvictionPoolData = async () => {
    if (tokenData) {
      const convictionPoolAddress = await getConvictionPool(
        tokenData?.address || ""
      );
      if (convictionPoolAddress.code === 200) {
        setConvictionPool(convictionPoolAddress.data?.address || "");
      }
    }
  };
  useEffect(() => {
    if (!tokenData) {
      setCountdown("N/A");
      return;
    }
    getConvictionPoolData();
    setIsDevUser(tokenData?.signer === currentWalletAddress);

    let targetDate: Date | null = null;

    if (tokenData.graduation_time) {
      targetDate = new Date(tokenData.graduation_time);
    } else if (tokenData.created_at) {
      targetDate = new Date(tokenData.created_at);
    }

    if (!targetDate) {
      setCountdown("N/A");
      return;
    }
    // TODO: 根据测试调整时间
    // 增加5天
    targetDate.setDate(targetDate.getDate() + 5);

    // 增加30分钟
    // targetDate.setMinutes(targetDate.getMinutes() + 20);

    const updateCountdown = () => {
      const now = new Date(); // 每次更新时获取当前时间
      const diff = targetDate!.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown("00d : 00h : 00m : 00s");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${days.toString().padStart(2, "0")}d : ${hours
          .toString()
          .padStart(2, "0")}h : ${minutes
          .toString()
          .padStart(2, "0")}m : ${seconds.toString().padStart(2, "0")}s`
      );
    };

    updateCountdown(); // 立即执行一次
    const interval = setInterval(updateCountdown, 1000); // 每秒更新
    return () => clearInterval(interval); // 清理定时器
  }, [tokenData, currentWalletAddress]);

  const handleRedeem = async () => {
    if (!tokenData) {
      return;
    }
    if (!currentWalletAddress) {
      addToast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet",
        color: "danger",
      });
      return;
    }

    setRedeemLoading((prev) => ({ ...prev, [tokenData.address]: true }));
    try {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_IS_DEV === "false"
          ? process.env.NEXT_PUBLIC_RPC_URL ||
            "https://api.mainnet-beta.solana.com"
          : process.env.NEXT_PUBLIC_DEV_RPC_URL || "",
        "confirmed"
      );
      const wallet = {
        address: currentWalletAddress,
        provider: walletProvider,
      };
      const tokenParams = {
        mint: tokenData.address,
        name: tokenData.name,
        symbol: tokenData.symbol,
        uri: "",
        insuranceAmt: tokenData.insurance_amt || 0,
        insurancePx: tokenData.insurance_activation_price || 0,
        userPubkey: currentWalletAddress,
      };

      const signature = await refundInsurance(connection, tokenParams, wallet);
      setLocalInsuranceStatus("redeemed");

      addToast({
        title: "Redeem Successful",
        description: `Transaction Signature: ${shortenAddress(signature)}`,
        color: "success",
      });
    } catch (error) {
      console.error("Failed to redeem insurance:", error);
      addToast({
        title: "Redeem Failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        color: "danger",
      });
    } finally {
      setRedeemLoading((prev) => ({ ...prev, [tokenData.address]: false }));
    }
  };

  // 根据状态动态渲染内容
  const renderContent = () => {
    // 公共部分：Conviction Pool 标题
    const header = (
      <div className="flex items-center gap-2 mb-2">
        <Image
          src="/images/insurance/header.svg"
          width={24}
          height={24}
          alt="Conviction Pool Icon"
        />
        <span className="text-[#ffd700] font-bold text-base uppercase">
          CONVICTION POOL
        </span>
      </div>
    );

    const safetyText = (
      <p className="text-[#FCD845]/60 font-cofo text-xs mb-3">
        The Dev has Conviction
      </p>
    );

    // 根据 tokenData 状态渲染
    const statusSection = () => {
      if (!tokenData) {
        return;
      }
      const {
        computed_insurance_status,
        insurance_amt,
        insurance_activation_price,
        created_at,
      } = tokenData;

      const status = computed_insurance_status;
      // 根据状态渲染不同的内容
      if (status === "reserved") {
        return (
          <div className="py-4 px-5 bg-white/5 rounded">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/insurance/Reserved.svg"
                  width={22}
                  height={22}
                  alt="Reserved Icon"
                />
                <span className="text-[#FF8DF7] leading-none font-bold text-[24px] uppercase">
                  RESERVED
                </span>
              </div>
              <p className="text-xs font-cofo">{countdown}</p>
            </div>
            <div className="grid grid-cols-2 mt-3">
              <div>
                <p className="text-[20px]">
                  {formatQuantity(insurance_amt)} SOL
                </p>
                <p className="text-white/60 text-xs font-cofo">
                  Conviction Amount
                </p>
              </div>
              <div>
                <p className="text-[20px]">
                  $
                  {formatQuantity(
                    new Bignumber(1000000000)
                      .times(insurance_activation_price)
                      .times(prices?.solusdt || 170)
                      .toString()
                  )}
                </p>
                <p className="text-white/60 text-xs font-cofo">Market Cap</p>
              </div>
            </div>
            {renderButton()}
          </div>
        );
      }

      if (status === "deployed") {
        return (
          <div className="py-4 px-5 bg-white/5 rounded">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/insurance/Deployed.svg"
                  width={22}
                  height={22}
                  alt="Deployed Icon"
                />
                <span className="text-[#1AE371] leading-none font-bold text-[24px] uppercase">
                  DEPLOYED
                </span>
              </div>
              <p className="text-xs font-cofo">{countdown}</p>
            </div>
            <div className="grid grid-cols-2 mt-3">
              <div>
                <p className="text-[20px]">
                  {formatQuantity(insurance_amt)} SOL
                </p>
                <p className="text-white/60 text-xs font-cofo">
                  Conviction Amount
                </p>
              </div>
              <div>
                <p className="text-[20px]">
                  $
                  {formatQuantity(
                    new Bignumber(1000000000)
                      .times(insurance_activation_price)
                      .times(prices?.solusdt || 170)
                      .toString()
                  )}
                </p>
                <p className="text-white/60 text-xs font-cofo">Market Cap</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <div
                  style={{
                    width: `${tokenData?.progress}%`,
                  }}
                  className={`flex-shrink-0 h-6  bg-[#DDA0DD] border-2 border-black rounded-sm overflow-hidden`}
                >
                  <div className="w-full bg-black/30 h-3 mt-3"></div>
                </div>
                <div
                  style={{
                    width: `${100 - tokenData?.progress}%`,
                  }}
                  className={`flex-shrink-0 h-6  bg-[#FFC107] border-2 border-black rounded-sm overflow-hidden`}
                >
                  <div className="w-full bg-black/30 h-3 mt-3"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-white/60 mt-1">
                <span className="text-[#DDA0DD] text-xs">
                  <span className="font-cofo text-white/60">
                    {tokenData?.symbol}
                  </span>{" "}
                  {tokenData?.progress}%
                </span>
                <span className="text-[#FFC107] text-xs">
                  <span className="font-cofo text-white/60">SOL</span>{" "}
                  {100 - tokenData?.progress}%
                </span>
              </div>
            </div>
            {renderButton()}
          </div>
        );
      }

      if (status === "expired") {
        return (
          <div className="py-4 px-5 bg-white/5 rounded">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/insurance/Expired.svg"
                  width={22}
                  height={22}
                  alt="Expired Icon"
                />
                <span className="text-[#FF8DF7] leading-none font-bold text-[24px] uppercase">
                  EXPIRED
                </span>
              </div>
              <p className="text-xs font-cofo">{countdown}</p>
            </div>
            <div className="grid grid-cols-2 mt-3">
              <div>
                <p className="text-[20px]">
                  {formatQuantity(insurance_amt)} SOL
                </p>
                <p className="text-white/60 text-xs font-cofo">
                  Conviction Amount
                </p>
              </div>
              <div>
                <p className="text-[20px]">
                  $
                  {formatQuantity(
                    new Bignumber(1000000000)
                      .times(insurance_activation_price)
                      .times(prices?.solusdt || 170)
                      .toString()
                  )}
                </p>
                <p className="text-white/60 text-xs font-cofo">Market Cap</p>
              </div>
            </div>
            {renderButton()}
          </div>
        );
      }

      if (status === "retired") {
        return (
          <div className="py-4 px-5 bg-white/5 rounded">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/insurance/Retired.svg"
                  width={22}
                  height={22}
                  alt="Retired Icon"
                />
                <span className="text-white/80 leading-none font-bold text-[24px] uppercase">
                  RETIRED
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 mt-3">
              <div>
                <p className="text-[20px]">
                  {formatQuantity(insurance_amt)} SOL
                </p>
                <p className="text-white/60 text-xs font-cofo">
                  Conviction Amount
                </p>
              </div>
              <div>
                <p className="text-[20px]">
                  $
                  {formatQuantity(
                    new Bignumber(1000000000)
                      .times(insurance_activation_price)
                      .times(prices?.solusdt || 170)
                      .toString()
                  )}
                </p>
                <p className="text-white/60 text-xs font-cofo">Market Cap</p>
              </div>
            </div>
            <div className="w-full bg-[#FF8Df7]/10 mt-3 px-3 py-[6px] flex justify-between rounded-sm items-center">
              <p className="text-white/60 font-cofo text-xs">
                Locked{" "}
                <span className="font-jersey25Regular text-[#FF8DF7] text-base">
                  {" "}
                  $529
                </span>
              </p>
              <p className="text-white/60 font-cofo text-xs">
                Vesting in{" "}
                <span className="font-jersey25Regular text-[#FF8DF7]">
                  {" "}
                  {countdown}
                </span>
              </p>
            </div>
            {renderButton()}
          </div>
        );
      }

      return null;
    };

    // 动态渲染按钮
    const renderButton = () => {
      let buttonText = "";
      let onClickHandler: (() => void) | null = null;
      let isDisabled = false;

      if (tokenData?.computed_insurance_status === "reserved") {
        buttonText = "";
        onClickHandler = null;
      } else if (tokenData?.computed_insurance_status === "deployed") {
        buttonText = "Trade with Conviction Pool";
        onClickHandler = () => {
          window.open(
            `https://www.meteora.ag/dlmm/${convictionPool}`,
            "_blank"
          );
        };
      } else if (tokenData?.computed_insurance_status === "expired") {
        if (isDevUser) {
          const currentStatus =
            localInsuranceStatus || tokenData?.insurance_status;

          if (currentStatus === "can_redeem") {
            buttonText = `${tokenData?.insurance_amt} SOL CLAIMABLE`;
            onClickHandler = handleRedeem;
          } else if (currentStatus === "redeemed") {
            buttonText = "Claimed";
            isDisabled = true;
            onClickHandler = null;
          } else {
            buttonText = "";
            onClickHandler = null;
          }
        } else {
          buttonText = "";
          onClickHandler = null;
        }
      } else if (tokenData?.computed_insurance_status === "retired") {
        if (isDevUser) {
          const currentStatus =
            localInsuranceStatus || tokenData?.insurance_status;
          if (currentStatus === "can_redeem") {
            buttonText = `${tokenData?.insurance_amt} SOL CLAIMABLE`;
            onClickHandler = handleRedeem;
          } else if (currentStatus === "redeemed") {
            buttonText = "Claimed";
            isDisabled = true; // 禁用按钮
          } else {
            buttonText = "";
            onClickHandler = null;
          }
        } else {
          buttonText = "";
          onClickHandler = null;
        }
      }

      return buttonText && (onClickHandler || isDisabled) ? (
        <button
          onClick={onClickHandler || (() => {})}
          disabled={isDisabled}
          className={`w-full mt-4 py-2 border rounded text-sm uppercase flex items-center justify-center gap-2 transition-colors ${
            isDisabled
              ? "bg-gray-500 border-gray-500 text-white/60 cursor-not-allowed"
              : "bg-transparent border-[#ffd700] text-[#ffd700]"
          }`}
        >
          {buttonText}
          {!isDisabled && (
            <Image
              src="/images/insurance/right.svg"
              width={16}
              height={16}
              alt="Button Icon"
            />
          )}
        </button>
      ) : null;
    };

    return (
      <>
        {header}
        {safetyText}
        {statusSection()}
      </>
    );
  };

  return (
    <div className="w-full max-w-[400px] p-4 rounded-[4px_4px_8px_8px] bg-[rgba(255,255,255,0.08)] shadow-[-1px_1px_3px_1px_rgba(255,255,255,0.15)] mx-auto">
      {renderContent()}
    </div>
  );
}
