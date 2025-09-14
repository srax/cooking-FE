"use client";

import { Token, TokensListResponse, fetchTokensList } from "@/api/token";
import { useMedia768 } from "@/Common";
import CopyButton from "@/components/copy";
import FancyButton from "@/components/FancyButton";
import { useHover } from "@/hooks/useHover";
import {
  compactNumber,
  formatQuantity,
  formatWithUnits,
  shortenAddress,
} from "@/utils";
import {
  Avatar,
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
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { RiShareBoxLine } from "react-icons/ri";

export const dynamic = "force-static";

interface Column {
  name: string;
  uid: string;
}

type TopTableProps = {
  leaderboard: Token[];
};
type svgProps = {
  color: string;
  hoverColor: string;
};
type innerLayerProps = {
  default: string;
  hover: string;
  avatarColor: string;
};
type TopViewNo3Props = {
  no3List: Token[];
  getRankNumberStyle: (rank: number) => {
    svg: svgProps;
    innerLayer: innerLayerProps;
  };
};

export default function Michelin() {
  const t = useTranslations("Michelin");
  const tCommon = useTranslations("Common");
  const [leaderboard, setLeaderboard] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardNo3, setLeaderboardNo3] = useState<Token[]>([]);
  const [sortField, setSortField] = useState<"market_cap" | "h24_vol">(
    "market_cap"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const isMobile = useMedia768();
  useEffect(() => {
    const getTokens = async () => {
      try {
        const params = {
          page: 1,
          pageSize: 20,
          sort: sortField,
          sort_direction: sortDirection,
        };
        const response: TokensListResponse = await fetchTokensList(params);
        if (response.code === 200 && response.data?.items) {
          setLeaderboardNo3(response.data.items.slice(0, 3));
        } else {
          setError(response.message || t("error.fetchTokensFailed"));
        }
      } catch (err) {
        setError(t("error.networkError"));
      } finally {
        setLoading(false);
      }
    };
    getTokens();
  }, [sortField, sortDirection, t]);

  const getRankNumberStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          svg: { color: "rgba(94,57,91,1)", hoverColor: "rgba(255,141,247,1)" },
          innerLayer: {
            default:
              "shadow-[0px_-8px_37.3px_rgba(255,_141,_247,_0.28)_inset] border-[rgba(79,49,76,1)]",
            hover:
              "shadow-[0px_-21px_41.2px_rgba(255,_141,_247,_0.33)_inset,_0px_-3px_0px_#ff8df7_inset] border-[rgba(79,49,76,1)]",
            avatarColor: "#ff8df7",
          },
        };
      case 2:
        return {
          svg: { color: "rgba(87,66,53,1)", hoverColor: "rgba(252,215,74,1)" },
          innerLayer: {
            default:
              "shadow-[0px_-3px_27px_rgba(252,_214,_74,_0.28)_inset] border-[rgba(78,58,52,1)]",
            hover:
              "shadow-[0px_-21px_41.2px_rgba(252,_217,_74,_0.21)_inset,_0px_-3px_0px_#fcd845_inset] border-[rgba(78,58,52,1)]",
            avatarColor: "#fcd845",
          },
        };
      case 3:
        return {
          svg: {
            color: "rgba(68,53,66,1)",
            hoverColor: "rgba(198,198,198,1)",
          },
          innerLayer: {
            default:
              "shadow-[0px_-21px_41.2px_rgba(185,_185,_185,_0.28)_inset] border-[rgba(83,71,82,0.3)]",
            hover:
              "shadow-[0px_-21px_41.2px_rgba(185,_185,_185,_0.23)_inset,_0px_-3px_0px_#c9c9c9_inset] border-[rgba(83,71,82,1)]",
            avatarColor: "#c9c9c9",
          },
        };
      default:
        return {
          svg: { color: "none", hoverColor: "none" },
          innerLayer: { default: "none", hover: "none", avatarColor: "none" },
        };
    }
  };

  return (
    <div
      className="flex sm:mt-10 md:px-10 mt-8 min-h-screen text-white px-2 bg-[rgba(19,5,17,1)] overflow-x-hidden"
      role="main"
      aria-label={t("accessibility.page")}
    >
      <div className="w-full max-w-full mx-auto mb-6">
        {isMobile ? <></> : <MichelinHeader />}
        {loading ? (
          <div className="text-center mt-10">{tCommon("loading")}</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div>
            {isMobile ? <MichelinHeader /> : <></>}
            <TopViewNo3
              no3List={leaderboardNo3}
              getRankNumberStyle={getRankNumberStyle}
            />
            <TopTable />
          </div>
        )}
      </div>
    </div>
  );
}

