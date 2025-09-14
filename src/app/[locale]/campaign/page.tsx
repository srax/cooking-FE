import { cn } from "@heroui/react";
import Card from "./Card";

// 竞赛数据类型定义
interface Competition {
  allocation_1st: string;
  allocation_2nd: string;
  allocation_3rd: string;
  allocation_4th: string;
  allocation_5th: string;
  allocation_6th_20th: string;
  allocation_rest_method: string;
  description: string;
  end_at: string;
  external_url: string;
  header_banner_url: string;
  is_self_calculate: boolean;
  min_banner_url: string;
  name: string;
  payout_end_date: string;
  prize_pool_sol: string;
  rich_text_content: string;
  start_at: string;
  status: "coming soon" | "ongoing" | "ended";
  top_redirect_url: string;
  uuid: string;
}

interface CompetitionResponse {
  code: number;
  data: {
    items: Competition[];
    page: number;
    page_size: number;
  };
}

export default async function Page() {
  const resp = await fetch(
    `${process.env.API_BASE_URL}/api/competition/list?page=1&page_size=1000`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  let competitions: Competition[] = [];
  try {
    const data: CompetitionResponse = await resp.json();

    if (data.code === 200 && data.data?.items) {
      competitions = data.data.items;
    }
  } catch (error) {
    console.error("Error parsing competition data:", error);
  }

  return (
    <div
      className="flex-col min-h-screen text-white bg-[rgba(19,5,17,1)] overflow-x-hidden"
      role="main"
    >
      <div className="mx-auto max-w-screen-lg my-8">
        <h3 className="font-jersey25Regular text-3xl mb-4 px-3 lg:px-0 lg:ml-4">
          Campaign PLAZA
        </h3>
        <div
          className={cn(
            "grid px-3 lg:px-0 gap-y-6 justify-items-center",
            "grid-cols-1",
            "sm:grid-cols-2",
            "lg:grid-cols-3"
          )}
        >
          {competitions.length > 0 ? (
            competitions.map((competition) => (
              <Card
                key={competition.uuid}
                name={competition.name}
                imageUrl={competition.min_banner_url}
                href={
                  competition.status === "coming soon"
                    ? undefined
                    : competition.external_url ||
                      `/campaign/${competition.uuid}/`
                }
                startTime={competition.start_at}
                endTime={competition.end_at}
                status={competition.status}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400">
              No campaigns available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
