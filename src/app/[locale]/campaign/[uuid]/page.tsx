import { notFound } from "next/navigation";
import Header from "./Header";
import Rankings from "./Rankings";
import Rule from "./Rule";
import { TradingCompetitionTop50Response } from "./types";

async function getRankings(
  uuid: string,
  page: string,
  pageSize: number = 20
): Promise<TradingCompetitionTop50Response> {
  const resp = await fetch(
    `${process.env.API_BASE_URL}/api/competition/top/${uuid}?page=${page}&page_size=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 30 }, // 排行榜数据缓存30秒
    }
  );
  if (!resp.ok) {
    notFound();
  }
  return await resp.json();
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ uuid: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { uuid } = await params;
  const { page = "1" } = await searchParams;

  // 获取排行榜数据（包含竞赛详情）
  const rankingsData = await getRankings(uuid, String(page), 10);

  const {
    event,
    items,
    total,
    page_size,
    page: currentPage,
  } = rankingsData.data;

  // 转换数据格式以适配组件
  const rankings = items.map((item) => ({
    rank: item.rank,
    address: item.user_address,
    tradingVolume: item.total_volume_usd,
    reward: item.reward_sol,
  }));
  console.log(event, "event");

  return (
    <div
      className="flex-col min-h-screen text-white bg-[rgba(19,5,17,1)] overflow-hidden"
      role="main"
    >
      <Header
        competitionName={event.name}
        startTime={event.start_at}
        endTime={event.end_at}
        prizePool={event.prize_pool_sol}
        status={event.status}
        startHeader={event.header_banner_url}
        startMobHeader={event.mob_header_banner_url}
        endHeader={event.end_header_banner_url}
        endMobHeader={event.mob_end_header_banner_url}
        topRedirectUrl={event.top_redirect_url}
      />
      <Rankings
        competitionUuid={uuid}
        rankings={rankings}
        currentPage={currentPage}
        limit={page_size}
        total={total}
        status={event.status}
      />
      <div className="mx-4 md:mx-0">
        <Rule event={event} />
      </div>
    </div>
  );
}