const MichelinHeader = () => {
  const isMobile = useMedia768();
  return (
    <div className="h-32 relative rounded-[8px] border-[1px] border-solid border-[rgba(255,141,247,0.20)] flex items-center max-w-full">
      <Image
        width={isMobile ? 84 : 116}
        height={isMobile ? 84 : 116}
        alt="bg"
        src="/images/michelin/michelin-header-cup.svg"
        className="flex-shrink-0"
      />
      {isMobile ? (
        <div className="flex flex-col max-w-full">
          <Image
            width={144}
            height={144}
            alt="bg"
            src="/images/michelin/michelin-header-bg-mob.svg"
            className="absolute right-0 top-0 w-32 h-32"
          />
          <h1 className="text-[#ff8df7] text-[26px] font-Jersey25Regular leading-normal uppercase tracking-[-1px] text-left truncate">
            MICHELIN Token Leaderboard
          </h1>
          <p className="font-cofo w-full text-xs uppercase text-white whitespace-pre-wrap text-left leading-[1.6]">
            STAY HUNGRY. STAY BULLISH
          </p>
        </div>
      ) : (
        <div className="max-w-full">
          <h1 className="text-[#ff8df7] text-[40px] font-400 leading-normal uppercase tracking-[-1px] text-left truncate">
            MICHELIN Token Leaderboard
          </h1>
          <p className="font-cofo w-full text-[18px] uppercase text-white whitespace-pre-wrap text-left leading-[1.6]">
            STAY HUNGRY. STAY BULLISH
          </p>
        </div>
      )}
      <div className="absolute top-[0px] right-[3px] flex"></div>
    </div>
  );
};

