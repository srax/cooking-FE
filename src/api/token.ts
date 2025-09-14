// 代币信息类型
export interface Token {
  address: string;
  balance: number;
  created_at: string;
  description: string;
  discord: string;
  graduation_time: string;
  has_deployed_insurance: boolean;
  holders: number;
  insurance_activation_price: number;
  insurance_status: string;
  insurance_amt: number;
  logo: string;
  market_cap: number;
  name: string;
  price_in_sol: number;
  price_in_usd: number;
  progress: number;
  signer: string;
  status: string;
  symbol: string;
  telegram: string;
  twitter: string;
  website: string;
  h24_chg: number;
  h24_vol: number;
  replies: number;
  computed_insurance_status: string;
  creator?: UserProfile;
}

interface UserProfile {
  address: string;
  avatar_url: string;
  created_at: string;
  nick_name: string;
  twitter_screen_name: string;
}

// 代币列表响应类型
export interface TokensListResponse {
  code: number;
  data?: {
    items: Token[];
    page?: number;
    total: number;
    request: {
      graduated: boolean;
      keyword: string;
      page: number;
      pageSize: number;
      sort: string;
      sort_direction: string;
    };
  };
  message?: string;
}

// 获取代币列表参数类型
export interface GetTokensListParams {
  keyword?: string;
  page: number;
  pageSize: number;
  sort?: string;
  sort_direction?: "asc" | "desc";
  graduated?: boolean;
  mock?: boolean;
  insurance?: boolean;
  network?: "mainnet" | "testnet" | "devnet";
}

// 获取用户代币参数类型
export interface GetTokensParams {
  page: number;
  pageSize: number;
  sort?: string;
  sortDirection?: "asc" | "desc";
}

/**
 * 获取代币列表
 * @param params - 获取代币列表的参数，包括分页、排序、搜索关键词等
 * @returns 返回代币列表响应，包含代币数据、总数和请求信息
 * @remarks 支持 mock 模式，用于开发时模拟数据；实际请求调用 /api/token/list 接口
 */
export const fetchTokensList = async (
  params: GetTokensListParams
): Promise<TokensListResponse> => {
  const queryString = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
    ...(params.keyword && { keyword: params.keyword }),
    ...(params.sort && { sort: params.sort }),
    ...(params.sort_direction && { sort_direction: params.sort_direction }),
    ...(params.graduated !== undefined && {
      graduated: params.graduated.toString(),
    }),
    ...(params.insurance && { insurance_amt_gt: "0" }),
    ...{
      network:
        process.env.NEXT_PUBLIC_IS_DEV === "false" ? "mainnet" : "devnet",
    },
    ...{
      platform: "meteora",
    },
  }).toString();

  const response = await fetch(`/api/token/list?${queryString}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

// 置顶代币响应类型
export interface PinnedTokenResponse {
  code: number;
  data?: Token;
  error?: string;
}

/**
 * 获取置顶代币
 * @returns 返回置顶代币的详细信息或错误信息
 * @remarks 调用 /api/token/pin 接口，支持 200、404 状态码
 */
export const getPinnedToken = async (): Promise<PinnedTokenResponse> => {
  try {
    const response = await fetch("/api/token/pin", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: PinnedTokenResponse = await response.json();

    if (response.status === 404) {
      return {
        code: 404,
        error: data.error || "Pinned token not found",
      };
    }

    return data;
  } catch (error) {
    console.error("获取置顶代币失败:", error);
    return {
      code: 500,
      error:
        error instanceof Error ? error.message : "Failed to fetch pinned token",
    };
  }
};

export interface UserTokenPosition {
  address: string;
  balance: number;
  can_redeem_insurance: boolean;
  created_at: string;
  description: string;
  discord: string;
  has_deployed_insurance: boolean;
  holders: number;
  insurance_activation_price: number;
  insurance_amt: number;
  insurance_status: string;
  is_graduated: boolean;
  logo: string;
  market_cap: number;
  name: string;
  price_in_sol: number;
  price_in_usd: number;
  progress: number;
  signer: string;
  status: string;
  symbol: string;
  telegram: string;
  twitter: string;
  website: string;
  h24_chg: number;
  h24_vol: number;
}

export interface UserTokensResponse {
  code: number;
  data?: Token[];
  error?: string;
}

// Update the params interface
export interface GetUserTokensParams {
  user_address: string;
  sort?: "active" | "balance" | "pnl";
  sort_direction?: "asc" | "desc";
  page: number;
  pageSize: number;
}

/**
 * 获取用户持有的代币（模拟接口）
 * @param token - 用户认证令牌
 * @param params - 获取代币的参数，包括分页和排序
 * @returns 返回用户持有的代币列表响应，包含代币数据和总数
 * @remarks 当前为模拟实现，返回 mock 数据，实际实现需替换为真实接口
 */
/**
 * 获取用户持有的代币
 * @param params - 获取用户代币的参数，包括用户地址、分页和排序
 * @returns 返回用户持有的代币列表响应，包含代币持仓数据
 * @remarks 调用 /api/token/user/{user_address}/positions 接口，包含错误处理
 */
export const fetchUserTokens = async (
  params: GetUserTokensParams
): Promise<UserTokensResponse> => {
  try {
    const queryString = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
      ...(params.sort && { sort: params.sort }),
      ...(params.sort_direction && { sort_direction: params.sort_direction }),
    }).toString();

    const response = await fetch(
      `/api/token/user/${params.user_address}/positions?${queryString}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data: UserTokensResponse = await response.json();

    if (response.status === 400) {
      return {
        code: 400,
        error: data.error || "Invalid request",
      };
    }

    if (response.status === 500) {
      return {
        code: 500,
        error: data.error || "Internal server error",
      };
    }

    return data;
  } catch (error) {
    console.error("获取用户持有的代币失败:", error);
    return {
      code: 500,
      error:
        error instanceof Error ? error.message : "Failed to fetch user tokens",
    };
  }
};

