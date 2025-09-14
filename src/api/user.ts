import { ApiResponse } from '@/types/base';

// 登录请求参数
export interface LoginParams {
  invite_code: string | null;
  message: string;
  public_key: string;
  signature: string;
}

// 登录接口响应类型
export interface LoginResponse {
  code: number;
  data: {
    profile: {
      address: string;
      avatar_url: string | null;
      bio: string | null;
      created_at: string;
      nick_name: string;
    };
    token: string;
  };
  message?: string;
}

/**
 * 用户登录
 * @param params - 登录参数，包括邀请码、消息、公钥和签名
 * @returns 返回登录成功的 token 或 null
 * @remarks 调用 /api/auth/solana/login 接口，通过 Solana 签名验证用户身份
 * @throws 如果登录失败，会返回 null 并记录错误
 */
export const login = async (params: LoginParams): Promise<string | null> => {
  try {
    const response = await fetch('/api/auth/solana/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data: LoginResponse = await response.json();

    if (data.code === 200 && data.data?.token) {
      return data.data.token;
    }
    throw new Error(data.message || '登录失败');
  } catch (error) {
    console.error('登录失败:', error);
    return null;
  }
};

// 用户信息接口响应类型
export interface UserInfoResponse {
  code: number;
  data: {
    profile: {
      address: string;
      avatar_url: string | null;
      bio: string | null;
      created_at: string;
      nick_name: string;
      twitter_screen_name?: string | null;
      telegram_username?: string | null;
      points: number | null;
    };
  };
  message?: string;
}

// 根据地址查询用户资料的响应类型
export interface UserInfoByAddressResponse {
  code: number;
  profile: {
    address: string;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    nick_name: string;
    twitter_screen_name?: string | null;
    telegram_username?: string | null;
    points: number | null;
  };
  message?: string;
}

/**
 * 获取用户信息
 * @param token - 用户认证令牌
 * @returns 返回用户信息数据或 null
 * @remarks 调用 /api/auth/me 接口，需要有效的 token
 * @throws 如果获取失败，会返回 null 并记录错误
 */
export const fetchUserInfo = async (token: string): Promise<UserInfoResponse['data'] | null> => {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data: UserInfoResponse = await response.json();

    if (data.code === 200 && data.data) {
      return data.data;
    }
    throw new Error(data.message || '获取用户信息失败');
  } catch (error) {
    console.error('获取用户信息出错:', error);
    return null;
  }
};

/**
 * 根据地址查询用户资料
 * @param address - 用户地址
 * @returns 返回用户信息数据或 null
 * @remarks 调用 /api/profile/address/{address} 接口
 * @throws 如果查询失败，会返回 null 并记录错误
 */
