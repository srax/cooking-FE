export interface TradingCompetitionSchema {
  uuid: string;
  name: string;
  description: string;
  start_at: string;
  end_at?: string;
  prize_pool_sol: number;
  status: string;
  min_banner_url: string;
  header_banner_url: string;
  payout_end_date: string;
  allocation_1st: string;
  allocation_2nd: string;
  allocation_3rd: string;
  allocation_4th: string;
  allocation_5th: string;
  allocation_6th_20th: string;
  allocation_rest_method: string;
  is_self_calculate: boolean;
  external_url: string;
  mob_end_header_banner_url: string;
  mob_header_banner_url: string;
  end_header_banner_url: string;
  reward_wallet_address: string;
  rich_text_content: string;
  top_redirect_url: string;
}

export interface TradingCompetitionSnapshotSchema {
  user_address: string;
  rank: number;
  reward_sol?: number;
  total_volume_sol: number;
  total_volume_usd: number;
  snapshot_time: string;
}

export interface TradingCompetitionTop50Response {
  code: number;
  data: {
    page: number;
    page_size: number;
    total: number;
    event: TradingCompetitionSchema;
    items: TradingCompetitionSnapshotSchema[];
  };
}

export interface TradingCompetitionDetailResponse {
  code: number;
  data: TradingCompetitionSchema;
}

export interface MyCompetitionStatusResponse {
  code: number;
  data: {
    rank?: number;
    reward_sol?: number;
    total_volume_sol: number;
    total_volume_usd: number;
  };
}
