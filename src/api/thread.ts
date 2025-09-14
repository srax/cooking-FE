export interface Profile {
  address: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  nick_name: string;
}

export interface Comment {
  comment: string;
  created_at: string;
  id: number;
  image_url: string;
  is_liked: boolean;
  likes: number | null;
  profile: Profile;
  sender_address: string;
  token_address: string;
}

export interface CommentsResponse {
  code: number;
  data: {
    items: Comment[];
    total: number;
  };
  message: string;
}

export interface LikeResponse {
  code: number;
  message?: string;
}

/**
 * 获取代币相关评论列表
 * @param token - 代币唯一地址
 * @param page - 请求的页码
 * @param pageSize - 每页评论数量
 * @param sortBy - 排序字段
 * @param sortOrder - 排序方向（'asc' 或 'desc'）
 * @returns 返回评论列表响应，包含评论数据和总数
 * @remarks 调用 /api/thread/token/{token} 接口，响应数据会进行格式转换以匹配 Comment 类型
 */
export const getTokenComments = async (
  token: string,
  page: number,
  pageSize: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): Promise<CommentsResponse> => {
  const queryString = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    sort_by: sortBy,
    sort_order: sortOrder,
  }).toString();

  const response = await fetch(`/api/thread/token/${token}?${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (data.code === 200 && data.data && Array.isArray(data.data.items)) {
    data.data.items = data.data.items.map((item: any) => ({
      comment: item.thread.comment,
      created_at: item.thread.created_at,
      id: item.thread.id,
      image_url: item.thread.image_url,
      is_liked: item.thread.is_liked ?? false,
      likes: item.thread.likes ?? 0,
      profile: item.sender,
      sender_address: item.thread.sender_address,
      token_address: item.thread.token_address,
    }));
  }
  return data;
};

export interface PostThreadParams {
  comment: string;
  image_url: string;
  token_address: string;
}

export interface ThreadResponse {
  code: number;
  data: {
    comment: string;
    created_at: string;
    id: number;
    image_url: string;
    is_liked: boolean;
    likes: number;
    profile: {
      address: string;
      avatar_url: string;
      bio: string;
      nick_name: string;
    };
    sender_address: string;
    token_address: string;
    updated_at: string;
  };
  message: string;
}

/**
 * 发布新帖子
 * @param params - 帖子参数，包括评论内容、图片 URL 和代币地址
 * @returns 返回新帖子响应，包含帖子详细信息
 * @remarks 调用 /api/thread/new 接口，需要用户登录并提供有效的 token
 * @throws 如果未登录或参数无效，会抛出错误
 */
export const postThread = async (params: PostThreadParams): Promise<ThreadResponse> => {
  try {
    // 检查是否登录
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      throw new Error('请先登录以发布帖子');
    }

    const response = await fetch(`/api/thread/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    const data: ThreadResponse = await response.json();

    if (response.status === 201) {
      return data;
    } else if (response.status === 400) {
      throw new Error(data.message || '输入参数无效');
    } else {
      throw new Error(data.message || '服务器内部错误');
    }
  } catch (error) {
    console.error('发布帖子失败:', error);
    throw error;
  }
};

/**
 * 点赞帖子
 * @param threadId - 帖子 ID
 * @returns 返回点赞操作响应，包含状态码和消息
 * @remarks 调用 /api/thread/like/{threadId} 接口，需要用户登录并提供有效的 token
 * @throws 如果未登录、帖子不存在或服务器错误，会抛出错误
 */
export const likeThread = async (threadId: number): Promise<LikeResponse> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      throw new Error('Please log in to like the thread');
    }

    const response = await fetch(`/api/thread/like/${threadId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data: LikeResponse = await response.json();

    if (response.status === 200 || response.status === 201) {
      return data;
    } else if (response.status === 404) {
      throw new Error(data.message || 'Thread not found');
    } else {
      throw new Error(data.message || 'Internal server error');
    }
  } catch (error) {
    console.error('Failed to like thread:', error);
    throw error;
  }
};

/**
 * 取消点赞帖子
 * @param threadId - 帖子 ID
 * @returns 返回取消点赞操作响应，包含状态码和消息
 * @remarks 调用 /api/thread/unlike/{threadId} 接口，需要用户登录并提供有效的 token
 * @throws 如果未登录、帖子未找到或未点赞，会抛出错误
 */
export const unlikeThread = async (threadId: number): Promise<LikeResponse> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      throw new Error('请先登录以取消点赞');
    }

    const response = await fetch(`/api/thread/unlike/${threadId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data: LikeResponse = await response.json();

    if (response.status === 200) {
      return data;
    } else if (response.status === 404) {
      throw new Error(data.message || '帖子未找到或未点赞');
    } else {
      throw new Error(data.message || '服务器内部错误');
    }
  } catch (error) {
    console.error('取消点赞失败:', error);
    throw error;
  }
};