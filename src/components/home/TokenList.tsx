"use client";

import {
  fetchTokensList,
  getPinnedToken,
  GetTokensListParams,
  Token,
} from "@/api/token";
import { Link } from "@/i18n/navigation";
import { formatQuantity, formatTimeAgo } from "@/utils";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Checkbox,
  Select,
  SelectItem,
} from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useAsyncList } from "@react-stately/data";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { RefObject, useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiShieldQuarter } from "react-icons/bi";
import { IoSearch } from "react-icons/io5";
import { RiSortAsc, RiSortDesc } from "react-icons/ri";
import hamburger from "../lottie/hamburger.json";
import pot from "../lottie/pot.json";
import ProgressBar from "../ProgressBar";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const TokenList: React.FC = () => {
  const t = useTranslations("TokenList");
  const tCommon = useTranslations("Common");
  const [pinnedToken, setPinnedToken] = useState<Token | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [params, setParams] = useState<GetTokensListParams>({
    keyword: "",
    page: 1,
    pageSize: 20,
    sort: "market_cap",
    sort_direction: "desc",
    graduated: false,
    mock: false,
    insurance: false,
  });
  const [hasMore, setHasMore] = useState(true);
  const list = useAsyncList<Token>({
    async load({ cursor }) {
      const currentPage = cursor
        ? parseInt(
            new URL(cursor, window.location.origin).searchParams.get("page") ||
              "1"
          )
        : 1;

      const queryParams: GetTokensListParams = {
        page: currentPage,
        pageSize: params.pageSize,
        sort: params.sort || "market_cap",
        sort_direction: params.sort_direction || "desc",
        keyword: params.keyword || "",
        graduated: params.graduated,
        mock: params.mock,
        insurance: params.insurance,
      };

      try {
        const response = await fetchTokensList(queryParams);
        if (response.code === 200 && response.data) {
          const items = response.data.items || [];
          const total = response.data.total || 0;
          const maxPage = Math.ceil(total / response.data.request.pageSize);
          const isLastPage =
            currentPage >= maxPage || items.length < params.pageSize;
          setHasMore(!isLastPage);

          const nextQueryParams: Record<string, string> = {
            page: String(currentPage + 1),
            pageSize: String(params.pageSize),
            sort: params.sort || "market_cap",
            sort_direction: params.sort_direction || "desc",
            keyword: params.keyword || "",
            graduated: String(params.graduated),
            mock: String(params.mock),
            insurance: String(params.insurance),
          };
          const nextQueryString = new URLSearchParams(
            nextQueryParams
          ).toString();

          return {
            items,
            cursor: isLastPage ? "" : `/api/token/list?${nextQueryString}`,
          };
        }
        setHasMore(false);
        return { items: [], cursor: "" };
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
        setHasMore(false);
        return { items: [], cursor: "" };
      }
    },
  });

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: hasMore && !list.isLoading,
    onLoadMore: list.loadMore,
  }) as [RefObject<HTMLDivElement>, RefObject<HTMLDivElement>];

  const fetchPinnedToken = async () => {
    try {
      const response = await getPinnedToken();
      if (response.code === 200 && response.data) {
        setPinnedToken(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch pinned token:", error);
    }
  };

  useEffect(() => {
    fetchPinnedToken();
  }, []);

  useEffect(() => {
    setHasMore(true);
    list.reload();
  }, [
    params.keyword,
    params.graduated,
    params.insurance,
    params.sort,
    params.sort_direction,
  ]);

  const handleSearch = (value: string) => {
    setParams((prev) => ({
      ...prev,
      keyword: value,
      page: 1,
    }));
  };

  const handleGraduatedChange = (isSelected: boolean) => {
    setParams((prev) => ({
      ...prev,
      graduated: isSelected,
      page: 1,
    }));
  };

  const handleHasInsuranceChange = (isSelected: boolean) => {
    setParams((prev) => ({
      ...prev,
      insurance: isSelected,
      page: 1,
    }));
  };

  const handleSortChange = (value: string) => {
    setParams((prev) => ({
      ...prev,
      sort: value,
      page: 1,
    }));
  };

  const handleSortDirectionChange = (value: "asc" | "desc") => {
    setSortDirection(value);
    setParams((prev) => ({
      ...prev,
      sort_direction: value,
      page: 1,
    }));
  };

  const safeFormat = (value: any, formatter?: (val: any) => string) => {
    if (value === undefined || value === null || value === "") return "-";
    return formatter ? formatter(value) : value;
  };

  const formatChange24h = (change: number | undefined) => {
    if (change === undefined || change === null) return "-";
    return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
  };

  const shakeAnimation = {
    x: [-5, 5, -5, 5, -5, 5, -5, 5, -5, 5, -5, 5, 0],
    transition: {
      x: { duration: 1 },
    },
  };

  const exitAnimation = {
    x: 0,
    transition: { duration: 0.3 },
  };

  const MotionCard = motion(Card);
  // TODO:暂时取消置顶代币
  // const displayTokens = pinnedToken
  //   ? [
  //       pinnedToken,
  //       ...list.items.filter((token) => token.address !== pinnedToken.address),
  //     ]
  //   : list.items;

  const displayTokens = list.items;

  return (
    <div className="w-full mx-auto mb-6 px-3 sm:px-10">
      <div className="w-full mt-4 mb-4">
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="w-full sm:w-[438px] h-9 flex border border-[#2c2c3a] bg-[#332231] rounded-lg p-2.5 items-center">
            <IoSearch className="text-gray-400 w-4 h-4 sm:w-4 sm:h-4" />
            <input
              value={params.keyword}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-[#332231] outline-none ml-2 text-sm sm:text-base"
              type="text"
            />
          </div>
          <div className="flex flex-wrap flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center w-full sm:w-auto">
            <div className="flex max-sm:justify-between gap-2 max-sm:mt-[2px] max-sm:p-2 sm:gap-5">
              <Checkbox
                defaultSelected={params.graduated}
                color="default"
                className="bg-[#332231] w-auto h-8 sm:h-9 rounded-lg uppercase text-xs sm:text-sm"
                onValueChange={handleGraduatedChange}
              >
                {t("graduated")}
              </Checkbox>
              {/* 暂时隐藏复选框 */}
              {/* <Checkbox
                defaultSelected={params.insurance}
                color="default"
                className="bg-[#332231] w-auto h-8 sm:h-9 rounded-lg uppercase text-xs sm:text-sm"
                onValueChange={handleHasInsuranceChange}
              >
                Conviction Pool
              </Checkbox> */}
            </div>
            <Select
              defaultSelectedKeys={["market_cap"]}
              classNames={{
                mainWrapper: "h-8 sm:h-9",
                base: "h-8 sm:h-9",
                trigger:
                  "h-8 sm:h-9 bg-[#332231] min-h-8 sm:min-h-9 rounded-lg uppercase text-xs sm:text-base",
                listboxWrapper: "bg-[#332231] rounded-lg",
                popoverContent: "bg-[#332231] border-[#2c2c3a]",
              }}
              itemHeight={34}
              fullWidth={false}
              maxListboxHeight={34 * 9 + 20}
              className="w-full sm:w-[114px] text-xs max-sm:mt-1 sm:text-base"
              onChange={(e) => handleSortChange(e.target.value)}
              aria-label={t("accessibility.sortSelect")}
              disallowEmptySelection={true} // !! 让用户无法选择空
            >
              <SelectItem
                key="market_cap"
                textValue="Market Cap"
                className="text-white uppercase text-xs sm:text-sm"
              >
                {t("sortOptions.marketCap")}
              </SelectItem>
              <SelectItem
                key="price_in_usd"
                textValue="Token Price"
                className="text-white uppercase text-xs sm:text-sm"
              >
                {t("sortOptions.tokenPrice")}
              </SelectItem>
              <SelectItem
                key="h24_chg"
                textValue="24h chg"
                className="text-white uppercase text-xs sm:text-sm"
              >
                {t("sortOptions.h24Chg")}
              </SelectItem>
              <SelectItem
                key="h24_vol"
                textValue="24h Vol"
                className="text-white uppercase text-xs sm:text-sm"
              >
                {t("sortOptions.h24Vol")}
              </SelectItem>
              <SelectItem
                key="holders"
                textValue="Holders"
                className="text-white uppercase text-xs sm:text-sm"
              >
                {t("sortOptions.holders")}
              </SelectItem>
              <SelectItem
                key="replies"
                textValue="Replies"
                className="text-white uppercase text-xs sm:text-sm"
              >
                {t("sortOptions.replies")}
              </SelectItem>
              <SelectItem
                key="status"
                textValue="Token Status"
                className="text-white uppercase text-xs sm:text-sm"
              >
                {t("sortOptions.tokenStatus")}
              </SelectItem>
              {/* 暂时隐藏 */}
              {/* <SelectItem
                key="insurance_status"
                textValue="Insurance Status"
                className="text-white uppercase text-xs sm:text-sm"
              >
                Conviction Pool
              </SelectItem> */}
              <SelectItem
                key="created_at"
                textValue="Created At"
                className="text-white uppercase text-xs sm:text-sm"
              >
                {t("sortOptions.createdAt")}
              </SelectItem>
            </Select>
            <Button
              color="success"
              onClick={() =>
                handleSortDirectionChange(
                  sortDirection === "asc" ? "desc" : "asc"
                )
              }
              className="bg-[#332231] w-auto h-8 sm:h-9 rounded-lg text-white text-xs sm:text-base uppercase"
              endContent={
                sortDirection === "asc" ? <RiSortAsc /> : <RiSortDesc />
              }
            >
              {sortDirection === "asc" ? "Ascending" : "Descending"}
            </Button>
          </div>
        </div>
      </div>
      <>
        {list.isLoading && list.items.length === 0 ? (
          <div className="mt-44 w-full h-56">
            <AiOutlineLoading3Quarters className="mx-auto w-16 sm:w-24 h-16 sm:h-24 animate-spinner-linear-spin text-white/70" />
          </div>
        ) : (
          <div
            ref={scrollerRef}
            className={`${
              displayTokens?.length > 0 ? "grid " : "flex"
            } w-full relative gap-1 grid-cols-[repeat(auto-fit,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(232px,232px))] max-h-[70vh] overflow-visible overflow-y-auto no-scrollbar py-2 px-1`}
          >
            {displayTokens?.length > 0 ? (
              displayTokens.map((token, index) => (
                <Link
                  key={token.address}
                  href={`/detail/${token.address}`}
                  className={`text-white text-base sm:text-xl font-montserrat shadow-text font-bold leading-tight`}
                >
                  {/* TODO:暂时注释置顶代币 */}
                  {/* {index === 0 && pinnedToken && (
                    <Image
                      src={"/images/home/border.png"}
                      alt="border"
                      width={324}
                      height={403}
                      className="absolute w-[324px] h-[380px] -left-[44px] -top-[16px] hidden sm:block z-10"
                    />
                  )} */}
                  <MotionCard
                    className={`bg-[#010101] rounded-lg pb-2s border border-[#30212E]`}
                    whileHover={{
                      boxShadow: "0 0 10px 2px #FF8DF7",
                    }}
                    initial={false}
                    exit={exitAnimation}
                    transition={{
                      boxShadow: { duration: 0.2 },
                    }}
                    aria-label={`Token card for ${token.name ?? "-"}`}
                  >
                    {token.insurance_amt > 0 && (
                      <div className="absolute left-1 items-center sm:left-2 top-1 sm:top-2 flex bg-black/80 z-10 rounded-sm gap-1 p-1 sm:p-[2px]">
                        <BiShieldQuarter className="text-xs sm:text-sm" />
                        <p className="text-xs sm:text-sm uppercase">
                          {formatQuantity(token.insurance_amt)} sol
                        </p>
                      </div>
                    )}
                    <CardBody className="p-0 relative">
                      {token.logo ? (
                        <Image
                          src={token.logo}
                          alt={token.name}
                          width={120}
                          height={120}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-40 sm:h-[215px] object-cover bg-[#1a1a1a] rounded-none"
                        />
                      ) : (
                        <Avatar
                          src={token.logo}
                          className="w-full h-40 sm:h-[215px]"
                          fallback={token.name?.[0] ?? "-"}
                          radius="none"
                          alt={`Avatar for ${token.name ?? "-"}`}
                          size="lg"
                        />
                      )}

                      <div className="p-2 sm:p-2">
                        <div className="flex w-full justify-between max-sm:flex-col">
                          <p className="text-[#FF8DF7] text-lg sm:text-[20px] whitespace-nowrap overflow-hidden max-w-36 text-ellipsis leading-none uppercase">
                            {token.name}
                          </p>
                          <p className="text-xs sm:text-xs text-white/60 font-cofo">
                            {safeFormat(token.created_at, (val) =>
                              formatTimeAgo(val, "en")
                            )}
                          </p>
                        </div>
                        <p className="text-white/60 text-sm font-cofo max-h-5 sm:max-h-7 overflow-hidden text-ellipsis leading-none mt-[2px]">
                          ${token.symbol}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="mt-1 sm:mt-2 text-white/60 text-xs font-cofo">
                            mcap
                          </p>
                          <p className="mt-1 sm:mt-2 text-white/60 text-xs font-cofo">
                            24h vol
                          </p>
                        </div>

                        <div className="flex justify-between">
                          <p className="text-base font-normal">
                            {safeFormat(token.market_cap, (val) =>
                              formatQuantity(val)
                            )}
                          </p>
                          <div className="flex items-center gap-1 text-[#FF8DF7] text-base">
                            {/* <AiOutlineTeam className="size-3 sm:size-4" /> */}

                            <p>
                              $
                              {safeFormat(token.h24_vol, (val) =>
                                formatQuantity(val)
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="mt-1 sm:mt-2">
                          <ProgressBar
                            isGraduated={token.status === "graduated"}
                            color={
                              token.status === "graduated"
                                ? "#fcd845"
                                : "#FF8DF7"
                            }
                            plSize="pl-[20px]"
                            animatedColor={
                              token.status === "graduated"
                                ? "rgba(252, 216, 69, 0.8)"
                                : "rgba(255, 141, 247, 0.8)"
                            }
                            animationNode={
                              token.status === "graduated" ? (
                                <Lottie
                                  animationData={hamburger}
                                  className="h-5 sm:h-[24px] w-[24px] absolute -left-[3px] bottom-0"
                                  loop
                                />
                              ) : (
                                <Lottie
                                  animationData={pot}
                                  className="h-5 sm:h-[24px] w-[24px] absolute -left-[2px] bottom-0"
                                  loop
                                />
                              )
                            }
                            progress={
                              token.status === "graduated"
                                ? 100
                                : token.progress
                            }
                            showLabel={true}
                          />
                        </div>
                      </div>
                    </CardBody>
                  </MotionCard>
                </Link>
              ))
            ) : (
              <div className="col-span-6 w-full  sm:col-span-2 lg:col-span-4 text-center text-gray-400 py-8 text-sm sm:text-base">
                no data
              </div>
            )}
            {hasMore && list.items.length > 0 && !list.isLoading && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-center py-4">
                <div ref={loaderRef}>
                  <AiOutlineLoading3Quarters className="w-8 h-8 animate-spinner-linear-spin text-white/70" />
                </div>
              </div>
            )}
          </div>
        )}
      </>
    </div>
  );
};

export default TokenList;
