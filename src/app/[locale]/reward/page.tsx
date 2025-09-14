"use client";
import { fetchTop50, fetchUserPoints, fetchUserTasks } from "@/api/point";
import {
  fetchInvitationCode,
  fetchWalletScore,
  fetchWalletVolume,
  unclaimed,
  unclaimedResponse,
} from "@/api/reward";
import { fetchUserCreatedTokens } from "@/api/token";
import hamburger from "@/components/lottie/hamburger.json";
import { useAuth } from "@/context/AuthContext";
import { formatQuantity } from "@/utils";
import { addToast, Tab, Tabs } from "@heroui/react";
import type { Provider } from "@reown/appkit-adapter-solana";
import { useAppKit, useAppKitProvider } from "@reown/appkit/react";
import Decimal from "decimal.js";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PointView } from "./components/renderPointView";
import { ReferralView } from "./components/renderReferralView";
import { CreatorView } from "./components/renderCreatorView";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export interface tokenCreatedAndGraduatedProps {
  total: number;
  graduated: number;
}

export default function App() {
  const {
    isLoggedIn,
    loading,
    address,
    isConnected,
    userInfo,
    signAndLogin,
    logout,
  } = useAuth();

  const [isLoaded, setIsLoaded] = useState(false);
  const [rewardInfo, setRewardInfo] = useState<unclaimedResponse>();
  const [invitationCode, setInvitationCode] = useState<string>();
  const [walletVolume, setWalletVolume] = useState<{
    volume_in_sol: number;
    volume_in_usd: number;
  }>();
  const [walletScore, setWalletScore] = useState<number>();
  const [isContentWallet, setIsContentWallet] = useState<boolean>(true);
  const [top50Data, setTop50Data] = useState<
    { address: string; total_points: number }[]
  >([]);
  const [userTasks, setUserTasks] = useState<{
    count: { like: number; reply: number; retweet: number; post: number };
    is_flowing: boolean;
  }>();
  const [userPoints, setUserPoints] = useState<{
    expansion_factor: number;
    invite_points: number;
    michelin_points: number;
    rank: number;
    task_points: number;
    total_points: number;
    trade_points: number;
  }>();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const [tokenCreatedAndGraduated, setTokenCreatedAndGraduated] =
    useState<tokenCreatedAndGraduatedProps>({
      total: 0,
      graduated: 0,
    });
  const router = useRouter();
  const t = useTranslations("SolanaWallet");
  const searchParams = useSearchParams();
  const [selectedTab, setSelectedTab] = useState<string>("Point");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { open } = useAppKit();

  const handleConnect = async () => {
    if (isLoggedIn && isConnected) return;
    try {
      if (!isConnected) {
        await open();
      } else {
        await signAndLogin();
      }
    } catch (error) {
      console.error("Connection or login failed:", error);
      addToast({
        title: t("toasts.loginFailed.title"),
        description:
          error instanceof Error
            ? error.message
            : t("toasts.loginFailed.description"),
        color: "danger",
      });
    }
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    setSelectedTab(tab === "Referral" ? "Referral" : "Point");
  }, [searchParams]);

  useEffect(() => {
    const getFetchAllData = async () => {
      if (!token || !address) {
        setIsLoaded(true);
        return;
      }
      try {
        const [
          unclaimedRes,
          walletVolumeRes,
          invitationCode,
          walletScore,
          userCreatedTokens,
          top50Res,
          userTasksRes,
          userPointsRes,
        ] = await Promise.all([
          unclaimed(token),
          fetchWalletVolume(),
          fetchInvitationCode(),
          fetchWalletScore(address),
          fetchUserCreatedTokens(address, {
            page: 1,
            pageSize: 100,
            sort: "balance",
            sortDirection: "desc",
          }),
          fetchTop50(),
          fetchUserTasks(),
          fetchUserPoints(),
        ]);

        if (unclaimedRes && unclaimedRes.code === 200) {
          setRewardInfo(unclaimedRes);
        }

        if (walletVolumeRes.code === 200) {
          setWalletVolume(walletVolumeRes.data);
        }
        if (invitationCode.code === 200) {
          setInvitationCode(invitationCode.data);
        }

        if (walletScore.code === 200) {
          setWalletScore(walletScore.data?.score);
        }

        if (userCreatedTokens.code === 200) {
          const items = userCreatedTokens.data?.items;
          const total = userCreatedTokens.data?.total;
          if (items && items.length > 0 && userCreatedTokens.data) {
            items.forEach((item: { status: string }) => {
              if (item.status === "graduated") {
                setTokenCreatedAndGraduated((prev) => ({
                  total: total || 0,
                  graduated: (prev?.graduated || 0) + 1,
                }));
              }
            });
          }
        }

        if (top50Res && top50Res.leaderboard) {
          setTop50Data(top50Res.leaderboard);
        }

        if (userTasksRes && userTasksRes.count) {
          setUserTasks(userTasksRes);
        }

        if (userPointsRes) {
          setUserPoints(userPointsRes);
        }
      } catch (error) {
        console.log("Error:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    getFetchAllData();

    const intervalId = setInterval(async () => {
      if (!token || !address) {
        return;
      }
      try {
        const [walletVolumeRes, walletScore, userTasksRes, userPointsRes] =
          await Promise.all([
            fetchWalletVolume(),
            fetchWalletScore(address),
            fetchUserTasks(),
            fetchUserPoints(),
          ]);

        if (walletVolumeRes.code === 200) {
          setWalletVolume(walletVolumeRes.data);
        }

        if (walletScore.code === 200) {
          setWalletScore(walletScore.data?.score);
        }

        if (userTasksRes && userTasksRes.count) {
          setUserTasks(userTasksRes);
        }

        if (userPointsRes) {
          setUserPoints(userPointsRes);
        }
      } catch (error) {
        console.log("Polling update error:", error);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [token, address, walletProvider]);

  useEffect(() => {
    const getTop50 = async () => {
      try {
        const [top50Res] = await Promise.all([fetchTop50()]);
        if (top50Res && top50Res.leaderboard) {
          setTop50Data(top50Res.leaderboard);
        }
      } catch (error) {
        console.log("Error:", error);
      }
    };
    getTop50();
  }, []);

  const cofoTextStyle =
    "relative text-[#9f9b9f] tracking-[-0.06em] font-cofo text-darkgray text-left inline-block text-[16px]";
  const tabsStyle = {
    cursor: "w-full bg-[#fcd845]",
    tabContent:
      "group-data-[selected=true]:text-[#fcd845] text-2xl leading-5 uppercase w-full",
  };

  const tabContent = useMemo(
    () => ({
      Point: (
        <div className="flex w-full max-sm:flex-col">
          <RewardLeft
            rewardResponse={rewardInfo}
            userPoints={userPoints}
            top50Data={top50Data}
            LoginState={{ isConnected, isLoggedIn }}
          />
          <PointView
            rewardResponse={rewardInfo}
            walletVolume={walletVolume}
            walletScore={walletScore}
            TCAG={tokenCreatedAndGraduated}
            loginState={{ isConnected, isLoggedIn }}
            invitationCode={invitationCode}
            userTasks={userTasks}
            userPoints={userPoints}
          />
        </div>
      ),
      Referral: (
        <ReferralView
          cofoTextStyle={cofoTextStyle}
          rewardResponse={rewardInfo}
          code={invitationCode}
          loginState={{ isConnected, isLoggedIn }}
        />
      ),
      Creator: (
        <CreatorView
          cofoTextStyle={cofoTextStyle}
          loginState={{ isConnected, isLoggedIn }}
        />
      ),
    }),
    [
      rewardInfo,
      userPoints,
      top50Data,
      isConnected,
      isLoggedIn,
      walletVolume,
      walletScore,
      tokenCreatedAndGraduated,
      invitationCode,
      userTasks,
    ]
  );

  return (
    <div
      className="md:min-h-screen w-full text-white bg-[rgba(19,5,17,1)] border-t-[2px] border-solid border-[rgba(48,33,46,1)]"
      role="main"
    >
      {isLoaded ? (
        <div className="flex w-full flex-col pt-[16px] md:px-10 px-3">
          <Tabs
            aria-label="Options"
            variant="underlined"
            size="lg"
            classNames={tabsStyle}
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
          >
            <Tab className="w-full" key="Point" title="POINTS">
              {tabContent.Point}
            </Tab>
            <Tab key="Referral" title="REBATE">
              {tabContent.Referral}
            </Tab>
            <Tab key="Creator" title="CREATOR">
              {tabContent.Creator}
            </Tab>
          </Tabs>
        </div>
      ) : (
        <div className="flex justify-center items-center h-[50vh]">
          <div className="flex flex-col items-center gap-4">
            <Lottie
              animationData={hamburger}
              loop={true}
              className="w-32 h-32"
            />
            <p className="text-[#FCD845] font-cofo text-[18px] font-bold animate-pulse">
              Cooking up your points...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface LoginState {
  isConnected: boolean;
  isLoggedIn: boolean;
}

type leftRewardResponse = {
  rewardResponse: unclaimedResponse | undefined;
  top50Data: { address: string; total_points: number }[];
  userPoints:
    | {
        expansion_factor: number;
        invite_points: number;
        michelin_points: number;
        rank: number;
        task_points: number;
        total_points: number;
        trade_points: number;
      }
    | undefined;
  LoginState: LoginState;
};

const RewardLeft = ({
  rewardResponse,
  top50Data,
  userPoints,
  LoginState,
}: leftRewardResponse) => {
  const [totalRebateEarnedNumber, setTotalRebateEarnedNumber] =
    useState<number>();
  const [totalPoint, setTotalPoint] = useState<number>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = useMemo(
    () => top50Data.slice(indexOfFirstItem, indexOfLastItem),
    [top50Data, indexOfFirstItem, indexOfLastItem]
  );
  const totalPages = Math.ceil(top50Data.length / itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  useEffect(() => {
    if (rewardResponse?.data) {
      const totalRebateEarned = new Decimal(
        rewardResponse?.data.lv1_claimed_reward
      )
        .add(rewardResponse?.data.lv2_claimed_reward)
        .toNumber();
      setTotalRebateEarnedNumber(totalRebateEarned);

      const totalPointNum = new Decimal(totalRebateEarned)
        .add(rewardResponse.data.total_unclaim_reward)
        .toNumber();
      setTotalPoint(totalPointNum);
    }
  }, [rewardResponse]);

  return (
    <div className="w-[449px] max-sm:w-full max-sm:p-0 flex-shrink-0 pt-0 p-[40px] md:h-[100vh] mt-4 flex flex-col items-center flex-start md:border-r-[2px] md:border-solid md:border-[rgba(48,33,46,1)] pl-0">
      <div className="relative overflow-visible w-full">
        <Image
          src={
            LoginState.isLoggedIn
              ? "/images/point/pointLeftBg.png"
              : "/images/point/pointLeftBgN.png"
          }
          width={369}
          height={294}
          className="w-full"
          alt=""
        />
        <div className="absolute top-0 z-10 w-full px-6 py-3 pt-10">
          <p className="text-[18px] font-cofo text-center">Total Points</p>
          <p className="text-[80px] text-[#FCD845] text-center">
            {LoginState.isLoggedIn && userPoints?.total_points
              ? formatQuantity(userPoints?.total_points || 0)
              : "-"}
          </p>
          {LoginState.isLoggedIn &&
          userPoints?.rank &&
          userPoints?.rank >= 25 ? (
            <p className="text-[16px] font-cofo text-center">
              You've beaten{" "}
              <span className="text-[20px] text-[#FF8DF7]">
                {formatQuantity(userPoints?.rank || 0)}%
              </span>{" "}
              of users!
            </p>
          ) : null}
          {LoginState.isLoggedIn && (
            <div
              className={`flex justify-between items-center ${
                userPoints?.rank && userPoints?.rank >= 25
                  ? "mt-12  max-sm:mt-4"
                  : "mt-[5rem]  max-sm:mt-9"
              } `}
            >
              <div>
                <p className="text-[14px]">Multiplier Active</p>
                <p className="text-[12px] font-cofo text-[#9F9B9F]">
                  By Referral User Trading Volume
                </p>
              </div>
              <p className="text-[24px] text-[#FF8DF7]">
                {userPoints?.expansion_factor || 1}X
              </p>
            </div>
          )}
        </div>
        <div className="bg-[#1D131B] border-[1px] border-[#FF8DF7]/20 p-5 mt-6">
          <div className="flex justify-between items-center">
            <p className="text-[18px]">
              <span className="text-[#FF8DF7]">Top 50</span> leaderboard
            </p>
            <div className="flex items-center justify-between w-[72px]">
              <div
                className={`w-6 h-6 border-[1px] border-[#FF8DF7]/20 flex items-center justify-center cursor-pointer ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handlePrevPage}
              >
                <Image
                  src="/images/point/leftAllow.svg"
                  width={10}
                  height={8}
                  alt="Previous page"
                />
              </div>
              <div className="font-cofo text-[14px]">{currentPage}</div>
              <div
                className={`w-6 h-6 border-[1px] border-[#FF8DF7]/20 flex items-center justify-center cursor-pointer ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={handleNextPage}
              >
                <Image
                  src="/images/point/rightAllow.svg"
                  width={10}
                  height={8}
                  alt="Next page"
                />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between">
              <p className="font-cofo text-xs text-[#9F9B9F]">User</p>
              <p className="font-cofo text-xs text-[#9F9B9F]">Total Points</p>
            </div>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between border-b-1 border-[#332231] pb-3 mt-3"
                >
                  <p>
                    <span className="text-[#FCD845] text-[16px] mr-1">
                      {(indexOfFirstItem + index + 1)
                        .toString()
                        .padStart(2, "0")}
                    </span>
                    <span className="text-[14px] text-[#9F9B9F]">
                      {item.address.slice(0, 6)}...{item.address.slice(-6)}
                    </span>
                  </p>
                  <p className="text-[14px]">
                    {item.total_points.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex justify-center text-[14px] font-cofo text-[#9F9B9F] mt-3">
                No data available at the moment
              </div>
            )}
          </div>
        </div>
        <p className="text-[12px] font-cofo text-[#9F9B9F] mt-6 max-sm:mb-6 max-sm:text-center">
          Points will be updated daily at 00:00 (UTC).
        </p>
      </div>
    </div>
  );
};
