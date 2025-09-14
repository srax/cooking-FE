"use client";

import { applyReward, RewardData, unclaimedResponse } from "@/api/reward";
import { useMedia768 } from "@/Common";
import { useAuth } from "@/context/AuthContext";
import {
  calculateRemainingTime,
  formatQuantity,
  generateRandomFutureTime,
  shortenAddress,
} from "@/utils";
import {
  Avatar,
  Snippet,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useAsyncList } from "@react-stately/data";
import { Decimal } from "decimal.js";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
export type ReferralView = {
  cofoTextStyle?: string;
  claimState?: boolean;
  rewardResponse?: unclaimedResponse;
  code?: string;
  loginState: LoginState;
};
interface LoginState {
  isConnected: boolean;
  isLoggedIn: boolean;
}

export const ReferralView = ({
  cofoTextStyle,
  rewardResponse,
  code,
  loginState,
}: ReferralView) => {
  const [rewardData, setRewardData] = useState<RewardData>();
  const snippetStyle = {
    pre: "!font-jersey25Regular text-[20px] md:w-sm",
    base: "bg-[rgba(39,27,36,0.5)] rounded-[2px] border-[1px] border-[#473745]",
  };
  const router = useRouter();
  const handleClick = () => {
    if (!loginState.isConnected || !loginState.isLoggedIn) {
      return;
    }
    const xLink = `Hey Chef, join the #OnchainRenaissance with @CookingCityHQ now! https://cooking.city?invite_code=${code}`;

    const encodeURL = encodeURIComponent(xLink);
    window.open(`https://x.com/intent/tweet?text=${encodeURL}`, "_blank");
  };

  const referralBoxStyle =
    "w-full relative rounded-lg bg-gray border-[rgba(255,141,247,0.2)] border-solid border-[1px] box-border md:h-[146px] flex justify-between md:py-4 md:px-10 p-5 text-left text-5xl text-white";
  useEffect(() => {
    if (rewardResponse?.code === 200) {
      setRewardData(rewardResponse.data);
    }
  }, [rewardResponse]);
  const isMobile = useMedia768();

  return (
    <div>
      {/* <ConnectModal isOpen={!rewardData} onClose={() => {}}>
        <div>「Please connect wallet to continue」</div>
      </ConnectModal> */}
      <div className="w-full min-h-[200px] pt-5 md:max-h-[400px] relative bg-gray box-border flex flex-col items-start justify-between gap-6 text-left text-white">
        <h1 className="text-[32px] leading-9 md:leading-6 uppercase text-white text-left  inline-block">
          Refer your fren and earn trading fee rebate while they trade!
        </h1>

        <div className="flex gap-8 w-full ">
          <div>
            <span className={cofoTextStyle + " w-full"}>L1 Rebate rate</span>
            <div className="flex items-center mt-2">
              <span className="text-5xl tracking-[-0.06em] text-white text-left mr-2">
                {new Decimal(rewardData?.lv1_rebate_rate || 0.28)
                  .mul(100)
                  .toNumber()}
                %
              </span>
            </div>
          </div>

          <div>
            <span className={cofoTextStyle + " w-full"}>L2 Rebate rate</span>
            <div className="text-5xl tracking-[-0.06em] text-white text-left mt-2">
              {new Decimal(rewardData?.lv2_rebate_rate || 0.07)
                .mul(100)
                .toNumber()}
              %
            </div>
          </div>

          <div className="flex-1"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 w-full md:items-end md:justify-start">
          <div className="flex flex-col">
            <span className={cofoTextStyle}>Referral code</span>
            <Snippet classNames={snippetStyle} symbol="" radius="none">
              {code || "Please connect wallet"}
            </Snippet>
          </div>

          <div className="flex flex-col">
            <span className={cofoTextStyle}>Referral link</span>
            <Snippet classNames={snippetStyle} symbol="" radius="sm">
              {code
                ? `cooking.city/en?invite_code=${code}`
                : "Please connect wallet"}
            </Snippet>
          </div>

          <ButtonRender
            fontSize={20}
            icon={
              <Image
                src="/images/reward/reward_twitter.svg"
                alt=""
                width={20}
                height={20}
              />
            }
            onClick={handleClick}
            full={isMobile}
          />
        </div>
      </div>
      <Claim
        cofoTextStyle={cofoTextStyle}
        claimState={true}
        rewardResponse={rewardResponse}
        code={code}
        loginState={loginState}
      />

      <div className="mt-8">
        <div className="grid md:gap-2 gap-4 md:grid-cols-2 grid-cols-1 md:gap-x-8">
          <div className={referralBoxStyle}>
            <div className=" h-full flex items-center justify-start gap-1 z-[0]">
              <div className="relative">
                <Image
                  width={56}
                  height={28}
                  src="/images/reward/reward-level-icon.svg"
                  alt="level"
                  className="z-20"
                />
                <div className="w-[100px] h-[58px] absolute !!m-[0 important] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:[filter:blur(18px)] [filter:blur(12px)]  rounded-[50%] md:bg-[rgba(255,141,247,0.4)] bg-[rgba(255,141,247,0.3)] " />
                <span className="w-2 absolute md:text-2xl text-xl top-1/2 left-[72%] -translate-x-1/2 -translate-y-1/2 tracking-[-0.06em] text-black text-left inline-block">
                  1
                </span>
              </div>
              <div
                className={`${
                  rewardData?.lv1_refer_count || 0 >= 1000
                    ? "text-2xl"
                    : "text-3xl"
                } md:w-16 w-12 text-center`}
              >
                {rewardData?.lv1_refer_count || 0}
              </div>
              <div className="text-sm tracking-[-0.06em] font-cofo text-white text-left">
                L1 Referee
              </div>
            </div>

            <div className=" h-full flex flex-row items-center justify-end gap-2 z-[0]">
              <Avatar
                size="sm"
                src="https://raw.githubusercontent.com/solana-labs/solana/7700cb3128c1f19820de67b81aa45d18f73d2ac0/docs/static/img/logo.svg"
              />
              <div className="relative text-2xl tracking-[-0.06em] text-white text-left flex-1">
                {rewardData?.lv1_claimed_reward || 0}
              </div>
              <div className="w-[49px] relative text-sm tracking-[-0.06em] font-cofo text-[#9f9b9f] text-right flex items-center h-[15px]">
                Earned
              </div>
            </div>
          </div>
          <div className={referralBoxStyle}>
            <div className=" h-full flex items-center justify-start gap-1 z-[0]">
              <div className="relative">
                <Image
                  width={56}
                  height={28}
                  src="/images/reward/reward-level-icon.svg"
                  alt="level"
                  className="z-20"
                />
                <div className="w-[100px] h-[58px] absolute !!m-[0 important] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:[filter:blur(18px)] [filter:blur(12px)]  rounded-[50%] md:bg-[rgba(255,141,247,0.4)] bg-[rgba(255,141,247,0.3)] " />
                <span className="w-2 absolute md:text-2xl text-xl top-1/2 left-[72%] -translate-x-1/2 -translate-y-1/2 tracking-[-0.06em] text-black text-left inline-block">
                  2
                </span>
              </div>
              <div
                className={`${
                  rewardData?.lv2_refer_count || 0 >= 1000
                    ? "text-2xl"
                    : "text-3xl"
                } md:w-16 w-12 text-center`}
              >
                {rewardData?.lv2_refer_count || 0}
              </div>
              <div className="text-sm tracking-[-0.06em] font-cofo text-white text-left">
                L2 Referee
              </div>
            </div>

            <div className=" h-full flex flex-row items-center justify-end gap-2 z-[0]">
              <Avatar
                size="sm"
                src="https://raw.githubusercontent.com/solana-labs/solana/7700cb3128c1f19820de67b81aa45d18f73d2ac0/docs/static/img/logo.svg"
              />
              <div className="relative text-2xl tracking-[-0.06em] text-white text-left flex-1">
                {rewardData?.lv2_claimed_reward || 0}
              </div>
              <div className="w-[49px] relative text-sm tracking-[-0.06em] font-cofo text-[#9f9b9f] text-right flex items-center h-[15px]">
                Earned
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomTable />
    </div>
  );
};
interface ButtonRenderProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  fontSize?: number;
  icon?: React.ReactNode;
  text?: string;
  isuUppercase?: boolean;
  className?: string;
  full?: boolean; // 新增 full 参数
}
export const ButtonRender = ({
  width = 240,
  height = 48,
  borderRadius = 2,
  fontSize = NaN,
  icon,
  text = "REFER ON",
  isuUppercase = false,
  className = "",
  full = false, // 默认值为 false
  onClick,
}: ButtonRenderProps & {
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void;
}) => {
  // 统一处理鼠标和触摸事件
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.(e);
  };

  // 计算内部元素的相对尺寸
  const innerWidth: any = full ? "100%" : Math.round(width * 0.75);
  const innerHeight = Math.round(height * 0.765);
  const bgHeight = innerHeight + Math.round(height * 0.088);
  const offset = Math.round(height * 0.058);
  const textSize = fontSize || Math.round(height * 0.47);

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.95, y: 2 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={`relative flex items-center select-none touch-none ${className}`}
      style={{
        width: full ? "100%" : `${innerWidth}px`,
        height: `${bgHeight}px`,
        minWidth: "44px",
        minHeight: "44px",
      }}
      onClick={handleClick}
      onTouchStart={handleClick}
    >
      {/* 背景层 */}
      <div
        className="absolute bg-[#A19900] border-[1px] border-solid border-[#000]"
        style={{
          top: `${offset}px`,
          width: full ? "100%" : `${innerWidth}px`,
          height: `${bgHeight}px`,
          borderRadius: `${borderRadius}px`,
        }}
      />

      {/* 主按钮 */}
      <div
        className="absolute bg-[#FFEA96] shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_4px_6px_-1px_rgba(0,0,0,0.3)] flex items-center justify-center border-[1px] border-solid border-[#000]"
        style={{
          top: `${offset}px`,
          width: full ? "100%" : `${innerWidth}px`,
          height: `${innerHeight}px`,
          borderRadius: `${borderRadius}px`,
        }}
      >
        <div
          className="bg-[#FCD845] text-black text-center font-bold flex justify-center items-center"
          style={{
            width: full ? "calc(100% - 2px)" : `${innerWidth - 2}px`,
            height: `${innerHeight - 3}px`,
            marginTop: "1px",
            fontSize: `${textSize}px`,
            lineHeight: `${innerHeight - 3}px`,
            borderBottomLeftRadius: `${borderRadius}px`,
            borderBottomRightRadius: `${borderRadius}px`,
          }}
        >
          <p className={isuUppercase ? "uppercase" : ""}>{text}</p>
          {icon && <span className="ml-1 max-sm:ml-0.5">{icon}</span>}
        </div>
      </div>

      {/* 装饰元素，仅在非 full 模式下显示 */}
      {!full && (
        <div
          className="absolute bg-black"
          style={{
            left: `${width * 1.394}px`,
            top: `${height * 0.598}px`,
            width: "0.3906px",
            height: "0.3906px",
          }}
        />
      )}
    </motion.div>
  );
};