/**
 * 获取用户创建的代币
 * @param userAddress - 用户地址
 * @param params - 获取代币的参数，包括分页和排序
 * @returns 返回用户创建的代币列表响应，包含代币数据和总数
 * @remarks 调用 /api/token/user/{userAddress}/created 接口，包含错误处理
 */
export const fetchUserCreatedTokens = async (
  userAddress: string,
  params: GetTokensParams
): Promise<TokensListResponse> => {
  try {
    const queryString = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
      ...(params.sort && { sort: params.sort }),
      ...(params.sortDirection && { sortDirection: params.sortDirection }),
    }).toString();

    const response = await fetch(
      `/api/token/user/${userAddress}/created?${queryString}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data: TokensListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("获取用户创建的代币失败:", error);
    return {
      code: 500,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch created tokens",
    };
  }
};

// 代币详情响应类型
export interface TokenDetailResponse {
  code: number;
  data?: Token;
  error?: string;
}

/**
 * 获取代币详情
 * @param address - 代币唯一地址
 * @returns 返回代币详情响应，包含代币详细信息或错误信息
 * @remarks 调用 /api/token/{address} 接口，支持 200、404 状态码
 */
export const getTokenDetail = async (
  address: string
): Promise<TokenDetailResponse> => {
  try {
    const response = await fetch(`/api/token/${address}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: TokenDetailResponse = await response.json();
    return data;
  } catch (error) {
    console.error("获取代币详情失败:", error);
    return {
      code: 500,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch token details",
    };
  }
};

// 代币持有者信息类型
export interface HolderItem {
  address: string;
  amount: string;
  percentage: string;
  value_in_usd: string;
}

// 代币持有者响应类型
export interface HoldersResponse {
  code: number;
  data?: {
    holders: HolderItem[];
  };
  error?: string;
}

/**
 * 获取代币持有者列表（前100名）
 * @param address - 代币唯一地址
 * @returns 返回代币持有者列表响应，包含前100名持有者数据或错误信息
 * @remarks 调用 /api/token/holders/{address} 接口，支持 200、404 状态码
 */
