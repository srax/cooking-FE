"use client";
import {
  checkTwitterFollower,
  fetchLatestTweets,
  fetchRelatedTweets,
} from "@/api/point";
import { unclaimedResponse } from "@/api/reward";
import CreateTokenModal from "@/components/CreateTokenModal";
import FancyButton from "@/components/FancyButton";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/context/AuthContext";
import { formatQuantity } from "@/utils";
import { addToast, Snippet } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaXTwitter } from "react-icons/fa6";
import { tokenCreatedAndGraduatedProps } from "../page";

interface PointProps {
  rewardResponse?: unclaimedResponse | null;
  walletVolume?: {
    volume_in_sol: number;
    volume_in_usd: number;
  };
  walletScore?: number;
  TCAG?: tokenCreatedAndGraduatedProps;
  loginState?: {
    isConnected: boolean;
    isLoggedIn: boolean;
  };
  invitationCode?: string;
  userTasks?: {
    count: { like: number; reply: number; retweet: number; post: number };
    is_flowing: boolean;
  };
  userPoints?: {
    expansion_factor: number;
    invite_points: number;
    michelin_points: number;
    rank: number;
    task_points: number;
    total_points: number;
    trade_points: number;
  };
}

interface defaultRewardData {
  lv1_claimed_reward: number;
  lv1_rebate_rate: number;
  lv1_refer_count: number;
  lv2_claimed_reward: number;
  lv2_rebate_rate: number;
  lv2_refer_count: number;
  total_unclaim_reward: number;
}

const gridBoxStyle =
  "w-full flex relative rounded bg-[#1d131b] border-violet border-solid border-[1px] box-border overflow-hidden flex flex-col items-start justify-start md:p-6 p-5 gap-5 text-left text-2xl";

