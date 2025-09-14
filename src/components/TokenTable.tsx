"use client";

import {
  fetchUserCreatedTokens,
  fetchUserTokens,
  GetTokensParams,
  GetUserTokensParams,
  Token,
} from "@/api/token";
import { useAuth } from "@/context/AuthContext";
import { Link } from "@/i18n/navigation";
import { formatQuantity, formatTimeAgo, shortenAddress } from "@/utils";
import {
  addToast,
  Avatar,
  Pagination,
  Spinner,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useAsyncList } from "@react-stately/data";
import Bignumber from "bignumber.js";
import { RefObject, useEffect, useState } from "react";
import InsuranceModal from "./InsuranceModal";

interface TokenTableProps {
  onTotalChange?: (total: number) => void;
  address?: string;
}

export default function advers({ onTotalChange, address: propAddress }: TokenTableProps) {
  const [createdTokens, setCreatedTokens] = useState<Token[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"owned" | "created">("owned");
  const { address: authAddress } = useAuth();
  const address = propAddress || authAddress;
  const [params, setParams] = useState<GetUserTokensParams>({
    user_address: address || "",
    page: 1,
    pageSize: 10,
    sort: "balance",
    sort_direction: "desc",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(
    undefined
  );
  const [hasMore, setHasMore] = useState(true);

  const ownedTokensList = useAsyncList<Token>({
    async load({ cursor }) {
      if (typeof window === "undefined" || !address) {
        setLoading(false);
        return { items: [], cursor: "" };
      }

      const currentPage = cursor
        ? parseInt(
            new URL(cursor, window.location.origin).searchParams.get("page") ||
              "1"
          )
        : 1;

      const queryParams: GetUserTokensParams = {
        user_address: address,
        page: currentPage,
        pageSize: params.pageSize,
        sort: params.sort || "balance",
        sort_direction: params.sort_direction || "desc",
      };

      console.log("Fetching owned tokens with params:", queryParams);

      try {
        setLoading(true);
        const response = await fetchUserTokens(queryParams);
        if (response.code === 200 && response.data) {
          const items = response.data || [];
          const isLastPage = items.length < params.pageSize;
          setHasMore(!isLastPage);
          setTotal((prev) => prev + items.length);
          onTotalChange?.(ownedTokensList.items.length + items.length);

          const nextQueryParams: Record<string, string> = {
            user_address: address,
            page: String(currentPage + 1),
            pageSize: String(params.pageSize),
            sort: params.sort || "balance",
            sort_direction: params.sort_direction || "desc",
          };
          const nextQueryString = new URLSearchParams(
            nextQueryParams
          ).toString();

          return {
            items,
            cursor: isLastPage
              ? ""
              : `/api/token/user/${address}/positions?${nextQueryString}`,
          };
        }
        setHasMore(false);
        setTotal(ownedTokensList.items.length);
        onTotalChange?.(ownedTokensList.items.length);
        return { items: [], cursor: "" };
      } catch (error) {
        console.error("Failed to fetch owned tokens:", error);
        addToast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "An error occurred",
          color: "danger",
        });
        setTotal(ownedTokensList.items.length);
        onTotalChange?.(ownedTokensList.items.length);
        return { items: [], cursor: "" };
      } finally {
        setLoading(false);
      }
    },
  });

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore: hasMore && !ownedTokensList.isLoading,
    onLoadMore: ownedTokensList.loadMore,
  }) as [RefObject<HTMLDivElement>, RefObject<HTMLDivElement>];

  const getCreatedTokens = async () => {
    if (typeof window === "undefined" || !address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetchUserCreatedTokens(
        address,
        params as GetTokensParams
      );
      if (response.code === 200 && response.data?.items) {
        setCreatedTokens(response.data.items as any);
        setTotal(response.data.total);
        onTotalChange?.(response.data.total);
      } else {
        throw new Error(response.message || "Failed to fetch tokens");
      }
    } catch (error) {
      console.error("Failed to fetch created tokens:", error);
      addToast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        color: "danger",
      });
      setCreatedTokens([]);
      setTotal(0);
      onTotalChange?.(0);
    } finally {
      setLoading(false);
    }
  };

  const handleInsuranceClick = (token: Token) => {
    setSelectedToken(token);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedToken(undefined);
  };

  useEffect(() => {
    if (activeTab === "owned") {
      setHasMore(true);
      ownedTokensList.reload();
    } else {
      getCreatedTokens();
    }
  }, [activeTab, address]);

  useEffect(() => {
    getCreatedTokens();
  }, [params]);

  const getInsuranceColor = (status: string) => {
    if (status === "reserved") {
      return "text-[#FCD845]";
    } else if (status === "deployed") {
      return "text-[#FA2256]";
    } else if (status === "expired") {
      return "text-[#1AE371]";
    } else if (status === "retired") {
      return "text-white/40";
    } else {
      return "text-white/40";
    }
  };

  return (
    <div className="w-full bg-transparent mt-4">
      <div className="overflow-hidden py-6 px-5 w-full">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as "owned" | "created")}
          classNames={{
            tabList: "bg-transparent gap-2 sm:gap-4 p-0 rounded-none",
            base: "border-[#30212e] border-b-1 w-full rounded-none p-0",
            tab: "text-lg rounded-none text-gray-400 data-[selected=true]:border-b-2 border-[#FCD845] !data-[selected=true]:bg-transparent",
            cursor:
              "bg-transparent group-data-[selected=true]:bg-transparent group-data-[selected=true]:shadow-none",
            tabContent: "group-data-[selected=true]:text-[#FCD845] pb-3",
          }}
          aria-label="Token Tabs"
        >
          <Tab key="owned" className="uppercase" title="Held" />
          <Tab key="created" className="uppercase" title="Created" />
        </Tabs>

        <div className="mt-5">
          {activeTab === "owned" ? (
            <div
              ref={scrollerRef}
              className="max-h-[70vh] overflow-y-auto no-scrollbar"
            >
              <Table
                removeWrapper
                aria-label="Owned Tokens Table"
                classNames={{
                  th: "p-0 bg-transparent font-cofo text-[#a19ba0] text-sm uppercase",
                  td: "first:pl-0 last:pr-0",
                  tbody: "space-y-2 sm:space-y-3",
                }}
              >
                <TableHeader>
                  <TableColumn>Coins</TableColumn>
                  <TableColumn>Mcap</TableColumn>
                  <TableColumn>creator</TableColumn>
                  <TableColumn>Balance</TableColumn>
                  {/* TODO:暂时注释掉保险状态显示 */}
                  <TableColumn>Conviction</TableColumn>
                </TableHeader>
                <TableBody
                  emptyContent="No Data"
                  loadingContent={<Spinner size="md" />}
                  loadingState={
                    ownedTokensList.isLoading &&
                    ownedTokensList.items.length === 0
                      ? "loading"
                      : "idle"
                  }
                >
                  {Array.from(
                    new Map(
                      ownedTokensList.items.map((token) => [
                        token.address,
                        token,
                      ])
                    ).values()
                  ).map((token) => (
                    <TableRow
                      key={token.address}
                      className="border-b-1 border-[#332231]"
                      aria-label="table"
                    >
                      <TableCell>
                        <Link
                          href={`/detail/${token.address}`}
                          className="flex items-center"
                        >
                          <Avatar
                            src={token.logo}
                            className="w-[34px] h-[34px] rounded flex-shrink-0 mr-[6px]"
                            fallback={token.symbol ? token.symbol[0] : "A"}
                            aria-label="avatar"
                          />
                          <div className="min-w-0">
                            <p className="text-white text-xs mb-1 uppercase leading-none">
                              {token.name}
                            </p>
                            <p className="text-white/40 text-xs uppercase leading-none font-cofo">
                              ${token.symbol}
                            </p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            ${formatQuantity(token.market_cap || 0)}
                          </p>
                          <p
                            className={`${
                              token?.h24_chg >= 0
                                ? "text-[#1AE3AE]"
                                : "text-[#FA2256]"
                            } font-cofo text-xs`}
                          >
                            {token?.h24_chg >= 0 ? "+" : "-"}
                            {formatQuantity(token.h24_chg || 0)}%
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {token?.creator ? (
                          <div className="flex">
                            <Avatar
                              src={token?.creator.avatar_url}
                              className="w-[34px] h-[34px] rounded flex-shrink-0 mr-[6px]"
                              fallback={token.symbol ? token.symbol[0] : "A"}
                              aria-label="avatar"
                            />
                            <div>
                              <p>{shortenAddress(token.creator.nick_name)}</p>
                              <p>
                                {formatTimeAgo(token.creator.created_at, "en")}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex">
                            <Avatar
                              src={token?.creator?.avatar_url}
                              className="w-[34px] h-[34px] rounded flex-shrink-0 mr-[6px]"
                              fallback={token?.signer || "A"}
                              aria-label="avatar"
                            />
                            <div>
                              <p>{shortenAddress(token?.signer || "")}</p>
                              <p>{formatTimeAgo(token.created_at, "en")}</p>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {formatQuantity(token.balance)}
                          </p>
                          <p className="font-cofo text-xs text-white/40">
                            $
                            {formatQuantity(
                              new Bignumber(token.balance)
                                .times(token.price_in_usd)
                                .toString()
                            )}
                          </p>
                        </div>
                      </TableCell>
                      {/* TODO:暂时注释掉保险状态显示 */}
                      <TableCell>
                        <p
                          className={`text-xs sm:text-sm ${getInsuranceColor(
                            token.computed_insurance_status
                          )} underline cursor-pointer`}
                          onClick={() => handleInsuranceClick(token)}
                        >
                          {token.computed_insurance_status || "--"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {hasMore &&
                ownedTokensList.items.length > 0 &&
                !ownedTokensList.isLoading && (
                  <div className="flex justify-center py-4">
                    <div ref={loaderRef}>
                      <Spinner size="md" />
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <Table
              removeWrapper
              aria-label="Created Tokens Table"
              classNames={{
                th: "p-0 bg-transparent font-cofo text-[#a19ba0] text-sm uppercase",
                td: "first:pl-0 last:pr-0",
                tbody: "space-y-2 sm:space-y-3",
              }}
              bottomContent={
                total > params.pageSize && (
                  <div className="flex w-full justify-center mt-4 sm:mt-6">
                    <Pagination
                      total={Math.ceil(total / params.pageSize)}
                      initialPage={1}
                      page={params.page}
                      onChange={(page) => setParams({ ...params, page })}
                      classNames={{
                        wrapper: "gap-0 overflow-visible h-8",
                        item: "w-8 h-8 text-xs sm:text-sm bg-[#241822] text-gray-400 border-0",
                        cursor: "bg-[#ffd84c] text-black shadow-none",
                      }}
                      aria-label="Pagination"
                    />
                  </div>
                )
              }
            >
              <TableHeader>
                <TableColumn>Coins</TableColumn>
                <TableColumn>Mcap</TableColumn>
                <TableColumn>Create At</TableColumn>
                <TableColumn>Balance</TableColumn>
                {/* TODO:暂时注释掉保险状态显示 */}
                <TableColumn>Conviction</TableColumn>
              </TableHeader>
              <TableBody
                emptyContent="No Data"
                loadingContent={<Spinner size="md" />}
                loadingState={loading ? "loading" : "idle"}
              >
                {createdTokens.map((token) => (
                  <TableRow
                    key={token.address}
                    className="border-b-1 border-[#332231]"
                    aria-label="table"
                  >
                    <TableCell>
                      <Link
                        href={`/detail/${token.address}`}
                        className="flex items-center"
                      >
                        <Avatar
                          src={token.logo}
                          className="w-[34px] h-[34px] rounded flex-shrink-0 mr-[6px]"
                          fallback={token.symbol ? token.symbol[0] : "A"}
                          aria-label="avatar"
                        />
                        <div className="min-w-0">
                          <p className="text-white text-xs mb-1 uppercase leading-none">
                            {token.name}
                          </p>
                          <p className="text-white/40 text-xs uppercase leading-none font-cofo">
                            ${token.symbol}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          ${formatQuantity(token.market_cap || 0)}
                        </p>
                        <p
                          className={`${
                            token?.h24_chg >= 0
                              ? "text-[#1AE3AE]"
                              : "text-[#FA2256]"
                          } font-cofo text-xs`}
                        >
                          {token?.h24_chg >= 0 ? "+" : "-"}
                          {formatQuantity(token.h24_chg || 0)}%
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-white text-xs sm:text-sm">
                        {formatTimeAgo(token.created_at, "en")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {formatQuantity(token.balance || 0)}
                        </p>
                        <p className="font-cofo text-xs text-white/40">
                          $
                          {formatQuantity(
                            new Bignumber(token.balance)
                              .times(token.price_in_usd)
                              .toString()
                          )}
                        </p>
                      </div>
                    </TableCell>
                    {/* TODO:暂时注释掉保险状态显示 */}
                    <TableCell>
                      <p
                        className={`text-xs sm:text-sm ${getInsuranceColor(
                          token.computed_insurance_status
                        )} underline cursor-pointer`}
                        onClick={() => handleInsuranceClick(token)}
                      >
                        {token.computed_insurance_status || "--"}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      <InsuranceModal
        tokenData={selectedToken}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
