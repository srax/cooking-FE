"use client";
import { useState, useEffect, useMemo } from "react";
import { Tab, Tabs, Snippet, addToast } from "@heroui/react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { FaXTwitter } from "react-icons/fa6";
import dynamic from "next/dynamic";
import FancyButton from "@/components/FancyButton";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/context/AuthContext";
import { formatQuantity } from "@/utils";
import hamburger from "@/components/lottie/hamburger.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface MockUserPoints {
  expansion_factor: number;
  invite_points: number;
  michelin_points: number;
  rank: number;
  task_points: number;
  total_points: number;
  trade_points: number;
}

interface MockUserTasks {
  count: { like: number; reply: number; retweet: number; post: number };
  is_flowing: boolean;
}

interface MockWalletVolume {
  volume_in_sol: number;
  volume_in_usd: number;
}

export default function ChefIDRewardsPage() {
  const { isLoggedIn, isConnected, userInfo, signAndLogin } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("Leaderboard");

  // Mock data - in real implementation, these would come from API calls
  const [mockUserPoints, setMockUserPoints] = useState<MockUserPoints>({
    expansion_factor: 2.5,
    invite_points: 15420,
    michelin_points: 8930,
    rank: 25,
    task_points: 12500,
    total_points: 47850,
    trade_points: 11000,
  });

  const [mockUserTasks, setMockUserTasks] = useState<MockUserTasks>({
    count: { like: 45, reply: 12, retweet: 28, post: 8 },
    is_flowing: true,
  });

  const [mockWalletVolume, setMockWalletVolume] = useState<MockWalletVolume>({
    volume_in_sol: 24.5,
    volume_in_usd: 5680,
  });

  const [mockTop50Data] = useState([
    { address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", total_points: 125420 },
    { address: "7xKXtg2CW9UqViAFmqiZKX7Bj1qGZw6VqjqnkTM7vMmp", total_points: 98750 },
    { address: "5vAXbYjNPVe4w9ZzKqUHqjgWKm8GvQnrTqMx3WqKzTpP", total_points: 87630 },
    { address: "8yZbNmHfGkUjQ9VvWqMxzKpLnGjHkJfPqZkT3RjVmNqA", total_points: 76540 },
    { address: "6uGfLqMjPvQz8WnHxKpTjVmZeYgFhJqUz3QmKzBvPtRx", total_points: 65890 },
    { address: "4tMpRqJgHvXz7WkQyKzLnBjFhPqGzJxUv2NmKwCvQsYu", total_points: 58470 },
    { address: "3sLpGqHfMvWz6YnQxKwJnMjGhKqFzJvUt1LmJzBvOtRu", total_points: 52360 },
    { address: "2rKpEqGfLvVz5XmPwJvKmLjFhJqDzItUs0KmJwBvNsQt", total_points: 48950 },
    { address: "1qJpDqFfKuUz4WlOwIuJlKiFgIpCzHsUr9JlIvAuMrPs", total_points: 47850 },
    { address: "9pIpCpEfJtTz3VkNvHtIkJhEfHpBzGrUq8IkHuAtLqOr", total_points: 45720 },
  ]);

  const [invitationCode] = useState("CHEF2025");

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setIsLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const tabsStyle = {
    cursor: "w-full bg-[#fcd845]",
    tabContent:
      "group-data-[selected=true]:text-[#fcd845] text-2xl leading-5 uppercase w-full",
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full text-white bg-[rgba(19,5,17,1)] flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Lottie
            animationData={hamburger}
            loop={true}
            className="w-32 h-32"
          />
          <p className="text-[#FCD845] font-cofo text-[18px] font-bold animate-pulse">
            Cooking up your ChefID rewards...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full text-white bg-[rgba(19,5,17,1)] border-t-[2px] border-solid border-[rgba(48,33,46,1)]"
      role="main"
    >
      <div className="flex w-full flex-col pt-[16px] md:px-10 px-3">
        <Tabs
          aria-label="ChefID Navigation"
          variant="underlined"
          size="lg"
          classNames={tabsStyle}
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
        >
          <Tab className="w-full" key="Leaderboard" title="LEADERBOARD">
            <ChefPointsTab
              userPoints={mockUserPoints}
              userTasks={mockUserTasks}
              walletVolume={mockWalletVolume}
              top50Data={mockTop50Data}
              invitationCode={invitationCode}
              loginState={{ isConnected, isLoggedIn }}
            />
          </Tab>
          <Tab key="ChefID" title="CHEFID">
            <div className="p-8 text-center">
              <h2 className="text-2xl mb-4 text-[#FCD845]">ChefID Profile</h2>
              <p className="text-[#9F9B9F]">ChefID features coming soon...</p>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

interface ChefPointsTabProps {
  userPoints: MockUserPoints;
  userTasks: MockUserTasks;
  walletVolume: MockWalletVolume;
  top50Data: { address: string; total_points: number }[];
  invitationCode: string;
  loginState: { isConnected: boolean; isLoggedIn: boolean };
}

function ChefPointsTab({
  userPoints,
  userTasks,
  walletVolume,
  top50Data,
  invitationCode,
  loginState,
}: ChefPointsTabProps) {
  return (
    <div className="flex w-full max-sm:flex-col">
      <ChefLeftPanel
        userPoints={userPoints}
        loginState={loginState}
      />
      <ChefRightPanel
        top50Data={top50Data}
        loginState={loginState}
      />
    </div>
  );
}

interface ChefLeftPanelProps {
  userPoints: MockUserPoints;
  loginState: { isConnected: boolean; isLoggedIn: boolean };
}

function ChefLeftPanel({ userPoints, loginState }: ChefLeftPanelProps) {

  return (
    <div className="w-[449px] max-sm:w-full max-sm:p-0 flex-shrink-0 pt-0 p-[40px] md:h-[100vh] mt-4 flex flex-col items-center flex-start md:border-r-[2px] md:border-solid md:border-[rgba(48,33,46,1)] pl-0">
      <div className="relative overflow-visible w-full">
        <div className="text-center bg-gradient-to-br from-[#2A1F28] to-[#1D131B] rounded-2xl p-8 border border-[#FF8DF7]/30 shadow-2xl">
          <div className="mb-4">
            <p className="text-[16px] font-cofo text-[#9F9B9F] uppercase tracking-wide">Total Chef Points</p>
          </div>
          <div className="mb-6">
            <p className="text-[100px] text-[#FCD845] font-bold leading-none drop-shadow-lg">
              69
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-1 bg-gradient-to-r from-[#FCD845] to-[#FF8DF7] rounded-full"></div>
            <p className="text-[14px] font-cofo text-[#FFFFFF] tracking-wide">
              COOKING CHAMPION
            </p>
            <div className="w-8 h-1 bg-gradient-to-r from-[#FF8DF7] to-[#FCD845] rounded-full"></div>
          </div>
          <div className="bg-[#1A1A1A]/50 rounded-xl p-4 border border-[#FF8DF7]/20">
            <div className="flex justify-between items-center">
              <div className="text-left">
                <p className="text-[12px] text-[#9F9B9F] font-cofo">CHEF RANK</p>
                <p className="text-[18px] text-[#FF8DF7] font-bold">#25</p>
              </div>
              <div className="text-center">
                <p className="text-[12px] text-[#9F9B9F] font-cofo">MULTIPLIER</p>
                <p className="text-[18px] text-[#1AE371] font-bold">2.5X</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[#9F9B9F] font-cofo">STATUS</p>
                <p className="text-[18px] text-[#FCD845] font-bold">ACTIVE</p>
              </div>
            </div>
          </div>
        </div>

        {/* Simplified Point Containers - Moved lower to make space */}
        <div className="space-y-4 mt-12">
          {/* Trading Points */}
          <div className="bg-[#1D131B] border-[1px] border-[#FF8DF7]/20 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#9F9B9F]">Trading volume on cooking</span>
              <span className="text-[20px] text-[#FCD845] font-bold">
                {loginState.isLoggedIn ? formatQuantity(userPoints.trade_points) : "-"} pts
              </span>
            </div>
          </div>

          {/* Referral Points */}
          <div className="bg-[#1D131B] border-[1px] border-[#FF8DF7]/20 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#9F9B9F]">Top community member points</span>
              <span className="text-[20px] text-[#FCD845] font-bold">
                {loginState.isLoggedIn ? formatQuantity(userPoints.invite_points) : "-"} pts
              </span>
            </div>
          </div>

          {/* Quest Points */}
          <div className="bg-[#1D131B] border-[1px] border-[#FF8DF7]/20 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#9F9B9F]">Chef quest completion rewards</span>
              <span className="text-[20px] text-[#FCD845] font-bold">
                {loginState.isLoggedIn ? formatQuantity(userPoints.task_points) : "-"} pts
              </span>
            </div>
          </div>
        </div>
        <p className="text-[12px] font-cofo text-[#9F9B9F] mt-6 max-sm:mb-6 max-sm:text-center">
          Chef points will be updated daily at 00:00 (UTC).
        </p>
      </div>
    </div>
  );
}

interface ChefRightPanelProps {
  top50Data: { address: string; total_points: number }[];
  loginState: { isConnected: boolean; isLoggedIn: boolean };
}

function ChefRightPanel({
  top50Data,
  loginState,
}: ChefRightPanelProps) {
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

  return (
    <div className="w-full pl-10 max-sm:p-0">
      <div className="w-full relative flex flex-col items-start justify-start md:pt-5 md:pb-2.5 pl-0 md:pr-10 box-border text-left text-white">
        {/* Expanded Top 50 Leaderboard */}
        <div className="w-full bg-[#1D131B] border-[1px] border-[#FF8DF7]/20 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[24px] font-bold">
              <span className="text-[#FF8DF7]">Chef</span> Leaderboard
            </h2>
            <div className="flex items-center justify-between w-[100px]">
              <div
                className={`w-8 h-8 border-[1px] border-[#FF8DF7]/20 flex items-center justify-center cursor-pointer rounded ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#FF8DF7]/10"
                }`}
                onClick={handlePrevPage}
              >
                <Image
                  src="/images/point/leftAllow.svg"
                  width={12}
                  height={10}
                  alt="Previous page"
                />
              </div>
              <div className="font-cofo text-[16px] min-w-[20px] text-center">{currentPage}</div>
              <div
                className={`w-8 h-8 border-[1px] border-[#FF8DF7]/20 flex items-center justify-center cursor-pointer rounded ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#FF8DF7]/10"
                }`}
                onClick={handleNextPage}
              >
                <Image
                  src="/images/point/rightAllow.svg"
                  width={12}
                  height={10}
                  alt="Next page"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="grid gap-1 p-3 bg-[#2A1F28] rounded-t-lg items-center" style={{gridTemplateColumns: "80px 1fr 180px 120px"}}>
              <p className="font-cofo text-sm text-[#FCD845] font-bold">Rank</p>
              <p className="font-cofo text-sm text-[#FCD845] font-bold">User</p>
              <p className="font-cofo text-sm text-[#FCD845] font-bold text-right" style={{marginRight: "60px"}}>Tier</p>
              <p className="font-cofo text-sm text-[#FCD845] font-bold text-right" style={{marginRight: "24px"}}>Points</p>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => {
                  const rank = indexOfFirstItem + index + 1;
                  const twitterHandles = ["zillxbt", "hajie", "phuchau410", "janek0983", "LFGmn", "gemfinddev_19363"];
                  const twitterHandle = twitterHandles[rank - 1] || `user${rank}`;
                  const tier = rank === 1 ? "Head Chef" : rank <= 3 ? "Cooking Champion" : rank <= 10 ? "Senior Cook" : "Cook";
                  const walletAddress = `${item.address.slice(0, 6)}..`;
                  
                  const handleCopyWallet = () => {
                    navigator.clipboard.writeText(item.address);
                    addToast({
                      title: "Copied!",
                      description: "Wallet address copied to clipboard",
                      color: "success",
                    });
                  };
                  
                  return (
                    <div
                      key={index}
                      className="grid gap-1 p-4 bg-[#1A1A1A] hover:bg-[#2A1F28] transition-colors border-b border-[#332231] items-center"
                      style={{gridTemplateColumns: "80px 1fr 180px 120px"}}
                    >
                      <div>
                        <span className="text-[#FCD845] text-[16px] font-bold">
                          #{rank.toString().padStart(2, "0")}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] text-[#FFFFFF] mb-1">
                          @{twitterHandle}
                        </span>
                        <span 
                          className="text-[12px] text-[#9F9B9F] font-mono cursor-pointer hover:text-[#FCD845] transition-colors"
                          onClick={handleCopyWallet}
                          title="Click to copy full address"
                        >
                          {walletAddress}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[14px] text-[#FFFFFF]">
                          {tier}
                        </span>
                      </div>
                      <div className="text-right flex items-center justify-end gap-1">
                        <span className="text-[18px] text-[#FF8DF7] font-bold">
                          {item.total_points.toLocaleString()}
                        </span>
                        <Image
                          src="/images/campaign/cookcoin.png"
                          alt="Cook Coin"
                          width={16}
                          height={16}
                          className="flex-shrink-0"
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex justify-center text-[16px] font-cofo text-[#9F9B9F] p-8">
                  No chef data available at the moment
                </div>
              )}
            </div>
          </div>

          <p className="text-[12px] font-cofo text-[#9F9B9F] mt-4 text-center">
            Chef points are updated daily at 00:00 (UTC). Rankings refreshed every hour.
          </p>
        </div>
      </div>
    </div>
  );
}