export const getTokenHolders = async (
  address: string
): Promise<HoldersResponse> => {
  try {
    const response = await fetch(`/api/token/holders/${address}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: HoldersResponse = await response.json();
    return data;
  } catch (error) {
    console.error("获取代币持有者列表失败:", error);
    return {
      code: 500,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch token holders",
    };
  }
};

// 用户资料类型
export interface Profile {
  address: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  nick_name: string;
}

export interface Request {
  address: string;
  limit: number;
  minVolume?: number;
  signer?: string;
}

export interface Transaction {
  asset: string;
  type: string;
  usdPrice: number;
  usdVolume: number;
  traderAddress: string;
  txHash: string;
  amount: number;
  isMev: boolean;
  isValidPrice: boolean;
  poolId: string;
  isMrp: boolean;
  timestamp: string;
  nativeVolume: number;
}

export interface TransactionsResponse {
  txs: Transaction[];
  next?: string;
}
/**
 * 获取代币交易记录
 * @param params - 请求参数
 * @param params.address - 代币唯一地址
 * @param params.limit - 每页交易数量，最大为100
 * @param params.minVolume - 成交量过滤（可选）
 * @param params.signer - 过滤钱包地址（可选）
 * @returns 返回代币交易列表响应，包含交易数据
 * @remarks 调用 https://datapi.jup.ag/v1/txs/{address} 接口
 */
export const getTokenTransactions = async ({
  address,
  limit,
  minVolume,
  signer,
}: Request): Promise<TransactionsResponse> => {
  const queryParams: { [key: string]: string } = {
    limit: limit.toString(),
  };
  if (minVolume !== undefined) {
    queryParams.minVolume = minVolume.toString();
  }
  if (signer) {
    queryParams.signer = signer;
  }

  const queryString = new URLSearchParams(queryParams).toString();
  const url = `https://datapi.jup.ag/v1/txs/${address}?${queryString}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TransactionsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("获取代币交易记录失败:", error);
    throw error;
  }
};
// 创建代币参数类型
export interface CreateTokenParams {
  insurance_amt: number;
  insurance_px: number;
  name: string;
  symbol: string;
  uri: string;
  user_pubkey: string;
  network: string; // 'mainnet'| 'testnet'| 'devnet',
  platform: string; // 'raydium'| 'meteora',
  platform_params: string;
}

interface CreatedToken {
  mint: string;
  signature: string;
  tx: string;
  dlmm: {
    initial_bin_id: number;
  };
}

export interface CreateTokenResponse {
  code: number;
  data?: CreatedToken;
  error?: string;
}

/**
 * 创建未签名的代币交易
 * @param params - 创建代币的参数
 * @returns 返回未签名交易信息或错误信息
 */
export const createToken = async (
  params: CreateTokenParams
): Promise<CreateTokenResponse> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    throw new Error("请先登录");
  }

  try {
    const response = await fetch("/api/token/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    const data: CreateTokenResponse = await response.json();
    return data;
  } catch (error) {
    console.error("创建代币失败:", error);
    return {
      code: 500,
    };
  }
};

export interface TradeResponse {
  code: number;
  msg: string;
  data: TradeItem[];
}
export interface TradeItem {
  create_time: string;
  logo: string;
  symbol: string;
  mint: string;
  curve: string;
  signature: string;
  signer: string;
  token_amount: Number;
  sol_amount: Number;
  new_price_usd: Number;
  new_price_sol: Number;
  is_buy: boolean;
  volume_usd: Number;
  slot: string;
  pnl: Number;
  transfer_type: Number;
}

// 代币价格响应类型
export interface TokenDetailByRaydiumResponse {
  id: string;
  success: boolean;
  data: {
    rows: Array<{
      mint: string;
      poolId: string;
      configId: string;
      creator: string;
      createAt: number;
      name: string;
      symbol: string;
      description: string;
      imgUrl: string;
      metadataUrl: string;
      platformInfo: {
        pubKey: string;
        platformClaimFeeWallet: string;
        platformLockNftWallet: string;
        cpConfigId: string;
        platformScale: string;
        creatorScale: string;
        burnScale: string;
        feeRate: string;
        name: string;
        web: string;
        img: string;
      };
      configInfo: {
        name: string;
        pubKey: string;
        epoch: number;
        curveType: number;
        index: number;
        migrateFee: string;
        tradeFeeRate: string;
        maxShareFeeRate: string;
        minSupplyA: string;
        maxLockRate: string;
        minSellRateA: string;
        minMigrateRateA: string;
        minFundRaisingB: string;
        protocolFeeOwner: string;
        migrateFeeOwner: string;
        migrateToAmmWallet: string;
        migrateToCpmmWallet: string;
        mintB: string;
      };
      mintB: {
        chainId: number;
        address: string;
        programId: string;
        logoURI: string;
        symbol: string;
        name: string;
        decimals: number;
        tags: string[];
        extensions: Record<string, any>;
      };
      decimals: number;
      supply: number;
      marketCap: number;
      volumeA: number;
      volumeB: number;
      volumeU: number;
      finishingRate: number;
      initPrice: string;
      endPrice: string;
      totalLockedAmount: number;
      cliffPeriod: string;
      unlockPeriod: string;
      startTime: number;
      totalAllocatedShare: number;
      defaultCurve: boolean;
      totalSellA: string;
      migrateAmmId?: string;
      totalFundRaisingB: string;
      migrateType: string;
    }>;
  };
}
/**
 * 查询代币的conviction pool信息
 * @param token_address - 代币地址
 * @returns 返回conviction pool信息或错误信息
 */
export const getConvictionPool = async (
  token_address: string
): Promise<ConvictionPoolResponse> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    throw new Error("请先登录");
  }

  try {
    const response = await fetch(
      `/api/token/conviction_pool/${token_address}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data: ConvictionPoolResponse = await response.json();
    return data;
  } catch (error) {
    console.error("获取conviction pool失败:", error);
    return {
      code: 500,
    };
  }
};

export interface ConvictionPoolResponse {
  code: number;
  data?: {
    address: string;
  };
}