export const Claim = ({
  cofoTextStyle,
  claimState,
  rewardResponse,
  code,
  loginState,
}: ReferralView) => {
  const [futureEvent, setFutureEvent] = useState<Date | null>(null);
  const [isTimeValid, setIsTimeValid] = useState(false);
  const [time, setTime] = useState<{
    h?: string;
    m?: string;
    s?: string;
  } | null>(null);

  const isMobile = useMedia768();
  const SOLANA_RPC_URL =
    process.env.NEXT_PUBLIC_IS_DEV === "false"
      ? process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com"
      : process.env.NEXT_PUBLIC_DEV_RPC_URL || "";

  const {
    isLoggedIn,
    loading,
    address,
    isConnected,
    userInfo,
    signAndLogin,
    logout,
  } = useAuth();










  useEffect(() => {
    // 假设接口返回未来时间或 null（如：loading/失败状态）
    const mockFetchTime = async () => {
      const eventTime = generateRandomFutureTime(); // 实际为接口返回值  generateRandomFutureTime()
      setFutureEvent(eventTime);
    };
    mockFetchTime();
  }, []);



  useEffect(() => {
    // 检查时间是否有效（非 null 且为未来时间）
    if (!futureEvent) {
      setIsTimeValid(false);
      return; // 时间未初始化或无效，不启动定时器
    }

    try {
      calculateRemainingTime(futureEvent); // 校验时间有效性
      setIsTimeValid(false); // !! 关闭时间
    } catch (error) {
      setIsTimeValid(false);
      return; // 时间已过期或无效，不启动定时器
    }

    // 启动定时器
    const interval = setInterval(() => {
      try {
        const newTime = calculateRemainingTime(futureEvent); // 已校验有效性，可安全断言
        setTime(newTime);
      } catch (error) {
        setIsTimeValid(false);
        clearInterval(interval); // 时间过期，清除定时器
      }
    }, 1000);

    return () => {
      clearInterval(interval); // 组件卸载或时间变更时清除定时器
    };
  }, [futureEvent]);
  const isClaimNowRender = () => {
    return claimState
      ? {
          svg: "rgba(91,55,88,1)",
          border: "rgba(255,141,247,0.2)",
          shadow: "shadow-[0px_-8px_37.3px_rgba(255,_141,_247,_0.28)_inset]",
        }
      : { svg: "rgba(51,34,49,1)", border: "#332231", shadow: "" };
  };

  return (
    <div>
      <div className="relative">
        {loginState.isConnected && loginState.isLoggedIn ? (
          <div
            className={`w-full md:min-h-[48px] mt-8 relative rounded-lg bg-gray border-solid border-[1px] box-border flex md:flex-row flex-col items-center justify-between p-6 gap-6 text-left text-white border-[${
              isClaimNowRender().border
            }] ${isClaimNowRender().shadow}`}
          >
            <div className="flex-1">
              {/* 左侧内容 */}
              <div className="flex items-center w-full">
                <div className="text-4xl tracking-[-0.06em] text-left inline-block text-[#ff8df7] flex items-center">
                  <span>{rewardResponse?.data.total_unclaim_reward || 0}</span>
                  <span className="text-white">&nbsp;SOL</span>
                </div>
                <div className="flex items-center ml-4">
                  <div className={cofoTextStyle + " md:min-w-[200px]"}>
                    to be claimed
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧倒计时 + 按钮 */}
            <div className="flex items-center gap-4 md:w-auto w-full md:flex-row flex-col ">
              {/* 倒计时 */}

              {time && isTimeValid && (
                <div className="flex-shrink-0">
                  <div className="flex">
                    <div className="w-[40px] h-[40px] bg-[#271b24] border-[#473745] border-solid border-[1px] rounded-sm flex flex-col items-center justify-center p-2 text-xl text-white">
                      <div>{time.h || "00"}</div>
                    </div>
                    <div className="flex items-center h-[40px] px-3 text-2xl text-white">
                      :
                    </div>
                    <div className="w-[40px] h-[40px] bg-[#271b24] border-[#473745] border-solid border-[1px] rounded-sm flex flex-col items-center justify-center p-2 text-xl text-white">
                      <div>{time.m || "00"}</div>
                    </div>
                    <div className="flex items-center h-[40px] px-3 text-2xl text-white">
                      :
                    </div>
                    <div className="w-[40px] h-[40px] bg-[#271b24] border-[#473745] border-solid border-[1px] rounded-sm flex flex-col items-center justify-center p-2 text-xl text-white">
                      <div>{time.s || "00"}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 按钮盒子 */}
              <ClaimButton isClaimNow={!!claimState} />
            </div>
          </div>
        ) : (
          <div
            className={`border-[${
              isClaimNowRender().border
            }] w-full md:min-h-[48px] mt-8 relative rounded-lg bg-gray border-solid border-[1px] box-border flex md:flex-row flex-col items-center justify-center p-6 gap-6 text-center text-3xl text-white`}
          >
            「Please connect wallet to continue」
          </div>
        )}

        {/* SVG边框 */}
        {isMobile ? (
          <svg
            viewBox="0 0 350 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="absolute top-[-2px] left-[-2px] w-[calc(100%+4px)] h-[calc(100%+4px)]"
          >
            <path d="M350 2V16H344V6H334V0H348V2H350Z" fill="#332231" />
            <path
              d="M350 148V134H344V144H334V150H348V148H350Z"
              fill="#332231"
            />
            <path d="M0 3V17H6V7H16V1H2V3H0Z" fill="#332231" />
            <path d="M0 148V134H6V144H16V150H2V148H0Z" fill="#332231" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 1015 87"
            fill={isClaimNowRender().svg}
            xmlns="http://www.w3.org/2000/svg"
            className="absolute top-[-3px] left-[-3px] w-[calc(100%+6px)] h-[calc(100%+6px)] z-20"
            preserveAspectRatio="none"
          >
            <path d="M1015 2V16H1009V6H999V0H1013V2H1015Z" />
            <path d="M1015 85V71H1009V81H999V87H1013V85H1015Z" />
            <path d="M0 3V17H6V7H16V1H2V3H0Z" />
            <path d="M0 85V71H6V81H16V87H2V85H0Z" />
          </svg>
        )}
      </div>

    </div>
  );
};
interface ClaimButtonProps {
  isClaimNow: boolean;
}

