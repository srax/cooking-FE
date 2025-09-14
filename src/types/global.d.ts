declare namespace Global {
  type TSocketData = {
    txHash: string;
    address: string;
    side: string;
    amount: { base: string; quote: string };
  };
  type TokenSecurityData = {
    balance_mutable_authority: {
      authority: string[];
      status: string;
    };
    closable: {
      authority: string;
      status: string;
    };
    creators: [
      {
        address: string;
        malicious_address: number;
      }
    ];
    default_account_state: string;
    default_account_state_upgradable: {
      authority: [];
      status: string;
    };
    dex: {
      day: {
        price_max: string;
        price_min: string;
        volume: string;
      };
      dex_name: string;
      fee_rate: string;
      id: string;
      lp_amount: string;
      month: {
        price_max: string;
        price_min: string;
        volume: string;
      };
      open_time: string;
      price: string;
      tvl: string;
      type: string;
      week: {
        price_max: string;
        price_min: string;
        volume: string;
      };
    }[];
    freezable: {
      authority: [];
      status: string;
    };
    holders: {
      account: string;
      balance: string;
      is_locked: number;
      locked_detail: string[];
      percent: string;
      tag: string;
      token_account: string;
    }[];
    lp_holders: [
      {
        account: string;
        balance: string;
        is_locked: number;
        locked_detail: string[];
        percent: string;
        tag: string;
        token_account: string;
      }
    ];
    metadata: {
      description: string;
      name: string;
      symbol: string;
      uri: string;
    };
    metadata_mutable: {
      metadata_upgrade_authority: string[];
      status: string;
    };
    mintable: {
      authority: string[];
      status: string;
    };
    non_transferable: string;
    total_supply: string;
    transfer_fee: Record<string, string>;
    transfer_fee_upgradable: {
      authority: string[];
      status: string;
    };
    transfer_hook: [];
    transfer_hook_upgradable: {
      authority: string[];
      status: string;
    };
    trusted_token: number;
  };

  type TPumpfunTokenInfo = {
    mint: string;
    mint_data: {
      mint_authority: null;
      supply: number;
      decimals: number;
      is_initialized: true;
      freeze_authority: null;
    };
    meta_addr: string;
    meta: {
      key: string;
      update_authority: string;
      mint: string;
      name: string;
      symbol: string;
      uri: string;
      seller_fee_basis_points: number;
      creators: {
        address: string;
        share: number;
        verified: true;
      }[];
      primary_sale_happened: false;
      is_mutable: false;
      edition_nonce: number;
      token_standard: string;
      collection: null;
      uses: null;
      collection_details: null;
      programmable_config: null;
    };
    curve_addr: string;
    curve: {
      discriminator: number;
      virtual_token_reserves: number;
      virtual_sol_reserves: number;
      real_token_reserves: number;
      real_sol_reserves: number;
      token_total_supply: number;
      complete: boolean;
    };
  };
  type TIpfsPumpfunTokenInfo = {
    name: string;
    symbol: string;
    description: string;
    image: string;
    showName: boolean;
    createdOn: string;
    twitter: string;
    telegram: string;
    website: string;
  };

  type GmgnLatestTransactionSocketDataItem = {
    amount_usd: string;
    balance: number;
    base_amount: string;
    chain: string;
    event: string;
    history_bought_amount: number;
    id: string;
    is_open_or_close: number;
    maker: string;
    maker_tags: string[];
    maker_token_tags: string[];
    quote_address: string;
    quote_amount: string;
    quote_symbol: string;
    realized_profit: number;
    timestamp: number;
    token_address: string;
    token_symbol: string;
    total_trade: number;
    tx_hash: string;
  };

  type Change<T> = Record<keyof T, number>;
  type TimePeriods = '1m' | '5m' | '1h' | '6h' | '24h';
  type PriceChange = Change<Record<TimePeriods, number>>;
  type VolumeChange = Change<Record<TimePeriods, number>>;
  type SocialLink = {
    twitter?: string;
    website?: string;
    telegram?: string;
    discord?: string;
    youtube?: string;
  };
  type Direction = 'asc' | 'desc';
  type Ecosystem = 'pumpfun' | 'virtuals';
  type TokenBasicInfo = {
    chain: string; // 链
    ecosystem?: Ecosystem; // 生态
    address: string; // 代币地址
    symbol: string; // 代币符号
    name: string; // 代币名称
    decimals: number; // 小数位数
    supply: number; // 供应量
    curve?: string;
    creator?: string;
  };
  type TokenPromotionInfo = {
    createTime: number; // 创建时间
    logo?: string; // 代币标志
    bannerUrl?: string; // 横幅 URL
    description?: string; // 描述
    social?: SocialLink; // 社交链接
  };
  type TokenMarketInfo = {
    progress?: number; // 进度，单位%
    price: number; // 价格
    priceChange?: PriceChange; // 价格变化
    volumeIn24h: number; // 24h交易量
    volumeChange?: VolumeChange; // 交易量变化
    marketCap: number; // 市值
    holderCount?: number; // 持有者数量
    poolCap?: number; // 流动池市值
  };
  type TokenTradeStat = {
    buy?: Change<Record<TimePeriods, number>>;
    sell?: Change<Record<TimePeriods, number>>;
  };
  type VolumeItem = {
    tokenVolume: number;
    solVolume: number;
    usdtVolume: number;
    buyCount: number;
    sellCount: number;
    buyUsdt: number;
    sellUsdt: number;
    txn: number;
  };

  type PoolInfo = {
    ecosystem: string;
    curve: string;
    mint: string;
    reverse_usd: number;
    token_reverse: number;
    sol_reverse: number;
    holder: number;
    init_time: number;
    creator: string;
  };
  type AlertMessageData = {
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string;
    owner_wallet: string;
    chain: string;
    wallet: string;
    wallet_remark: string;
    token_amount: string;
    token_symbol: string;
    token_price: string;
    token_market_cap: string;
    transfer_direction: string;
  };

  type AccountItem = {
    id: number;
    id_str: string;
    screen_names: Record<string, Date[]>;
  };

  type Volume = Record<TimePeriods, VolumeItem>;
  type TokenInfo = TokenBasicInfo &
    TokenPromotionInfo &
    TokenMarketInfo &
    TokenTradeStat & { transaction: Volume } & { curveInfo: PoolInfo[] } & {
      twName: { accounts: null | AccountItem[] };
    };
}
export interface WalletItem {
  name: string;
  privateKey: string;
  address?: string;
  balance?: number;
  group: string;
  network: string;
}