export const PointView = ({
  rewardResponse,
  walletVolume,
  walletScore,
  TCAG,
  loginState,
  invitationCode,
  userTasks,
  userPoints,
}: PointProps) => {
  const [rewardData, setRewardData] = useState<defaultRewardData>();
  const [isCreateTokenModal, setIsCreateTokenModal] = useState<boolean>(false);
  const { userInfo, isLoggedIn, signAndLogin } = useAuth();
  const [userToken, setUserToken] = useState<string>("");
  const [redirectUri, setRedirectUri] = useState<string>("");
  const [latestTweets, setLatestTweets] = useState<string[]>([]);
  const [relatedTweets, setRelatedTweets] = useState<string[]>([]);

  useEffect(() => {
    if (rewardResponse?.code === 200) {
      setRewardData(rewardResponse.data);
    }
  }, [rewardResponse]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const redirectUri = process.env.NEXT_PUBLIC_BASE_URL;
    if (token) {
      setUserToken(token);
    }
    if (redirectUri) {
      setRedirectUri(redirectUri);
    }
  }, [isLoggedIn]);

  // 新增：获取最新推文
  useEffect(() => {
    const loadLatestTweets = async () => {
      try {
        const tweetsResponse = await fetchLatestTweets();
        if (tweetsResponse && tweetsResponse.data) {
          const tweetUrls = tweetsResponse.data.map((tweet) => tweet.tweet_url);
          setLatestTweets(tweetUrls);
        }
      } catch (error) {
        console.error("Failed to load latest tweets:", error);
        // 如果接口失败，保留原来的备用链接
        setLatestTweets([
          "https://x.com/cookingcityHQ/status/1940765436209254552",
          "https://x.com/cookingcityHQ/status/1940765438780363246",
          "https://x.com/cookingcityHQ/status/1940765441405702577",
          "https://x.com/cookingcityHQ/status/1940765444077769146",
          "https://x.com/cookingcityHQ/status/1940765446153949447",
          "https://x.com/cookingcityHQ/status/1940765448116818395",
          "https://x.com/cookingcityHQ/status/1940765450046263445",
          "https://x.com/cookingcityHQ/status/1940765452147610041",
          "https://x.com/cookingcityHQ/status/1940765455465259332",
          "https://x.com/cookingcityHQ/status/1942136663037374532",
        ]);
      }
    };

    loadLatestTweets();
  }, []);

  // 新增：获取相关推文链接
  useEffect(() => {
    const loadRelatedTweets = async () => {
      try {
        const relatedResponse = await fetchRelatedTweets();
        if (relatedResponse && relatedResponse.data) {
          setRelatedTweets(relatedResponse.data);
        }
      } catch (error) {
        console.error("Failed to load related tweets:", error);
        // 如果接口失败，保留原来的备用链接
        setRelatedTweets([
          "https://x.com/MeteoriteCol/status/1940900142158385257",
          "https://x.com/Shanks_A9z/status/1941132046765891934",
          "https://x.com/cometcalls/status/1940766995789803760",
          "https://x.com/robinhood_degen/status/1940766797185302774",
          "https://x.com/btc_798/status/1940786297653940580",
          "https://x.com/absnn355/status/1941106947392221524",
        ]);
      }
    };

    loadRelatedTweets();
  }, []);

  const handelClick = () => {
    setIsCreateTokenModal(false);
  };
  const handleCheckTwitterFollower = async () => {
    try {
      const isFollowing = await checkTwitterFollower();
      if (isFollowing) {
        addToast({
          title: "Success",
          description: "Twitter follower check successful",
          color: "success",
        });
      } else {
        addToast({
          title: "Failed",
          description: "Failed to check Twitter follower status",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error checking Twitter follower:", error);
      addToast({
        title: "Failed",
        description: "Failed to check Twitter follower status",
        color: "danger",
      });
    }
  };
  const getRandomLink = (links: string[]) => {
    const filtered = links.filter((l) => !!l); // 移除空链接
    if (filtered.length === 0) {
      // 如果没有有效链接，返回默认的官方推特主页
      return "https://x.com/cookingcityHQ";
    }
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  const questItems = [
    {
      startTitle: "Follow X",
      tweetCount: 1,
      endTitle: "",
      startDescription: "",
      endDescription: "",
      middleTitle: "@cookingcityHQ",
      isShowDescription: false,
      isDisable: false,
      buttonTitle: "GO",
      isComplete: userTasks?.is_flowing || false,
      completeText: "FOLLOWED",
      onclick: () => {
        handleCheckTwitterFollower();
      },
      link: !userInfo?.profile?.twitter_screen_name
        ? `${
            process.env.API_BASE_URL
          }/twitter/bind?redirect_uri=${encodeURIComponent(
            redirectUri
          )}&token=${encodeURIComponent(userToken)}`
        : "https://x.com/cookingcityHQ",
    },
    {
      startTitle: "Post and tag",
      tweetCount: userTasks?.count?.post || 0,
      endTitle: "tweets",
      startDescription: "Congrats! All together you posted and tag",
      endDescription: "tweets",
      middleTitle: "@cookingcityHQ",
      isShowDescription: true,
      isDisable: false,
      buttonTitle: "GO",
      isComplete: false,
      onclick: null,
      completeText: "",
      link: !userInfo?.profile?.twitter_screen_name
        ? `${
            process.env.API_BASE_URL
          }/twitter/bind?redirect_uri=${encodeURIComponent(
            redirectUri
          )}&token=${encodeURIComponent(userToken)}`
        : (() => {
            const tweets = [
              `Yo, just cooking up some vibe on @cookingcityHQ! 🚀\nTrade, refer, and stack those Cooking Points like a degen chef.\nAirdrop szn incoming? 👀 Join the kitchen at cooking.city !`,
              `When life gives you lemons, trade ‘em for Cooking Points on @cookingcityHQ! 🔥\nBuild your chef-fi empire and get ready for that tasty airdrop.`,
              `Me: vibing in the @cookingcityHQ kitchen\nAlso me: Earning Cooking Points while trading buffet\nCook your way to the airdrop! 🪂`,
              `adds Cooking Points to cart 🛒 @cookingcityHQ got me acting unwise with this kitchen game.\nTrade, refer, earn, and HODL for the airdrop. Who’s cooking with me? 🍳`,
              `Not financial advice, but stacking Cooking Points on @cookingcityHQ feels like printing money 💴\nTrade some ingredients, refer your frens, and let’s eat that airdrop! 🍽️`,
              `POV: You’re a degen chef on @cookingcityHQ, trading ingredients and stacking points for the airdrop.\nCook with me at cooking.city`,
              `.@cookingcityHQ is the ultimate onchain playground.\nTrade, refer, and farm those Cooking Points for the big airdrop. Join the feast! 🍔`,
              `Bullish on @cookingcityHQ 🚀\nThis Web3 kitchen’s serving up Cooking Points like hotcakes. Trade, refer, and get ready for a spicy airdrop. Who’s in? 🧑‍🍳`,
              `Me to my frens: “Get in @cookingcityHQ or we’re not eating!”\n🍽️ Trade ingredients, stack Cooking Points, and prep for the airdrop. GM chefs! ☀️`,
              `When you realize @cookingcityHQ lets you trade, refer, and earn Cooking Points for a potential airdrop…\n🤯 Time to cook up some earn! Join the vibe at cooking.city`,
            ];
            const randomTweet =
              tweets[Math.floor(Math.random() * tweets.length)];
            return `https://x.com/intent/tweet?text=${encodeURIComponent(
              randomTweet
            )}`;
          })(),
    },
    {
      startTitle: "Like",
      tweetCount: userTasks?.count?.like || 0,
      endTitle: "tweets",
      startDescription: "Congrats! All together you liked",
      endDescription: "tweets",
      middleTitle: "@cookingcityHQ",
      isShowDescription: true,
      isDisable: false,
      buttonTitle: "GO",
      isComplete: false,
      onclick: null,
      completeText: "",
      link: !userInfo?.profile?.twitter_screen_name
        ? `${
            process.env.API_BASE_URL
          }/twitter/bind?redirect_uri=${encodeURIComponent(
            redirectUri
          )}&token=${encodeURIComponent(userToken)}`
        : latestTweets.length > 0
        ? getRandomLink(latestTweets)
        : "https://x.com/cookingcityHQ",
    },
    {
      startTitle: "RT",
      tweetCount: userTasks?.count?.retweet || 0,
      endTitle: "tweets",
      startDescription: "Congrats! All together you RT",
      endDescription: "tweets",
      middleTitle: "@cookingcityHQ",
      isShowDescription: true,
      isDisable: false,
      buttonTitle: "GO",
      isComplete: false,
      onclick: null,
      completeText: "",
      link: !userInfo?.profile?.twitter_screen_name
        ? `${
            process.env.API_BASE_URL
          }/twitter/bind?redirect_uri=${encodeURIComponent(
            redirectUri
          )}&token=${encodeURIComponent(userToken)}`
        : latestTweets.length > 0
        ? getRandomLink(latestTweets)
        : "https://x.com/cookingcityHQ",
    },
    {
      startTitle: "Comment",
      tweetCount: userTasks?.count?.reply || 0,
      endTitle: "tweets",
      startDescription: "Congrats! All together you commented",
      endDescription: "tweets",
      middleTitle: "@cookingcityHQ",
      isShowDescription: true,
      isDisable: false,
      buttonTitle: "GO",
      isComplete: false,
      onclick: null,
      completeText: "",
      link: !userInfo?.profile?.twitter_screen_name
        ? `${
            process.env.API_BASE_URL
          }/twitter/bind?redirect_uri=${encodeURIComponent(
            redirectUri
          )}&token=${encodeURIComponent(userToken)}`
        : latestTweets.length > 0
        ? getRandomLink(latestTweets)
        : "https://x.com/cookingcityHQ",
    },
    {
      startTitle: "Engage with",
      tweetCount: 1,
      endTitle: "related posts on X",
      startDescription: "",
      endDescription: "",
      middleTitle: "@cookingcityHQ",
      isShowDescription: false,
      isDisable: false,
      buttonTitle: "GO",
      isComplete: false,
      onclick: null,
      completeText: "",
      link: !userInfo?.profile?.twitter_screen_name
        ? `${
            process.env.API_BASE_URL
          }/twitter/bind?redirect_uri=${encodeURIComponent(
            redirectUri
          )}&token=${encodeURIComponent(userToken)}`
        : relatedTweets.length > 0
        ? getRandomLink(relatedTweets)
        : "https://x.com/cookingcityHQ",
    },
    {
      startTitle: "Coming Soon...",
      tweetCount: 1,
      endTitle: "",
      startDescription: "",
      endDescription: "",
      middleTitle: "",
      isShowDescription: false,
      isDisable: true,
      buttonTitle: "???",
      isComplete: false,
      onclick: null,
      completeText: "",
      link: !userInfo?.profile?.twitter_screen_name
        ? `${
            process.env.API_BASE_URL
          }/twitter/bind?redirect_uri=${encodeURIComponent(
            redirectUri
          )}&token=${encodeURIComponent(userToken)}`
        : "https://x.com/cookingcityHQ",
    },
  ];

  return (
    <div className="w-full pl-10 max-sm:p-0">
      <div className="w-full relative flex flex-col items-start justify-start md:pt-5 md:pb-2.5 pl-0 md:pr-10 box-border gap-3.5 text-left text-4xl text-white">
        <div className="w-full bg-[#1D131B] border-[1px] border-[#FF8DF733] border-solid p-5  max-sm:p-4">
          <div className="flex justify-between max-sm:flex-col">
            <div className="w-full">
              <p className="text-[18px] uppercase max-sm:whitespace-nowrap">
                <span className="text-[#FCD845]">1.</span>Trade token on Cooking
                to earn points
              </p>
              <div className="flex items-center justify-between w-full mt-6 max-sm:flex-col max-sm:items-start max-sm:gap-6">
                <p className="text-xs font-cofo text-[#9F9B9F]">
                  Total Trading Volume:{" "}
                  <span className="font-jersey25Regular text-white ml-1 text-[18px] uppercase">
                    {loginState?.isLoggedIn
                      ? formatQuantity(walletVolume?.volume_in_usd || "0") +
                        " USD"
                      : "-"}
                  </span>
                </p>
                <p className="text-xs font-cofo text-[#9F9B9F]">
                  Michelin token bonus:{" "}
                  <span className="font-jersey25Regular text-white text-[18px] ml-1 uppercase">
                    {userPoints?.michelin_points &&
                    userPoints?.michelin_points > 0
                      ? formatQuantity(userPoints?.michelin_points || "0")
                      : "???"}
                  </span>
                </p>
                {loginState?.isLoggedIn ? (
                  <Link href={"/"} className="max-sm:w-full">
                    <FancyButton
                      className="w-[120px] max-sm:w-full"
                      height={42}
                      buttonText="TRADE"
                    ></FancyButton>
                  </Link>
                ) : (
                  <FancyButton
                    buttonText={"CONNECT"}
                    className="w-[120px] max-sm:w-[80px] "
                    height={42}
                    onClick={signAndLogin}
                  ></FancyButton>
                )}
              </div>
            </div>
            <div className="w-[1px] h-[84px] bg-[#362433] ml-[36px] mr-[36px] max-sm:hidden"></div>
            <div className="w-full h-[1px] bg-[#362433] mt-6 max-sm:block max-sm:mb-6 hidden"></div>

            <div className="flex items-center flex-col mr-[148px] max-sm:mr-0 max-sm:items-start">
              <p className="font-cofo text-[#FFFFFF] text-[16px] whitespace-nowrap max-sm:leading-none">
                Trading Points
              </p>
              <p className="text-4xl text-[#FCD845]">
                {loginState?.isLoggedIn
                  ? formatQuantity(userPoints?.trade_points || "0")
                  : "-"}
              </p>
            </div>
          </div>
        </div>
        <div className="w-full bg-[#1D131B] border-[1px] border-[#FF8DF733] border-solid p-5 max-sm:p-4">
          <div className="flex justify-between max-sm:flex-col">
            <div className="w-full">
              <p className="text-[18px] uppercase">
                <span className="text-[#FCD845]">2.</span>refer frens to earn
                points and Multiplier
              </p>
              <div className="flex flex-col items-center justify-between w-full mt-6">
                <div className="relative w-full h-[68px] max-sm:h-[129px] p-[20px] max-sm:p-4">
                  <Image
                    src="/images/point/socketBg.png"
                    alt="socket bg"
                    width={631}
                    height={78}
                    priority
                    className="w-full left-0 h-[78px] absolute top-0 select-none max-sm:hidden max-sm:h-[129px]"
                  />
                  <Image
                    src="/images/point/socketBgMobile.png"
                    alt="socket bg"
                    width={631}
                    height={78}
                    priority
                    className="hidden w-full 2xl:hidden left-0 h-[78px] absolute top-0 select-none max-sm:block max-sm:h-[129px]"
                  />
                  <p className="font-cofo text-[14px] leading-5 relative max-sm:whitespace-nowrap">
                    Multiplied by Referral User Trading Volume:{" "}
                    <span className="text-[24px] font-jersey25Regular max-sm:hidden">
                      {loginState?.isLoggedIn
                        ? (userPoints?.expansion_factor || "1") + "x"
                        : "-"}
                    </span>
                  </p>
                  <p className="font-cofo text-[14px] text-[#58bbdd] leading-5 relative">
                    (Invite high-volume traders to boost your points multiplier)
                  </p>
                  <p className="text-[24px] font-jersey25Regular hidden max-sm:block mt-3">
                    {loginState?.isLoggedIn
                      ? (userPoints?.expansion_factor || "1") + "x"
                      : "-"}
                  </p>
                </div>
                <div className="w-full h-[1px] bg-[#362433] mt-6 max-sm:hidden"></div>
                <div className="flex justify-between w-full mt-6 max-sm:flex-col">
                  <div>
                    <p className="text-[#9F9B9F] font-cofo text-[14px]">
                      Referral code
                    </p>
                    <Snippet
                      classNames={{
                        pre: "!font-jersey25Regular text-[16px] text-white md:w-sm",
                        base: "bg-[rgba(39,27,36,0.5)] rounded-[2px] border-[1px] border-[#473745] max-sm:w-full",
                      }}
                      symbol=""
                      radius="sm"
                    >
                      {invitationCode
                        ? `${invitationCode}`
                        : "Please connect wallet"}
                    </Snippet>
                  </div>
                  <div className="max-sm:mt-4 ">
                    <p className="text-[#9F9B9F] font-cofo text-[14px]">
                      Referral link
                    </p>
                    <Snippet
                      classNames={{
                        pre: "!font-jersey25Regular text-[16px] text-white md:w-full max-w-[200px] text-ellipsis overflow-hidden",
                        base: "bg-[rgba(39,27,36,0.5)] rounded-[2px] border-[1px] border-[#473745] max-sm:w-full",
                      }}
                      symbol=""
                      radius="sm"
                    >
                      {invitationCode
                        ? `cooking.city/en?invite_code=${invitationCode}`
                        : "Please connect wallet"}
                    </Snippet>
                  </div>

                  {loginState?.isLoggedIn ? (
                    <Link
                      href={
                        "https://x.com/intent/tweet?text=" +
                        encodeURIComponent(
                          `Hey Chef, join the #OnchainRenaissance with @CookingCityHQ now! https://cooking.city?invite_code=${invitationCode}`
                        )
                      }
                      target="_blank"
                      className="mt-11 max-sm:mt-5"
                    >
                      <FancyButton
                        buttonText="REFER ON"
                        height={42}
                        className="w-[120px] max-sm:w-full"
                        endIcon={<FaXTwitter className="text-black" />}
                      ></FancyButton>
                    </Link>
                  ) : (
                    <FancyButton
                      buttonText={"CONNECT"}
                      className="w-[120px] max-sm:w-[80px] mt-11"
                      height={42}
                      onClick={signAndLogin}
                    ></FancyButton>
                  )}
                </div>
              </div>
            </div>
            <div className="w-[1px] h-[280px] bg-[#362433] ml-[36px] mr-[36px] max-sm:hidden"></div>
            <div className="w-full h-[1px] bg-[#362433] mt-6 max-sm:block max-sm:mb-6 hidden"></div>
            <div className="flex items-center flex-col mr-[148px] max-sm:mr-0 max-sm:items-start">
              <p className="font-cofo text-[#FFFFFF] text-[16px] whitespace-nowrap max-sm:leading-none ">
                Referral Points
              </p>
              <p className="text-4xl text-[#FCD845]">
                {loginState?.isLoggedIn
                  ? formatQuantity(userPoints?.invite_points || "0")
                  : "-"}
              </p>
            </div>
          </div>
        </div>
        <div className="w-full bg-[#1D131B] border-[1px] border-[#FF8DF733] border-solid p-5  max-sm:p-4">
          <div className="flex justify-between max-sm:flex-col">
            <div className="w-full relative">
              <p className="text-[18px] uppercase">
                <span className="text-[#FCD845]">3.</span>complete QUEST to earn
                points
              </p>
              {loginState?.isLoggedIn &&
                (walletVolume?.volume_in_sol || 0) < 1 && (
                  <div
                    className="absolute w-full h-[32.5rem] max-sm:h-[34rem] z-30 flex pt-20 items-center flex-col"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at center, #1f151d 10%, transparent 100%)",
                    }}
                  >
                    <Image
                      src="/images/point/lock.svg"
                      alt="socket bg"
                      width={48}
                      height={64}
                      priority
                    />
                    <p className="mt-6 text-sm font-cofo ">
                      Trade at least 1 sol to unlock this section.
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <ProgressBar
                        plSize="pl-[24px]"
                        animationNode={
                          <Image
                            src="/images/point/sol.svg"
                            alt="socket bg"
                            width={24}
                            height={24}
                            priority
                            className="absolute top-0 left-0 z-20"
                          />
                        }
                        color="#fcd845"
                        animatedColor="rgba(252, 216, 69, 0.8)"
                        height={24}
                        width={"173px"}
                        progress={
                          Number(walletVolume?.volume_in_sol || 0) * 100 || 0
                        }
                      />
                      <p className="text-lg">
                        <span className="text-[#FCD845]">
                          {formatQuantity(walletVolume?.volume_in_sol || 0)}
                        </span>{" "}
                        / 1 SOL
                      </p>
                    </div>
                    <Link href={"/"} className="mt-8">
                      <FancyButton
                        buttonText={"TRADE NOW"}
                        className="w-[120px] max-sm:w-[80px]"
                        height={42}
                      ></FancyButton>
                    </Link>
                  </div>
                )}
              {loginState?.isLoggedIn &&
                questItems
                  .slice()
                  .sort((a, b) => {
                    if (a.isComplete === b.isComplete) return 0;
                    return a.isComplete ? 1 : -1;
                  })
                  .map((quest, index) => (
                    <div
                      key={index}
                      className={`py-2 mt-3 px-4 border-[1px] ${
                        quest.isComplete
                          ? "border-[rgba(26,227,113,0.50)]"
                          : "border-[#473745]"
                      } w-full flex justify-between items-center rounded-md`}
                      style={{
                        background: quest.isComplete
                          ? "linear-gradient(180deg, rgba(73, 237, 58, 0.00) 0%, rgba(62, 212, 38, 0.10) 100%)"
                          : "#271B24",
                      }}
                    >
                      <div>
                        <p className="font-cofo text-[14px] leading-none">
                          {quest.startTitle}{" "}
                          {quest.middleTitle && (
                            <span className="text-[#FF8DF7]">
                              {quest.middleTitle}
                            </span>
                          )}{" "}
                          {quest.endTitle}
                        </p>
                        {quest.isShowDescription && (
                          <p className="text-[#9F9B9F] text-[12px] font-cofo leading-none mt-2">
                            {quest.startDescription}{" "}
                            <span className="text-[#FCD845]">
                              {quest.tweetCount}
                            </span>{" "}
                            {quest.endDescription}
                          </p>
                        )}
                      </div>

                      {quest.isComplete ? (
                        <FancyButton
                          buttonText={quest.completeText}
                          className="w-[120px] max-sm:w-[80px] text-white"
                          height={42}
                          bgColor="#452c3f"
                          downColor="#2b1025"
                          textColor="#fff"
                          icon={
                            <Image
                              src="/images/point/completeIcon.svg"
                              alt="socket bg"
                              width={15}
                              height={11}
                              priority
                            />
                          }
                          disabled={quest.isDisable}
                        />
                      ) : isLoggedIn ? (
                        quest.onclick &&
                        userInfo?.profile?.twitter_screen_name ? (
                          <FancyButton
                            buttonText={quest.buttonTitle}
                            className="w-[120px] max-sm:w-[80px]"
                            height={42}
                            disabled={quest.isDisable}
                            onClick={quest.onclick}
                          />
                        ) : (
                          <Link href={quest.link} target="_blank">
                            <FancyButton
                              buttonText={quest.buttonTitle}
                              className="w-[120px] max-sm:w-[80px]"
                              height={42}
                              disabled={quest.isDisable}
                            />
                          </Link>
                        )
                      ) : (
                        <FancyButton
                          buttonText={
                            quest.buttonTitle === "???" ? "???" : "CONNECT"
                          }
                          className="w-[120px] max-sm:w-[80px]"
                          height={42}
                          disabled={quest.isDisable}
                          onClick={signAndLogin}
                        />
                      )}
                    </div>
                  ))}

              {!loginState?.isLoggedIn && (
                <div className="flex items-center gap-8">
                  <p className="font-cofo text-[14px] leading-none">
                    Connect wallet to continue
                  </p>
                  <FancyButton
                    buttonText={"Connect"}
                    className="w-[65px]"
                    height={30}
                    onClick={signAndLogin}
                  ></FancyButton>
                </div>
              )}
            </div>
            {loginState?.isLoggedIn ? (
              <div className="w-[1px] h-[280px] bg-[#362433] ml-[36px] mr-[36px] max-sm:hidden"></div>
            ) : (
              <div className="w-[1px] h-[64px] bg-[#362433] ml-[36px] mr-[36px] max-sm:hidden"></div>
            )}
            {
              <div className="w-full h-[1px] bg-[#362433] mt-6 max-sm:block max-sm:mb-6 hidden"></div>
            }
            {
              <div className="flex items-center flex-col mr-[148px] max-sm:mr-0 max-sm:items-start">
                <p className="font-cofo text-[#FFFFFF] text-[16px] whitespace-nowrap max-sm:leading-none">
                  Quest Points
                </p>
                <p className="text-4xl text-[#FCD845]">
                  {loginState?.isLoggedIn
                    ? formatQuantity(userPoints?.task_points || "0")
                    : "-"}
                </p>
              </div>
            }
          </div>
        </div>
      </div>
      <CreateTokenModal
        isOpen={isCreateTokenModal}
        onOpenChange={handelClick}
      />
    </div>
  );
};