export const ClaimButton = ({ isClaimNow }: ClaimButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimButtonStyle =
    "z-40 relative rounded bg-[#332231] w-full flex items-center justify-center py-2.5 px-5 text-xl text-white uppercase transition-colors hover:bg-[#473745] disabled:opacity-50 disabled:cursor-not-allowed";

  const handleClaim = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get token from localStorage
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        setError("Please log in to claim rewards");
        return;
      }

      const response = await applyReward(token);

      if (response.code === 200) {
        // Success case
        console.log("Reward claimed successfully:", response.data);
        // You might want to trigger a refresh of reward data here
      } else {
        setError(response.error || "Failed to claim reward");
      }
    } catch (err) {
      setError("An error occurred while claiming the reward");
      console.error("Claim error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClaim}
      className={claimButtonStyle}
      disabled={!isClaimNow || isLoading}
    >
      {isLoading
        ? "Processing..."
        : error
        ? error
        : isClaimNow
        ? "Claim Now"
        : "Claimable Soon"}
    </button>
  );
};


export interface Column {
  name: string;
  uid: string;
}

export interface ReferralResponse {
  code: number;
  data: {
    items: ReferralItem[];
    pagination: PaginationInfo;
  };
}

export interface ReferralItem {
  id: number;
  joined_at: Date;
  profile: UserProfile;
  total_rebate: number;
  wallet: string;
  referee_level: number;
}