export const fetchUserInfoByAddress = async (address: string): Promise<UserInfoResponse['data'] | null> => {
  try {
    if (!address) {
      throw new Error('地址参数无效');
    }

    const response = await fetch(`/api/profile/address/${encodeURIComponent(address)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: UserInfoByAddressResponse = await response.json();

    if (response.ok && data.code === 200 && data.profile) {
      // Transform the profile to match UserInfoResponse['data'] structure
      return { profile: data.profile };
    }

    if (data.code === 400) {
      throw new Error(data.message || '请求参数错误');
    } else if (data.code === 404) {
      throw new Error(data.message || '用户未找到');
    }

    throw new Error(data.message || '查询用户资料失败');
  } catch (error) {
    console.error('查询用户资料出错:', error);
    return null;
  }
};

// 更新用户信息的请求参数类型
export interface UpdateProfileParams {
  avatar_url: string;
  bio: string;
  nick_name: string;
}

// 更新用户信息的响应类型
export interface UpdateProfileResponse {
  code: number;
  profile?: {
    address: string;
    avatar_url: string;
    bio: string;
    nick_name: string;
  };
  message: string;
}

/**
 * 更新用户信息
 * @param token - 用户认证令牌
 * @param params - 更新用户信息的参数，包括头像 URL、简介和昵称
 * @returns 返回更新用户信息响应，包含更新后的用户信息或错误信息
 * @remarks 调用 /api/profile/update 接口，需要有效的 token
 * @throws 如果参数无效、未授权或服务器错误，会抛出错误
 */
export const updateUserProfile = async (
  token: string,
  params: UpdateProfileParams
): Promise<UpdateProfileResponse> => {
  try {
    const response = await fetch('/api/profile/update', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data: UpdateProfileResponse = await response.json();

    if (response.ok && data.code === 200) {
      return data;
    }

    // 处理特定错误状态码
    if (data.code === 400) {
      throw new Error(data.message || '请求参数错误');
    } else if (data.code === 401) {
      throw new Error(data.message || '用户未找到或未授权');
    }

    throw new Error(data.message || '更新用户信息失败');
  } catch (error) {
    console.error('更新用户信息出错:', error);
    throw error;
  }
};
// Telegram绑定接口响应类型
export interface TelegramBindResponse {
  code: number;
  data: {
    bot: string;
    code: string;
  };
  message?: string;
}

/**
 * 获取Telegram绑定信息
 * @param token - 用户认证令牌
 * @returns 返回Telegram机器人链接和绑定代码，或 null
 * @remarks 调用 /api/telegram/bind 接口，需要有效的 token
 * @throws 如果获取失败，会返回 null 并记录错误
 */
export const fetchTelegramBindInfo = async (token: string): Promise<TelegramBindResponse['data'] | null> => {

  try {
    const response = await fetch('/api/telegram/bind', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data: TelegramBindResponse = await response.json();

    if (response.ok && data.code === 200 && data.data) {
      return data.data;
    }

    if (data.code === 400) {
      throw new Error(data.message || '请求参数错误');
    } else if (data.code === 401) {
      throw new Error(data.message || '用户未授权');
    }

    throw new Error(data.message || '获取Telegram绑定信息失败');
  } catch (error) {
    console.error('获取Telegram绑定信息出错:', error);
    return null;
  }
};

// 查询邀请人信息的响应类型
export interface InviterInfoResponse {
  code: number;
  data?: {
    inviter_address: string;
  };
  error?: string;
}

/**
 * 查询登录用户的邀请人信息
 * @param token - 用户认证令牌
 * @returns 返回邀请人地址或 null
 * @remarks 调用 /api/invitation/inviter 接口，需要有效的 token
 * @throws 如果查询失败，会返回 null 并记录错误
 */
export const fetchInviterInfo = async (): Promise<InviterInfoResponse['data'] | null> => {
  // 检查是否登录
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    throw new Error('请先登录以上传图片');
  }
  try {
    const response = await fetch('/api/invitation/inviter', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data: InviterInfoResponse = await response.json();

    if (response.ok && data.code === 200 && data.data) {
      return data.data;
    }

    if (data.code === 401) {
      throw new Error(data.error || '用户未授权');
    } else if (data.code === 404) {
      throw new Error(data.error || '未找到邀请人信息');
    }

    throw new Error(data.error || '查询邀请人信息失败');
  } catch (error) {
    console.error('查询邀请人信息出错:', error);
    return null;
  }
};

// 填写邀请码的请求参数类型
export interface SubmitInvitationCodeParams {
  invitation_code: string;
}

// 填写邀请码的响应类型
export interface SubmitInvitationCodeResponse {
  code: number;
  message?: string;
  error?: string;
}

/**
 * 填写邀请码
 * @param token - 用户认证令牌
 * @param params - 邀请码参数
 * @returns 返回填写邀请码的结果
 * @remarks 调用 /api/invitation/submit_code 接口，需要有效的 token
 * @throws 如果填写失败，会抛出错误
 */
export const submitInvitationCode = async (
  params: SubmitInvitationCodeParams
): Promise<SubmitInvitationCodeResponse> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    throw new Error('请先登录以上传图片');
  }
  try {
    const response = await fetch('/api/invitation/submit_code', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data: SubmitInvitationCodeResponse = await response.json();

    if (response.ok && data.code === 200) {
      return data;
    }

    if (data.code === 400) {
      throw new Error(data.error || '用户已存在邀请记录');
    } else if (data.code === 404) {
      throw new Error(data.error || '邀请码无效');
    }

    throw new Error(data.error || '填写邀请码失败');
  } catch (error) {
    console.error('填写邀请码出错:', error);
    throw error;
  }
};