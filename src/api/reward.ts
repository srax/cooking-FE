export interface RewardData {
  lv1_claimed_reward: number; // L1 已领取奖励
  lv1_rebate_rate: number; // L1 返利比例（如 0.25 表示 25%）
  lv1_refer_count: number; // L1 推荐人数
  lv2_claimed_reward: number; // L2 已领取奖励
  lv2_rebate_rate: number; // L2 返利比例（如 0.07 表示 7%）
  lv2_refer_count: number; // L2 推荐人数
  total_unclaim_reward: number; // 总未领取奖励（注意：字段名是否拼写正确？可能应为 total_unclaimed_reward）
}

export interface unclaimedResponse {
  code: number;
  data: RewardData;
  token: string;
  message?: string;
}
// api/reward.ts
export const unclaimed = async (
  token: string
): Promise<unclaimedResponse | null> => {
  try {
    const response = await fetch("/api/invitation/reward/unclaimed", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data: unclaimedResponse = await response.json();

    if (response.ok && data.code === 200) {
      return data; // 返回完整的 unclaimedResponse
    }

    throw new Error(data.message || "请求失败");
  } catch (error) {
    console.error("请求失败:", error);
    return null; // 失败时返回 null
  }
};

export interface ReferralResponse {
  code: number;
  data: {
    items: ReferralItem[];
    pagination: PaginationInfo;
  };
}

export interface ReferralItem {
  id: number;
  joined_at: Date; // 可以考虑使用 Date 类型，如果需要处理日期
  profile: UserProfile;
  total_rebate: number;
  wallet: string;
}

export interface UserProfile {
  avatar_url: string;
  bio: string;
  nickname: string;
}

export interface PaginationInfo {
  has_next: boolean;
  has_previous: boolean;
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}
export const refereeList = async (token: string): Promise<ReferralResponse> => {
  try {
    const response = await fetch("/api/invitation/reward/referee/list", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data: ReferralResponse = await response.json();

    if (response.ok && data.code === 200) {
      return data; // 返回完整的 unclaimedResponse
    }

    throw new Error("请求失败");
  } catch (error: any) {
    console.error("请求失败:", error);
    return error; // 失败时返回 null
  }
};

export interface WalletVolumeResponse {
  code: number;
  data?: {
    volume_in_sol: number;
    volume_in_usd: number;
  };
  message?: string;
}

export const fetchWalletVolume = async (): Promise<WalletVolumeResponse> => {
  try {
    // 检查是否登录
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      return {
        code: 401,
        message: "用户未授权",
      };
    }

    const response = await fetch("/api/profile/volume", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    return {
      code: response.status,
      data: response.status === 200 ? data : undefined,
      message: response.status !== 200 ? data.message || "请求失败" : undefined,
    };
  } catch (error) {
    console.error("获取钱包交易量失败:", error);
    return {
      code: 500,
      message: error instanceof Error ? error.message : "服务器内部错误",
    };
  }
};
// 邀请码响应类型
export interface InvitationCodeResponse {
  code: number;
  data?: string; // 修改为 string 类型，直接存储邀请码
  message?: string;
}
/**
 * 获取或生成用户的邀请码
 * @returns 返回邀请码响应，包含用户的邀请码
 * @remarks 调用 /api/invitation/mycode 接口，需要用户登录并提供有效的 token
 * @throws 如果未登录或服务器错误，会返回相应的错误码和消息
 */
export const fetchInvitationCode =
  async (): Promise<InvitationCodeResponse> => {
    try {
      // 检查是否登录
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        return {
          code: 401,
          message: "用户未授权",
        };
      }

      const response = await fetch(`/api/invitation/mycode`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data: InvitationCodeResponse = await response.json();

      return {
        code: response.status,
        data: response.status === 200 ? data.data : undefined,
        message:
          response.status !== 200 ? data.message || "请求失败" : undefined,
      };
    } catch (error) {
      console.error("获取邀请码失败:", error);
      return {
        code: 500,
        message: error instanceof Error ? error.message : "服务器内部错误",
      };
    }
  };

export interface WalletScoreResponse {
  code?: number;
  data?: WalletScoreData;
  message?: string;
}
export interface WalletScoreData {
  wallet: string; // 钱包地址
  score: number; // 钱包评分（数值范围通常为 0-100）
  pnl: number; // 盈亏（Profit and Loss）
  volume: number; // 交易量
  loss_rate: number; // 亏损率（百分比数值，如 0.2 表示 20%）
  pump_times: number; // 拉盘次数（可能指特定交易行为次数）
}
export const fetchWalletScore = async (
  address: string
): Promise<WalletScoreResponse> => {
  try {
    // 检查是否登录
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      return {
        code: 401,
        message: "用户未授权",
      };
    }
    const params = {
      wallet: address,
    };
    const response = await fetch(`/v2/solana/cook/walletScore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
    if (response.status === 404) {
      console.error("404");
    }

    const data: WalletScoreResponse = await response.json();
    return {
      code: response.status,
      data: response.status === 200 ? data.data : undefined,
      message: response.status !== 200 ? data.message || "请求失败" : undefined,
    };
  } catch (error) {
    console.error("WalletScoreError:", error);
    return {
      code: 500,
      message: error instanceof Error ? error.message : "服务器内部错误",
    };
  }
};

export interface ApplyRewardResponse {
  code: number;
  data?: {
    before_at: string;
    reward_in_sol: number;
  };
  message?: string;
  error?: string;
}
/**
 * 申请领取奖励
 * @param token 用户授权令牌
 * @returns 返回申请奖励的响应，包含处理结果和可能的奖励信息
 * @remarks 调用 /api/invitation/reward/apply 接口，需要用户登录并提供有效的 token
 * @throws 如果未登录、申请频繁或服务器错误，会返回相应的错误码和消息
 */
export const applyReward = async (
  token: string
): Promise<ApplyRewardResponse> => {
  try {
    if (!token) {
      return {
        code: 401,
        error: "Unauthorized",
      };
    }

    const response = await fetch("/api/invitation/reward/apply", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data: ApplyRewardResponse = await response.json();

    return {
      code: response.status,
      data: response.status === 200 ? data.data : undefined,
      message: response.status === 200 ? data.message : undefined,
      error: response.status !== 200 ? data.error || "请求失败" : undefined,
    };
  } catch (error) {
    console.error("申请奖励失败:", error);
    return {
      code: 500,
      error: error instanceof Error ? error.message : "Internal server error",
    };
  }
};