export interface UserProfile {
  avatar_url: string;
  bio: string;
  nickname: string;
}

export interface PaginationInfo {
  has_next: boolean;
  has_previous: boolean;
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export const BottomTable = () => {
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const tableStyle = {
    base: "max-h-[520px] overflow-scroll overflow-x-auto mt-6 w-full",
    wrapper: "overflow-auto scrollbar-hide bg-transparent w-full",
    thead:
      "backdrop-blur-none text-[16px] font-cofo ![&>tr]:first:!shadow-none shadow-none border-0 bg-transparent", // 禁用毛玻璃特效
  };
  const tableColumns: Column[] = [
    { name: "REFEREE ADDRESS", uid: "refereeAddress" },
    { name: "REFERRAL LEVEL", uid: "level" },
    { name: "JOINED AT", uid: "joinAT" },
    { name: "TOTAL REBATE TO YOU", uid: "total" },
  ];

  const list = useAsyncList<ReferralItem>({
    async load({ signal, cursor }) {
      if (cursor) {
        setIsLoading(false);
      }
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(
        cursor || "/api/invitation/reward/referee/list",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const resJson: ReferralResponse = await response.json();
      if (resJson.code !== 200) {
        return { items: [], cursor: "" };
      }
      const items = resJson.data.items;
      console.log(resJson, "resJson");

      // setHasMore(resJson.data.pagination.has_next);

      return {
        items: items || [],
        cursor,
      };
    },
  });

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: list.isLoading,
    onLoadMore: list.loadMore,
  });

