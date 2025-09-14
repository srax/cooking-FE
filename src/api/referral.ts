// 邀请信息响应类型
export interface InviteesResponse {
  code: number;
  data?: {
    invitee_count: number; // 邀请的用户数量
    total_transaction_volume_in_sol: number; // 这些用户的总交易量（以 SOL 为单位）
  };
  message?: string;
}

// 邀请码响应类型
export interface InvitationCodeResponse {
  code: number;
  data?: string; // 修改为 string 类型，直接存储邀请码
  message?: string;
}

/**
 * 获取当前用户邀请的用户数量及总交易量
 * @returns 返回邀请信息响应，包含被邀请用户数量和他们的总交易量
 * @remarks 调用 /api/invitation/invitees 接口，需要用户登录并提供有效的 token
 * @throws 如果未登录或服务器错误，会返回相应的错误码和消息
 */
export const fetchInvitees = async (): Promise<InviteesResponse> => {
  try {
    // 检查是否登录
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      return {
        code: 401,
        message: '用户未授权',
      };
    }

    const response = await fetch(`/api/invitation/invitees`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data: InviteesResponse = await response.json();

    return {
      code: response.status,
      data: response.status === 200 ? data.data : undefined,
      message: response.status !== 200 ? data.message || '请求失败' : undefined,
    };
  } catch (error) {
    console.error('获取邀请信息失败:', error);
    return {
      code: 500,
      message: error instanceof Error ? error.message : '服务器内部错误',
    };
  }
};

/**
 * 获取或生成用户的邀请码
 * @returns 返回邀请码响应，包含用户的邀请码
 * @remarks 调用 /api/invitation/mycode 接口，需要用户登录并提供有效的 token
 * @throws 如果未登录或服务器错误，会返回相应的错误码和消息
 */
export const fetchInvitationCode = async (): Promise<InvitationCodeResponse> => {
  try {
    // 检查是否登录
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      return {
        code: 401,
        message: '用户未授权',
      };
    }

    const response = await fetch(`/api/invitation/mycode`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data: InvitationCodeResponse = await response.json();

    return {
      code: response.status,
      data: response.status === 200 ? data.data : undefined,
      message: response.status !== 200 ? data.message || '请求失败' : undefined,
    };
  } catch (error) {
    console.error('获取邀请码失败:', error);
    return {
      code: 500,
      message: error instanceof Error ? error.message : '服务器内部错误',
    };
  }
};