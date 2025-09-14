"use client";

import { fetchMyCompetitionStatus } from "@/api/competition";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import TableRow from "./TableRow";

interface MyRankProps {
  competitionUuid: string; // 竞赛UUID，用于API请求
}

export default function MyRank({
  competitionUuid,
}: MyRankProps) {
  const { address: authAddress } = useAuth();
  const [currentData, setCurrentData] = useState({
    rank: 0,
    avatar: "",
    address: authAddress || "",
    tradingVolume: 0,
    reward: undefined as number | undefined,
    claimed: false,
  });

  // 从API获取最新数据
  useEffect(() => {
    if (!competitionUuid || !authAddress) {
      return;
    }

    const fetchLatestData = async () => {
      try {
        const response = await fetchMyCompetitionStatus(competitionUuid);

        if (response.code === 200 && response.data) {
          setCurrentData((prev) => ({
            ...prev,
            rank: response.data?.rank || 0,
            tradingVolume: response.data?.total_volume_usd || 0,
            reward: response.data?.reward_sol,
            address: authAddress, // 使用当前登录用户地址
            claimed: response.data?.claimed || false,
          }));
        }
      } catch (error) {
        console.error("更新我的排名数据失败:", error);
        // 保持使用默认数据，不显示错误给用户
      }
    };

    // 立即获取一次数据
    fetchLatestData();

    // 每30秒更新一次
    const interval = setInterval(fetchLatestData, 30000);

    return () => clearInterval(interval);
  }, [competitionUuid, authAddress]);

  // 如果用户未登录，不显示组件
  if (!authAddress) {
    return null;
  }

  return (
    <TableRow
      competitionUuid={competitionUuid}
      rank={currentData.rank}
      avatar={currentData.avatar}
      address={currentData.address}
      tradingVolume={currentData.tradingVolume}
      reward={currentData.reward}
      classname="rounded-[8px] border-1 border-[#332231] bg-[#292638]"
      labelChildren={
        <div className="hidden lg:block bg-[#FF8DF780] text-white px-1 text-sm font-jersey25Regular">
          MY RANK
        </div>
      }
      highlight
      claimed={currentData.claimed}
    />
  );
}