  const renderCell = useCallback((item: ReferralItem, columnKey: React.Key) => {
    switch (columnKey) {
      case "refereeAddress":
        return (
          <div>
            <div className="flex items-center">
              <Avatar
                radius="none"
                src={item.profile.avatar_url}
                className="rounded-[4px] min-w-[40px] min-h-[40px] max-w-full max-h-full mr-2"
              />
              <div className="flex flex-col">
                <span className="text-[clamp(0.875rem,1.75vw,1.125rem)] text-white">
                  {shortenAddress(item.wallet)}
                </span>
              </div>
            </div>
          </div>
        );
      case "level":
        return (
          <div>
            <div className="flex flex-col min-w-[110px] items-left">
              {item.referee_level}
            </div>
          </div>
        );
      case "joinAT":
        const joinAt = new Intl.DateTimeFormat("en-US", {
          day: "numeric",
          month: "short",
        }).format(new Date(item.joined_at));

        return (
          <div className="text-sm font-cofo text-gray text-left flex items-center [text-shadow:2.7222445011138916px_0.5444489121437073px_0px_#000]">
            {joinAt}
          </div>
        );
      case "total":
        return (
          <div className="text-sm font-cofo text-[rgba(255,255,255,0.6)] text-left flex items-center [text-shadow:2.7222445011138916px_0.5444489121437073px_0px_#000]">
            {formatQuantity(item.total_rebate)} SOL
          </div>
        );
    }
  }, []);

  return (
    <Table
      aria-label="Example table with infinite pagination"
      removeWrapper
      disallowEmptySelection={true}
      selectionMode="single"
      baseRef={scrollerRef}
      classNames={tableStyle}
      bottomContent={
        hasMore ? (
          <div className="flex w-full justify-center">
            <Spinner ref={loaderRef} color="white" />
          </div>
        ) : null
      }
    >
      <TableHeader
        id="customThead"
        className="![&>tr]:shadow-none ![&>tr]:border-none"
        columns={tableColumns}
      >
        {(tableColumns: Column) => (
          <TableColumn
            style={{ background: "transparent" }}
            key={tableColumns.uid}
          >
            {tableColumns.name}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody
        items={list.items}
        loadingContent={<Spinner />}
        isLoading={isLoading}
      >
        {(item: ReferralItem) => (
          <TableRow
            key={item.id}
            className="border-b-[0.5px] border-solid border-[rgba(51,34,49,0.3)]"
          >
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
