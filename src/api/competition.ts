// 竞赛相关 API 接口

// 竞赛列表响应类型
export interface CompetitionListResponse {
  code: number;
  data?: {
    items: CompetitionItem[];
    page: number;
    page_size: number;
    total: number;
  };
  message?: string;
}

// 竞赛项目类型
export interface CompetitionItem {
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

// 竞赛排行榜响应类型
export interface CompetitionTopResponse {
  code: number;
  data?: {
    page: number;
    page_size: number;
    total: number;
    event: {
      uuid: string;
      name: string;
      description: string;
      start_at: string;
      end_at?: string;
      prize_pool_sol: number;
      status: string;
    };
    items: {
      user_address: string;
      rank: number;
      reward_sol?: number;
      total_volume_sol: number;
      total_volume_usd: number;
      snapshot_time: string;
    }[];
  };
  message?: string;
}

// 我的竞赛状态响应类型
export interface MyCompetitionStatusResponse {
  code: number;
  data?: {
    rank?: number;
    reward_sol?: number;
    total_volume_sol: number;
    total_volume_usd: number;
    claimed: boolean;
  };
  message?: string;
}

// 领取奖励响应类型
export interface ClaimRewardResponse {
  code: number;
  data?: {
    tx_hash: string;
    reward_amount: string;
    message: string;
  };
  message?: string;
}

/**
 * 获取竞赛列表
 * @param page - 页码，从1开始
 * @param pageSize - 每页数量，最大100
 * @returns 返回竞赛列表响应
 * @remarks 调用 /api/competition/list 接口
 */
export const fetchCompetitionList = async (
  page: number = 1,
  pageSize: number = 20
): Promise<CompetitionListResponse> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    const response = await fetch(`/api/competition/list?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: CompetitionListResponse = await response.json();

    if (response.ok && data.code === 200) {
      return data;
    }

    return {
      code: response.status,
      message: data.message || "Request failed",
    };
  } catch (error) {
    console.error("Failed to fetch competition list:", error);
    return {
      code: 500,
      message: error instanceof Error ? error.message : "Internal server error",
    };
  }
};

/**
 * 获取竞赛排行榜前50名
 * @param competitionUuid - 竞赛的唯一标识符
 * @param page - 页码，从1开始
 * @param pageSize - 每页数量，最大100
 * @returns 返回竞赛排行榜响应
 * @remarks 调用 /api/competition/top/{competition_uuid} 接口，需要用户登录
 */
export const fetchCompetitionTop = async (
  competitionUuid: string,
  page: number = 1,
  pageSize: number = 20
): Promise<CompetitionTopResponse> => {
  try {
    // 检查是否登录
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      return {
        code: 401,
        message: "User unauthorized",
      };
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    const response = await fetch(
      `/api/competition/top/${competitionUuid}?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data: CompetitionTopResponse = await response.json();

    if (response.ok && data.code === 200) {
      return data;
    }

    return {
      code: response.status,
      message: data.message || "Request failed",
    };
  } catch (error) {
    console.error("Failed to fetch competition top:", error);
    return {
      code: 500,
      message: error instanceof Error ? error.message : "Internal server error",
    };
  }
};

/**
 * 获取当前用户在竞赛中的状态
 * @param competitionUuid - 竞赛的唯一标识符
 * @returns 返回用户在竞赛中的状态信息
 * @remarks 调用 /api/competition/my/{competition_uuid} 接口，需要用户登录并提供有效的 token
 * @throws 如果未登录或服务器错误，会返回相应的错误码和消息
 */
export const fetchMyCompetitionStatus = async (
  competitionUuid: string
): Promise<MyCompetitionStatusResponse> => {
  try {
    // 检查是否登录
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      return {
        code: 401,
        message: "User unauthorized",
      };
    }

    const response = await fetch(`/api/competition/my/${competitionUuid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data: MyCompetitionStatusResponse = await response.json();

    if (response.ok && data.code === 200) {
      return data;
    }

    if (data.code === 401) {
      return {
        code: 401,
        message: data.message || "User unauthorized",
      };
    }

    if (data.code === 404) {
      return {
        code: 404,
        message:
          data.message || "Competition not found or user not participating",
      };
    }

    return {
      code: response.status,
      message: data.message || "Request failed",
    };
  } catch (error) {
    console.error("Failed to fetch my competition status:", error);
    return {
      code: 500,
      message: error instanceof Error ? error.message : "Internal server error",
    };
  }
};

/**
 * 通用的竞赛 API 错误处理函数
 * @param error - 错误对象
 * @param defaultMessage - 默认错误消息
 * @returns 格式化的错误响应
 */
export const handleCompetitionApiError = (
  error: unknown,
  defaultMessage: string = "Request failed"
): { code: number; message: string } => {
  console.error("Competition API error:", error);

  if (error instanceof Error) {
    return {
      code: 500,
      message: error.message,
    };
  }

  return {
    code: 500,
    message: defaultMessage,
  };
};

/**
 * User claims competition reward
 * @param competitionUuid - Competition unique identifier
 * @returns Returns transaction hash and reward amount
 * @remarks Calls /api/competition/claim_reward/{competition_uuid} API, requires user login
 */
export const claimCompetitionReward = async (
  competitionUuid: string
): Promise<ClaimRewardResponse> => {
  try {
    // Check if user is logged in
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      return {
        code: 401,
        message: "User unauthorized",
      };
    }

    const response = await fetch(
      `/api/competition/claim_reward/${competitionUuid}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data: ClaimRewardResponse = await response.json();

    // Log response for debugging
    console.log("API Response status:", response.status);
    console.log("API Response data:", data);

    if (response.ok && data.code === 200) {
      return data;
    }

    if (data.code === 400) {
      return {
        code: 400,
        message: data.message || "User does not meet claim conditions",
      };
    }

    if (data.code === 404) {
      return {
        code: 404,
        message: data.message || "Competition not found",
      };
    }

    return {
      code: response.status,
      message: data.message || "Request failed",
    };
  } catch (error) {
    console.error("Failed to claim competition reward:", error);
    return {
      code: 500,
      message: error instanceof Error ? error.message : "Internal server error",
    };
  }
};
