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

  // Add the new ChefID campaign
  const chefIdCampaign: Competition = {
    allocation_1st: "",
    allocation_2nd: "",
    allocation_3rd: "",
    allocation_4th: "",
    allocation_5th: "",
    allocation_6th_20th: "",
    allocation_rest_method: "",
    description: "",
    end_at: "2025-11-20T23:59:59Z",
    external_url: "",
    header_banner_url: "",
    is_self_calculate: false,
    min_banner_url: "/images/campaign/campaign1.png",
    name: "ChefID",
    payout_end_date: "",
    prize_pool_sol: "",
    rich_text_content: "",
    start_at: "2025-09-20T00:00:00Z",
    status: "coming soon",
    top_redirect_url: "",
    uuid: "chefid-campaign-001"
  };

  // Add ChefID campaign to the beginning of the list
  const allCampaigns = [chefIdCampaign, ...competitions];

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
          {allCampaigns.length > 0 ? (
            allCampaigns.map((campaign) => (
              <Card
                key={campaign.uuid}
                name={campaign.name}
                imageUrl={campaign.min_banner_url}
                href={
                  campaign.status === "coming soon"
                    ? undefined
                    : campaign.external_url ||
                      `/campaign/${campaign.uuid}/`
                }
                startTime={campaign.start_at}
                endTime={campaign.end_at}
                status={campaign.status}
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
