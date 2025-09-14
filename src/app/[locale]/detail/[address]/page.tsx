"use client";

import {
  getTokenDetail,
  TokenDetailByRaydiumResponse,
  TokenDetailResponse,
  Transaction,
} from "@/api/token";
import Chart from "@/components/chart";
import CopyButton from "@/components/copy";
import Holder from "@/components/Holder";
import InsurancePool from "@/components/Insurance";
import hamburger from "@/components/lottie/hamburger.json";
import pot from "@/components/lottie/pot.json";
import ProgressBar from "@/components/ProgressBar";
import Thread from "@/components/Thread";
import TradePanel from "@/components/TradePanel";
import Transactions from "@/components/Transactions";
import { formatQuantity, formatTimeAgo, shortenAddress } from "@/utils";
import { Avatar, Snippet, Tab, Tabs } from "@heroui/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { RiShareBoxLine, RiTelegram2Fill } from "react-icons/ri";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

function DetailPageContent() {
  const params = useParams();
  const address = (params.address as string) || "";
  const [selectedTab, setSelectedTab] = useState("1m");
  const [activeTab, setActiveTab] = useState<"thread" | "transactions">(
    "transactions"
  );
  const [solBalance, setSolBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenSymbol, setTokenSymbol] = useState("TOKEN");
  const [tokenData, setTokenData] = useState<
    TokenDetailResponse["data"] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [raydiumDetail, setRaydiumDetail] =
    useState<TokenDetailByRaydiumResponse>();

  const [wsTransactions, setWsTransactions] = useState<Transaction[]>([]);

  // 稳定 chartOptions 和 tokenAddress
  const chartOptions = useMemo(
    () => ({
      theme: "dark",
      locale: "en",
      fullscreen: false,
      autosize: true,
    }),
    []
  );

  const tokenAddress = useMemo(
    () => tokenData?.address || address,
    [tokenData?.address, address]
  );

  useEffect(() => {
    async function fetchTokenDetail() {
      try {
        setLoading(true);
        setError(null);
        const response = await getTokenDetail(address);
        if (response.code === 200 && response.data) {
          setTokenData(response.data);
          setTokenSymbol(response.data.symbol || "TOKEN");
        } else {
          setError(
            response.code === 404
              ? "Token not found"
              : "Failed to fetch token details"
          );
        }
      } catch (error) {
        console.error("Failed to fetch token detail:", error);
        setError("Failed to fetch token details");
      } finally {
        setLoading(false);
      }
    }
    fetchTokenDetail();
  }, [address]);

  const copyCAClassNames = {
    base: "bg-[#161016] border-[#30212E] rounded-md",
    pre: "text-xs w-[220px] overflow-x-auto md:w-full",
  };

  return (
    <div className="w-full flex max-sm:flex-col justify-between border-t-1 border-[#30212e] bg-[#130511] px-10 max-sm:p-4">
      <div className="flex-1 border-r-1 border-[#30212e] pr-6 max-sm:pr-0 max-sm:border-none pt-6">
        <div className="flex w-full justify-between items-center max-sm:flex-col max-sm:hidden">
          <div className="flex items-center">
            <Avatar
              src={tokenData?.logo}
              className="w-[66px] h-[66px] flex-shrink-0 rounded-sm"
              fallback={tokenData?.name ? tokenData.name[0] : "A"}
              aria-label="avatar"
            />
            <div className="ml-4">
              <p className="text-[24px] uppercase leading-none">
                {tokenData?.name || "Unknown"}
              </p>
              <p className="font-cofo text-xs text-white/60 leading-none mt-1">
                ${tokenSymbol}
              </p>
            </div>
          </div>
          <div>
            <p className="text-base text-white/60 font-cofo leading-none">
              Market Cap
            </p>
            <p className="text-[28px] text-[#FF8DF7] leading-none mt-1">
              $
              {formatQuantity(
                tokenData?.market_cap && tokenData?.market_cap > 0
                  ? tokenData?.market_cap || 0
                  : raydiumDetail?.data?.rows[0]?.marketCap || 0
              )}
            </p>
          </div>
          <div>
            <p className="text-base text-white/60 font-cofo leading-none">
              Contract Address
            </p>
            <div className="flex items-center gap-2">
              <p className="text-[28px] text-[#FF8DF7] leading-none mt-1">
                {shortenAddress(tokenData?.address || "")}
              </p>
              <CopyButton
                className="mt-1 "
                content={tokenData?.address || ""}
              ></CopyButton>
              <Link
                href={`https://solscan.io/account/${tokenData?.address}`}
                target="_blank"
                className="mt-2"
              >
                <RiShareBoxLine />
              </Link>
            </div>
          </div>
          <div>
            <p className="text-base text-white/60 font-cofo leading-none">By</p>
            <div className="flex items-center gap-2">
              <p className="text-[28px] text-[#FF8DF7] leading-none mt-1">
                {(tokenData?.signer || "").slice(0, 4)}
              </p>
              <Link
                href={`https://solscan.io/account/${tokenData?.signer}`}
                target="_blank"
                className="mt-1"
              >
                <RiShareBoxLine />
              </Link>
            </div>
          </div>
          <div>
            <p className="text-base text-white/60 font-cofo leading-none">
              Created
            </p>
            <p className="text-[28px] text-[#FF8DF7] leading-none mt-1">
              {formatTimeAgo(tokenData?.created_at || "", "en")}
            </p>
          </div>
        </div>
        <div className="flex w-full justify-between max-sm:flex-col sm:hidden">
          <div className="flex items-center">
            <Avatar
              src={tokenData?.logo}
              className="w-[66px] h-[66px] flex-shrink-0 rounded-sm"
              fallback={tokenData?.name ? tokenData.name[0] : "A"}
              aria-label="avatar"
            />
            <div className="ml-4">
              <p className="text-[24px] uppercase leading-none">
                {tokenData?.name || "Unknown"}
              </p>
              <p className="font-cofo text-xs text-white/60 leading-none mt-1">
                ${tokenSymbol}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <p className="text-base text-white/60 font-cofo leading-none">
                Market Cap
              </p>
              <p className="text-[28px] text-[#FF8DF7] leading-none mt-1">
                ${formatQuantity(tokenData?.market_cap || 0)}
              </p>
            </div>
            <div>
              <p className="text-base text-white/60 font-cofo leading-none">
                Contract Address
              </p>
              <div className="flex items-center gap-2">
                <p className="text-[28px] text-[#FF8DF7] leading-none mt-1">
                  {shortenAddress(tokenData?.address || "")}
                </p>

                <CopyButton
                  className="mt-1 "
                  content={tokenData?.address || ""}
                ></CopyButton>
                <Link
                  href={`https://solscan.io/account/${tokenData?.address}`}
                  target="_blank"
                  className="mt-2"
                >
                  <RiShareBoxLine />
                </Link>
              </div>
            </div>
            <div>
              <p className="text-base text-white/60 font-cofo leading-none">
                By
              </p>
              <p className="text-[28px] text-[#FF8DF7] leading-none mt-1">
                {(tokenData?.signer || "").slice(0, 4)}
              </p>
            </div>
            <div>
              <p className="text-base text-white/60 font-cofo leading-none">
                Created
              </p>
              <p className="text-[28px] text-[#FF8DF7] leading-none mt-1">
                {formatTimeAgo(tokenData?.created_at || "", "en")}
              </p>
            </div>
          </div>
        </div>
        <div className="w-full h-[533px] border border-[#30212E] rounded bg-[#161016] mt-6">
          <Chart
            className="h-full w-full"
            options={chartOptions as any}
            tokenAddress={tokenAddress}
          />
        </div>
        <div className="w-full mt-8">
          <div className="w-full flex max-sm:flex-col">
            <Avatar
              src={tokenData?.logo}
              className="w-[184px] h-[184px] flex-shrink-0 rounded-sm max-sm:hidden"
              fallback={tokenData?.name ? tokenData.name[0] : "A"}
              aria-label="avatar"
            />
            <div className="flex-1 ml-4">
              <div className="max-sm:flex max-sm:items-center">
                <Avatar
                  src={tokenData?.logo}
                  className="w-[24px] h-[24px] mr-1 flex-shrink-0 rounded-sm sm:hidden"
                  fallback={tokenData?.name ? tokenData.name[0] : "A"}
                  aria-label="avatar"
                />
                <p className="uppercase text-[28px]">
                  {tokenData?.name || "Unknown"}
                </p>
              </div>
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <p className="text-xs font-cofo text-[#857A83]">
                    Market cap:{" "}
                    <span className="text-[#FF8DF7] font-jersey25Regular">
                      ${formatQuantity(tokenData?.market_cap || "0")}
                    </span>
                  </p>
                  <p className="text-xs font-cofo text-[#857A83]">
                    Reply Count:{" "}
                    <span className="text-white font-jersey25Regular">
                      {formatQuantity(tokenData?.replies || "0")}
                    </span>
                  </p>
                  <p className="text-xs font-cofo text-[#857A83]">
                    Created:{" "}
                    <span className="text-white font-jersey25Regular">
                      {formatTimeAgo(tokenData?.created_at || "0", "en")}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {tokenData?.twitter && (
                    <Link target="_blank" href={tokenData?.twitter}>
                      <div className="w-6 h-6 bg-white/10  flex items-center justify-center rounded-full">
                        <FaXTwitter className="w-3 h-3 text-white/30" />
                      </div>
                    </Link>
                  )}
                  {tokenData?.telegram && (
                    <Link target="_blank" href={tokenData?.telegram}>
                      <div className="w-6 h-6 bg-white/10 round flex items-center  justify-center rounded-full">
                        <RiTelegram2Fill className="w-3 h-3 text-white/30" />
                      </div>
                    </Link>
                  )}
                  {tokenData?.discord && (
                    <Link target="_blank" href={tokenData?.discord}>
                      <div className="w-6 h-6 bg-white/10 flex items-center justify-center  rounded-full">
                        <FaDiscord className="w-3 h-3 text-white/30" />
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p>CA:</p>
                {/* <div className="bg-white/5 text-sm leading-none flex items-center">
                  {tokenData?.address || "N/A"}
                </div> */}
                <Snippet
                  size="sm"
                  className="rgba(255,255,255,0.05) text-sm font-cofo"
                  classNames={copyCAClassNames}
                  tooltipProps={{
                    content: "Copy this address",
                  }}
                  radius="none"
                  symbol=""
                >
                  {tokenData?.address || "N/A"}
                </Snippet>
              </div>
              <p className="text-sm text-[#857A83] font-cofo">
                {tokenData?.description || "No description available"}
              </p>
            </div>
          </div>
          <div className="mt-8">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) =>
                setActiveTab(key as "thread" | "transactions")
              }
              classNames={{
                tabList: "bg-transparent gap-2 sm:gap-4 p-0 rounded-none",
                base: "border-[#30212e] border-b-1 w-full rounded-none p-0",
                tab: "text-lg rounded-none text-gray-400 data-[selected=true]:border-b-2 border-[#FCD845] !data-[selected=true]:bg-transparent",
                cursor:
                  "bg-transparent group-data-[selected=true]:bg-transparent group-data-[selected=true]:shadow-none",
                tabContent: "group-data-[selected=true]:text-[#FCD845] pb-3",
              }}
              aria-label="tabs"
            >
              <Tab
                key="transactions"
                className="uppercase"
                title="Transactions"
              />
              <Tab key="thread" className="uppercase" title="Thread" />
            </Tabs>
            {activeTab === "thread" ? (
              <Thread address={address} />
            ) : (
              <Transactions address={address} />
            )}
          </div>
        </div>
      </div>
      <div className="w-[424px] flex-shrink-0 p-6 pr-0 max-sm:w-full max-sm:p-0">
        <div>
          <div className="flex justify-between mb-2">
            <p className="text-base text-[#857A83]">Bonding Curve Status</p>
            <p className="text-sm">
              {tokenData?.status === "graduated"
                ? 100
                : tokenData?.progress || 0}
              %
            </p>
          </div>
          <ProgressBar
            isGraduated={tokenData?.status === "graduated"}
            plSize="pl-[26px]"
            animationNode={
              tokenData?.status === "graduated" ? (
                <Lottie
                  animationData={hamburger}
                  className="h-5 sm:h-[32px] w-[34px] absolute -left-[5px] bottom-0"
                  loop
                />
              ) : (
                <Lottie
                  animationData={pot}
                  className="h-5 sm:h-[28px] w-[30px] absolute -left-[2px] bottom-0"
                  loop
                />
              )
            }
            animatedColor={
              tokenData?.status === "graduated"
                ? "rgba(252, 216, 69, 0.8)"
                : "rgba(255, 141, 247, 0.8)"
            }
            color={tokenData?.status === "graduated" ? "#fcd845" : "#FF8DF7"}
            progress={
              tokenData?.status === "graduated" ? 100 : tokenData?.progress || 0
            }
          />
          <p className="text-xs font-cofo text-[#857A83] mt-2">
            The token will graduate and migrate to{" "}
            <span className="text-white">Meteora DAMMv2</span> when the bonding
            curve reaches <span className="text-white">80</span> SOL.
          </p>
        </div>
        {/* TODO:暂时注释置顶相关代码 */}
        {/* <div className="mt-5">
          <div className="flex justify-between mb-2">
            <p className="text-base text-[#857A83]">Chef's Pick Status</p>
            <p className="text-sm">
              {Number(tokenData?.progress || 0) * 2 > 100
                ? 100
                : Number(tokenData?.progress || 0) * 2 || 0}
              %
            </p>
          </div>
          <ProgressBar
            animationNode={
              <Lottie
                animationData={fire}
                className="h-[50px] w-[27px] absolute -left-0 -bottom-2"
                loop
              />
            }
            color="#fcd845"
            animatedColor="rgba(252, 216, 69, 0.8)"
            progress={Number(tokenData?.progress || 0) * 2 || 0}
          />
          <p className="text-xs font-cofo text-[#857A83] mt-2">
            The token will become Chef's Pick and be pinned in Explore page when
            the bonding curve reaches <span className="text-white">40</span>{" "}
            SOL.
          </p>
        </div> */}
        <TradePanel
          address={address}
          tokenSymbol={tokenSymbol}
          solBalance={solBalance}
          tokenBalance={tokenBalance}
          tokenData={tokenData}
          raydiumData={raydiumDetail}
          setSolBalance={setSolBalance}
          setTokenBalance={setTokenBalance}
          setTokenSymbol={setTokenSymbol}
        />
        {tokenData?.computed_insurance_status && (
          <div className="mt-6 mb-6">
            <InsurancePool tokenData={tokenData} />
          </div>
        )}
        <div className="mt-6">
          <Holder address={address} />
        </div>
      </div>
    </div>
  );
}

export default function DetailPage() {
  return <DetailPageContent />;
}
