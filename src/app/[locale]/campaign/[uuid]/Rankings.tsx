"use client";

import { useAuth } from "@/context/AuthContext";
import MyRank from "./MyRank";
import Pagination from "./Pagination";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

interface RankingUser {
  rank: number;
  address: string;
  avatar?: string;
  tradingVolume: number;
  reward?: number;
}

interface MyRankData {
  rank: number;
  avatar: string;
  tradingVolume: number;
  reward?: number;
}

interface RankingsProps {
  competitionUuid: string; // 竞赛UUID，用于API请求
  // 排行榜数据
  rankings: RankingUser[];
  // 分页参数
  currentPage: number;
  limit: number;
  total: number;
  // 竞赛状态
  status?: string;
}

export default function Rankings({
  competitionUuid,
  rankings,
  currentPage,
  limit,
  total,
  status,
}: RankingsProps) {
  const { address } = useAuth();

  // 只有在状态为ended时才显示奖励
  const showReward = status === "ended";

  return (
    <div className="lg:w-[986px] mx-auto z-10">
      <div className="flex flex-col gap-1 mx-4 lg-mx-0">
        <TableHeader showReward={showReward} />
        {address ? <MyRank competitionUuid={competitionUuid} /> : null}
      </div>
      <div className="flex flex-col gap-1 mx-4 lg-mx-0 divide-y-1 divide-[#332231]">
        {rankings.map((user) => (
          <TableRow
            key={user.rank}
            rank={user.rank}
            address={user.address}
            avatar={user.avatar}
            tradingVolume={user.tradingVolume}
            reward={user.reward}
            competitionUuid={competitionUuid}
          />
        ))}
      </div>
      <div className="flex justify-center items-center mt-4">
        <Pagination currentPage={currentPage} limit={limit} total={total} />
      </div>
    </div>
  );
}
