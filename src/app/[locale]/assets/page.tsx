"use client";

import { fetchUserPoints } from "@/api/point";
import {
  fetchInvitationCode,
  unclaimed,
  unclaimedResponse,
} from "@/api/reward";
import FancyButton from "@/components/FancyButton";
import ProfileCard from "@/components/ProfileCard";
import TokenTable from "@/components/TokenTable";
import { useAuth } from "@/context/AuthContext";
import { Link } from "@/i18n/navigation";
import { formatQuantity } from "@/utils";
import { Snippet } from "@heroui/react";
import type { Provider } from "@reown/appkit-adapter-solana";
import { useAppKitProvider } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { FaXTwitter } from "react-icons/fa6";

interface UserPoints {
  expansion_factor: number;
  invite_points: number;
  michelin_points: number;
  rank: number;
  task_points: number;
  total_points: number;
  trade_points: number;
}

// 自定义 Hook 用于获取资产页面数据
function useAssetsData() {
  const [rewardInfo, setRewardInfo] = useState<unclaimedResponse>();
  const [invitationCode, setInvitationCode] = useState<string>();
  const [userPoints, setUserPoints] = useState<UserPoints>();
  const { address } = useAuth();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchAllData = async () => {
    if (!token || !address) {
      return;
    }
    try {
      const [unclaimedRes, invitationCodeRes, userPointsRes] =
        await Promise.all([
          unclaimed(token),
          fetchInvitationCode(),
          fetchUserPoints(),
        ]);

      if (unclaimedRes && unclaimedRes.code === 200) {
        setRewardInfo(unclaimedRes);
      }

      if (invitationCodeRes.code === 200) {
        setInvitationCode(invitationCodeRes.data);
      }

      if (userPointsRes) {
        setUserPoints(userPointsRes);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token, address, walletProvider]);

  return {
    rewardInfo,
    invitationCode,
    userPoints,
  };
}

interface MyRewardCardProps {
  rewardInfo?: unclaimedResponse;
  invitationCode?: string;
  userPoints?: UserPoints;
  isLoggedIn: boolean;
  signAndLogin: () => void;
}

function MyRewardCard({
  rewardInfo,
  invitationCode,
  userPoints,
  isLoggedIn,
  signAndLogin,
}: MyRewardCardProps) {
  const snippetStyle = {
    pre: "pl-1 line-clamp-1 text-ellipsis font-jersey25Regular text-sm",
    base: "w-full border-1 border-[#473745] bg-[#271B24] p-2",
  };

  return (
    <div className="mt-12 w-[338px] mx-auto border-1 border-[#332231] px-4">
      <h3 className="font-jersey25Regular text-lg text-center my-5">
        My Reward
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="border-2 border-[#332231] py-4">
          <div className="text-[#857A83] font-cofo text-sm text-center">
            Cooking Points
          </div>
          <div className="text-[#FCD845] text-lg text-center font-jersey25Regular">
            {userPoints?.total_points
              ? formatQuantity(userPoints.total_points)
              : 0}
          </div>
          <div className="text-white font-cofo text-sm text-center mt-4">
            <Link href="/reward?tab=Point">View Detail</Link>
          </div>
        </div>
        <div className="border-2 border-[#332231] py-4">
          <div className="text-[#857A83] font-cofo text-sm text-center">
            Referral Rebate
          </div>
          <div className="text-[#FF8DF7] text-lg text-center font-jersey25Regular">
            {rewardInfo?.data.total_unclaim_reward
              ? formatQuantity(rewardInfo.data.total_unclaim_reward)
              : 0}{" "}
            Sol
          </div>
          <div className="text-white font-cofo text-sm text-center mt-4">
            <Link href="/reward?tab=Referral">View Detail</Link>
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-[#9F9B9F] text-sm font-cofo py-2">
            Referral code
          </div>
          <Snippet classNames={snippetStyle} symbol="" radius="none">
            {invitationCode || "Please connect wallet"}
          </Snippet>
        </div>
        <div className="col-span-2">
          <div className="text-[#9F9B9F] text-sm font-cofo py-2">
            Referral link
          </div>
          <Snippet classNames={snippetStyle} symbol="" radius="none">
            {invitationCode
              ? `cooking.city/en?invite_code=${invitationCode}`
              : "Please connect wallet"}
          </Snippet>
        </div>
        <div className="col-span-2 mt-4 mb-8">
          {isLoggedIn ? (
            <Link
              href={
                "https://x.com/intent/tweet?text=" +
                encodeURIComponent(
                  `Hey Chef, join the #OnchainRenaissance with @CookingCityHQ now! https://cooking.city?invite_code=${invitationCode}`
                )
              }
              target="_blank"
            >
              <FancyButton
                buttonText="REFER ON"
                height={40}
                className="w-full"
                endIcon={<FaXTwitter className="text-black" />}
              ></FancyButton>
            </Link>
          ) : (
            <FancyButton
              buttonText={"CONNECT"}
              className="w-full"
              height={40}
              onClick={signAndLogin}
            ></FancyButton>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssetsPage() {
  const { isLoggedIn, signAndLogin } = useAuth();
  const [totalTokens, setTotalTokens] = useState(0);
  const { rewardInfo, invitationCode, userPoints } = useAssetsData();

  const handleTotalChange = (total: number) => {
    setTotalTokens(total);
  };

  return (
    <>
      <div
        className="w-full flex justify-between max-sm:flex-col max-sm:p-2 px-10 bg-[#130511]"
        role="main"
      >
        <div className="w-[449px] max-sm:w-full max-sm:border-none max-sm:p-0  border-r-1 border-[#332231] py-8">
          <ProfileCard tokenCount={totalTokens} />
          <div className="hidden lg:block">
            <MyRewardCard
              rewardInfo={rewardInfo}
              invitationCode={invitationCode}
              userPoints={userPoints}
              isLoggedIn={isLoggedIn}
              signAndLogin={signAndLogin}
            />
          </div>
        </div>
        <TokenTable onTotalChange={handleTotalChange} />
        <div className="lg:hidden py-4">
          <MyRewardCard
            rewardInfo={rewardInfo}
            invitationCode={invitationCode}
            userPoints={userPoints}
            isLoggedIn={isLoggedIn}
            signAndLogin={signAndLogin}
          />
        </div>
      </div>
    </>
  );
}