const TopViewNo3 = ({ no3List, getRankNumberStyle }: TopViewNo3Props) => {
  const [hoverStates, setHoverState] = useHover(no3List.length);
  const isMobile = useMedia768();

  return (
    <div className="flex flex-col items-start gap-[28px] mt-[38px] max-w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-[5rem] gap-[20px] w-full max-w-full">
        {no3List.map((item, index) => {
          const rankStyle = getRankNumberStyle(index + 1);
          return (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => setHoverState(index, true)}
              onMouseLeave={() => setHoverState(index, false)}
            >
              <div className="relative w-full">
                <div className="absolute inset-0 z-20 overflow-visible md:top-[-4px] md:left-[-4px] top-[-4px] left-[-4px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 455 220"
                    className="md:w-[calc(100%+4px)] md:h-[calc(100%+4px)] w-[calc(100%+4px)] h-[calc(100%+4px)] transition-colors duration-300 ease-in-out"
                    fill={
                      hoverStates[index]
                        ? rankStyle.svg.hoverColor
                        : rankStyle.svg.color
                    }
                    preserveAspectRatio="none"
                    style={{ transform: "translate(-1px, -1px)" }}
                  >
                    <path d="M455 2.86673V22.9339H447.955V8.6002H436.214V0H452.652V2.86673H455Z" />
                    <path d="M455 217.133V197.066H447.955V211.4H436.214V220H452.652V217.133H455Z" />
                    <path d="M0.000217438 2.86673V22.9339H7.04494V8.6002H18.7861V0H2.34846V2.86673H0.000217438Z" />
                    <path d="M0.00217056 217.133V197.066H7.04689V211.4H18.7881V220H2.35041V217.133H0.00217056Z" />
                  </svg>
                </div>
                <div
                  className={`relative flex flex-col items-start justify-start p-2 md:p-4 transition-all duration-300 ease-in-out border-[0.5px] border-solids h-56 md:h-64 w-full max-w-full
                      ${
                        hoverStates[index]
                          ? rankStyle.innerLayer.hover
                          : rankStyle.innerLayer.default
                      }`}
                >
                  <div className="flex flex-col items-start w-full h-full justify-around">
                    <div className="flex items-center justify-start z-30 w-full">
                      <Avatar
                        radius="none"
                        src={item.logo}
                        className="border-[2px] border-solid rounded-[8px] h-24 w-24 md:h-36 md:w-36 mr-2 flex-shrink-0"
                        style={{ borderColor: rankStyle.svg.hoverColor }}
                      />
                      <div className="flex flex-col items-start justify-start ml-2 md:ml-4 md:translate-y-[4px] translate-y-[6px] flex-1 min-w-0">
                        <div className="max-w-36 text-[clamp(18px,4vw,24px)] tracking-[-0.01em] [text-shadow:6px_1px_0px_#000] uppercase text-white text-left leading-[24px] break-words">
                          {item.name}
                        </div>
                        <div className="[text-shadow:6px_1px_0px_#000] leading-[14px] text-[12px] font-cofo text-[rgba(255,255,255,0.6)] text-left">
                          ${item.symbol}
                        </div>
                        <div className="flex-1 w-full leading-[16px] text-[12px] md:text-[16px] font-cofo font-thin text-[rgba(255,255,255,0.6)] text-left relative z-20">
                          <span>CA: </span>
                          {isMobile && <br />}
                          <span className="text-[#ff8df7] relative text-[12px] flex items-center gap-1">
                            {shortenAddress(item.address)}
                            <CopyButton
                              content={item.address}
                              className="text-[rgba(133,122,131,0.6)] "
                            />
                            <Link
                              href={`https://solscan.io/account/${item?.address}`}
                              target="_blank"
                              className=" text-[rgba(133,122,131,0.6)] "
                            >
                              <RiShareBoxLine />
                            </Link>
                          </span>
                        </div>
                        <div className="leading-[21px]">
                          <span className="text-[12px] md:text-[16px] font-cofo text-[#a5a1a4] leading-[14px]">
                            MC{" "}
                          </span>
                          {Math.sign(item.h24_chg) === 1 ? (
                            <span className="text-[14px] md:text-[18px] font-Jersey25Regular font-light text-[#4cff49]">
                              +{formatQuantity(item.h24_chg || 0)} %
                            </span>
                          ) : Math.sign(item.h24_chg) === -1 ? (
                            <span className="text-[14px] md:text-[18px] font-Jersey25Regular font-light text-[#ff0f0f]">
                              {formatQuantity(item.h24_chg || 0)} %
                            </span>
                          ) : (
                            <span className="text-[14px] md:text-[18px] font-Jersey25Regular font-light text-[rgba(255,255,255,0.6)]">
                              0
                            </span>
                          )}
                        </div>
                        <div className="[text-shadow:6px_2px_0px_#000] leading-[16px] text-[12px] md:text-[16px]">
                          ${compactNumber(item.market_cap)}
                        </div>
                      </div>
                      <div
                        className="absolute top-0 right-2 md:right-4 tracking-[-0.01em] flex items-baseline [text-shadow:3px_1px_0px_#000] text-[24px] md:text-[32px]"
                        style={{ color: rankStyle.innerLayer.avatarColor }}
                      >
                        <span>No.</span>
                        <span className="text-[40px] md:text-[52px]">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="my-4 w-full">
                      <hr className="border-t-2 border-[rgba(52,43,50,1)] w-full" />
                    </div>
                    <div className="flex w-full justify-between items-center">
                      <div className="flex items-center">
                        <div className="text-[12px] md:text-[16px] font-cofo text-[rgba(255,255,255,0.4)] mr-2">
                          By
                        </div>
                        {item.creator && item.creator.avatar_url ? (
                          <Avatar
                            src={item.creator.avatar_url}
                            className="mr-2 h-8 w-8 md:h-10 md:w-10"
                            style={{ borderColor: rankStyle.svg.hoverColor }}
                          />
                        ) : (
                          <Avatar
                            className="mr-2 h-8 w-8 md:h-10 md:w-10"
                            name={item.address[0]?.toUpperCase()}
                            style={{ borderColor: rankStyle.svg.hoverColor }}
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="text-[12px] md:text-[14px]">
                            @
                            {item.creator
                              ? item.creator.twitter_screen_name
                              : item.address.slice(-4)}
                          </span>
                          <span className="font-cofo text-[10px] md:text-[12px] text-[rgba(255,255,255,0.4)]">
                            {formatWithUnits(item.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="relative z-30">
                        <BuyButton url={item.address} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

type BuyButtonProps = {
  url: string;
};

const BuyButton = ({ url }: BuyButtonProps) => {
  const router = useRouter();
  const clickToBuy = () => {
    router.push(`/en/detail/${url}`);
  };
  return <FancyButton buttonText="BUY" onClick={clickToBuy}></FancyButton>;
};

const TopTable = () => {
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isMobile = useMedia768();
  const tableStyle = {
    base: "max-h-[520px] overflow-x-auto mt-6 w-full",
    wrapper: "overflow-x-auto scrollbar-hide bg-transparent w-full",
    thead:
      "backdrop-blur-none text-[14px] md:text-[16px] font-cofo ![&>tr]:first:!shadow-none shadow-none border-0 bg-transparent",
  };
  const tableColumns: Column[] = isMobile
    ? [
        { name: "TOKEN", uid: "token" },
        { name: "MARKET CAP", uid: "mcap" },
        { name: "CREATED BY", uid: "createdBy" },
      ]
    : [
        { name: "TOKEN", uid: "token" },
        { name: "CREATED BY", uid: "createdBy" },
        { name: "MARKET CAP", uid: "mcap" },
        { name: "CONTRACT ADDRESS", uid: "contractAddress" },
        { name: "", uid: "buy" },
      ];

  const list = useAsyncList<Token>({
    async load({ signal, cursor }) {
      if (cursor) {
        setIsLoading(false);
      }
      const currentPage = cursor
        ? parseInt(
            new URL(cursor, window.location.origin).searchParams.get("page") ||
              "1"
          )
        : 1;
      const queryString = new URLSearchParams({
        page: String(currentPage),
        pageSize: "20",
        sort: "market_cap",
        sort_direction: "desc",
        network:
          process.env.NEXT_PUBLIC_IS_DEV === "false" ? "mainnet" : "devnet",
        platform: "meteora",
      }).toString();
      const response = await fetch(cursor || `/api/token/list?${queryString}`, {
        signal,
      });
      const resJson: TokensListResponse = await response.json();
      if (!resJson.data) {
        return { items: [], cursor: "" };
      }
      const items = resJson.data.items;
      const maxPage = Math.ceil(
        resJson.data.total / resJson.data?.request?.pageSize
      );
      setHasMore(false);
      const nextQueryString = new URLSearchParams({
        page: String(currentPage + 1),
        pageSize: "10",
        sort: "market_cap",
        sort_direction: "desc",
        network:
          process.env.NEXT_PUBLIC_IS_DEV === "false" ? "mainnet" : "devnet",
        platform: "meteora",
      }).toString();
      return {
        items: items || [],
        cursor:
          currentPage <= maxPage ? `/api/token/list?${nextQueryString}` : "",
      };
    },
  });

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: list.isLoading === false,
    onLoadMore: list.loadMore,
  });

  const renderCell = useCallback(
    (item: Token, columnKey: React.Key, index: number) => {
      switch (columnKey) {
        case "token":
          return (
            <div className="flex items-center min-w-0">
              <span className="font-cofo text-base mr-2">
                {index < 10 ? "0" + index : index}
              </span>
              <Avatar
                radius="none"
                src={item.logo}
                className="rounded-[4px] w-8 h-8 md:w-10 md:h-10 mr-2 flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] md:text-[16px] text-white truncate">
                  {item.symbol}
                </span>
                <span className="text-[10px] md:text-[12px] font-cofo text-[rgba(255,255,255,0.6)]">
                  ${item.symbol}
                </span>
              </div>
            </div>
          );
        case "createdBy":
          return (
            <div className="flex items-center min-w-0">
              {item.creator && item.creator.avatar_url ? (
                <Avatar
                  src={item.creator.avatar_url}
                  className="w-8 h-8 md:w-10 md:h-10 mr-2 flex-shrink-0"
                  size="md"
                />
              ) : (
                <Avatar
                  className="w-8 h-8 md:w-10 md:h-10 mr-2 flex-shrink-0"
                  name={item.address[0]?.toUpperCase()}
                  size="md"
                />
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] md:text-[16px] text-white truncate">
                  @
                  {item.creator && item.creator.twitter_screen_name
                    ? item.creator.twitter_screen_name
                    : item.address.slice(-4)}
                </span>
                <span className="text-[10px] md:text-[12px] font-cofo text-[rgba(255,255,255,0.6)]">
                  {formatWithUnits(item.created_at)}
                </span>
              </div>
            </div>
          );
        case "mcap":
          return (
            <div className="flex flex-col min-w-[80px] md:min-w-[110px] items-start">
              <span className="text-[14px] md:text-[18px] mr-2">
                ${compactNumber(item.market_cap)}
              </span>
              {Math.sign(item.h24_chg) === 1 ? (
                <span className="text-[14px] md:text-[18px] font-Jersey25Regular font-light text-[#4cff49]">
                  +{formatQuantity(item?.h24_chg || 0)}%
                </span>
              ) : Math.sign(item.h24_chg) === -1 ? (
                <span className="text-[14px] md:text-[18px] font-Jersey25Regular font-light text-[#ff0f0f]">
                  {formatQuantity(item?.h24_chg || 0)}%
                </span>
              ) : (
                <span className="text-[14px] md:text-[18px] font-Jersey25Regular font-light text-[rgba(255,255,255,0.6)]">
                  0
                </span>
              )}
            </div>
          );
        case "contractAddress":
          return (
            <div className="flex items-center min-w-0 gap-1">
              <span className="text-[12px] md:text-[16px] font-cofo text-[rgba(255,255,255,0.6)] truncate">
                {shortenAddress(item.address)}
              </span>
              <CopyButton
                content={item.address}
                className="text-[rgba(133,122,131,0.6)]"
              />
              <Link
                href={`https://solscan.io/account/${item?.address}`}
                target="_blank"
                className="text-[rgba(133,122,131,0.6)]"
              >
                <RiShareBoxLine />
              </Link>
            </div>
          );
        default:
          return <BuyButton url={item.address} />;
      }
    },
    []
  );
  return (
    <div className="overflow-x-hidden">
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
          {(column: Column) => (
            <TableColumn
              style={{ background: "transparent" }}
              key={column.uid}
              className="text-left"
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody loadingContent={<Spinner />} isLoading={isLoading}>
          {list.items.map((item: Token, index: number) =>
            // 跳过前三条数据
            index < 3 ? (
              <></>
            ) : (
              <TableRow key={item.address}>
                {(columnKey) => (
                  <TableCell className="py-2">
                    {renderCell(item, columnKey, index + 1)}
                  </TableCell>
                )}
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
};
