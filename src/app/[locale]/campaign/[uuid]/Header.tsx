import Image from "next/image";
import Link from "next/link";
import EventTime from "./EventTime";

interface HeaderProps {
  showTradeButton?: boolean;
  competitionName?: string;
  startTime: string;
  endTime?: string;
  prizePool?: number;
  status?: string;
  startHeader?: string;
  startMobHeader?: string;
  endHeader?: string;
  endMobHeader?: string;
  topRedirectUrl?: string;
}

export default function Header({
  showTradeButton = false,
  competitionName = "TRADING COMPETITION",
  startTime,
  endTime,
  prizePool = 1000000,
  status,
  startHeader,
  startMobHeader,
  endHeader,
  endMobHeader,
  topRedirectUrl = "/",
}: HeaderProps) {
  // 格式化奖池金额
  const formatPrizePool = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const defaultBanner = "/images/campaign/banner.png";
  const bannerSrcPc =
    status === "ended"
      ? endHeader || defaultBanner
      : startHeader || defaultBanner;
  const bannerSrcMob =
    status === "ended"
      ? endMobHeader || endHeader || defaultBanner
      : startMobHeader || startHeader || defaultBanner;

  const bannerClass =
    status === "ended"
      ? endHeader
        ? "hidden"
        : ""
      : startHeader
      ? "hidden"
      : "";
  const shouldLinkToHome = status !== "ended";
  const normalizedName = competitionName
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const isChefId = normalizedName?.includes("chefid");
  return (
    <div className="relative max-w-[1311px] h-[374px] -mb-[110px] -mt-[70px]  lg:-mt-0 mx-auto flex justify-center ">
      {/* ChefID: Downbad-style tinted panel + alternative spiral effect that fully covers */}
      {isChefId && (
        <div className="absolute inset-0 z-0 px-4 lg:px-0">
          <div className="hero-panel absolute inset-0 overflow-hidden rounded-lg" />
        </div>
      )}
      <div className="w-full mx-4 lg:mx-0 mt-10">
        <div className="max-w-[986px] min-w-[480px] max-sm:mt-[50px] max-sm:w-[343px] max-sm:min-w-[343px] max-sm:h-[151px] h-[169px] overflow-hidden mx-auto relative z-10 rounded-[12px] border-[1px] border-[#995494]">
          <div className="absolute top-0 left-0 h-[169px] w-[986px] z-0 max-sm:w-[343px] max-sm:h-[151px] ">
            <Link href={topRedirectUrl} className="max-sm:hidden block">
              <Image src={bannerSrcPc} alt="Banner" width={986} height={169} />
            </Link>

            <Link href={topRedirectUrl} className="max-sm:block hidden">
              <Image src={bannerSrcMob} alt="Banner" width={343} height={151} />
            </Link>
          </div>
          <div
            className={`
            ${bannerClass}
            absolute right-[12px] top-[12px] z-10`}
          >
            <Image
              src={"/images/campaign/t1.png"}
              alt="Trade"
              width={137}
              height={29}
              className="hidden lg:block"
            />
          </div>
          <div
            className={`${bannerClass} absolute left-[180px] lg:left-auto lg:right-[24px] bottom-[12px] lg:bottom-[24px] z-10`}
          >
            <div className="flex items-center">
              <EventTime
                classname="lg:hidden mr-2"
                startTime={startTime}
                endTime={endTime}
                status={status}
              />
              {showTradeButton ? (
                <a href="/">
                  <Image
                    src={"/images/campaign/btn1.png"}
                    alt="Trade"
                    width={120}
                    height={40}
                  />
                </a>
              ) : null}
            </div>
          </div>
          <div
            className={`${bannerClass} absolute top-[10px] lg:top-[16px] left-[180px] lg:left-[208px] z-10`}
          >
            <div className="flex items-center gap-2">
              <span className="font-jersey25Regular text-xl md:text-2xl lg:text-3xl text-shadow">
                {competitionName}
              </span>
              <EventTime
                classname="hidden lg:block"
                startTime={startTime}
                endTime={endTime}
                status={status}
              />
            </div>
            <div className="capitalize font-sans italic text-xs lg:text-sm">
              <span className="font-thin">Leaderboard is based on</span>
              <span> trading volume</span>
            </div>
          </div>
          <div
            className={`${bannerClass} absolute top-[54px] lg:top-[79px] left-[180px] lg:left-[208px] z-10`}
          >
            <div className="flex items-end gap-2">
              <span className="font-jersey25Regular text-6xl text-shadow text-[#FCD845]">
                {formatPrizePool(prizePool)}
              </span>
              <div className="hidden lg:block font-cofo rounded-full text-sm uppercase h-6">
                Total Prize POOL
              </div>
            </div>
          </div>
        </div>
      </div>
      {!isChefId && (
        <div className="absolute top-0 left-0 right-0 bottom-0 z-0 flex justify-center overflow-x-hidden -mt-10">
          <svg
            className="max-w-[1311px] h-[374px]"
            viewBox="0 0 1311 374"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g filter="url(#filter0_f_14_2)">
              <ellipse cx="655.5" cy="187" rx="555.5" ry="87" fill="#112A85" />
            </g>
            <defs>
              <filter
                id="filter0_f_14_2"
                x="0"
                y="0"
                width="1311"
                height="374"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feGaussianBlur
                  stdDeviation="50"
                  result="effect1_foregroundBlur_14_2"
                />
              </filter>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
}
