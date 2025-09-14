/**
 * 获取排行榜前50名数据
 * @returns 返回排行榜数据
 * @remarks 调用代理路径 /api/point/top50
 * @throws 如果获取失败，会返回 null 并记录错误
 */
export const fetchTop50 = async (): Promise<{
  leaderboard: { address: string; total_points: number }[];
} | null> => {
  try {
    const response = await fetch("/api/point/top50", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: { leaderboard: { address: string; total_points: number }[] } =
      await response.json();

    if (response.ok && data.leaderboard) {
      return data;
    }

    throw new Error("Failed to obtain leaderboard information");
  } catch (error) {
    console.error("Error in obtaining leaderboard information:", error);
    return null;
  }
};

/**
 * 获取用户任务完成状态
 * @returns 返回用户任务完成计数
 * @remarks 调用代理路径 /api/point/task
 * @throws 如果获取失败，会返回 null 并记录错误
 */
export const fetchUserTasks = async (): Promise<{
  count: { like: number; reply: number; retweet: number; post: number };
  is_flowing: boolean;
} | null> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch("/api/point/task", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data: {
      count: { like: number; reply: number; retweet: number; post: number };
      is_flowing: boolean;
    } = await response.json();

    if (response.ok && data.count) {
      return data;
    }

    throw new Error("Failed to obtain task information");
  } catch (error) {
    console.error("Error in obtaining task information:", error);
    return null;
  }
};

/**
 * 获取用户积分信息
 * @returns 返回用户积分相关数据
 * @remarks 调用代理路径 /api/point/user
 * @throws 如果获取失败，会返回 null 并记录错误
 */
export const fetchUserPoints = async (): Promise<{
  expansion_factor: number;
  invite_points: number;
  michelin_points: number;
  rank: number;
  task_points: number;
  total_points: number;
  trade_points: number;
} | null> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch("/api/point/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data: {
      expansion_factor: number;
      invite_points: number;
      michelin_points: number;
      rank: number;
      task_points: number;
      total_points: number;
      trade_points: number;
    } = await response.json();

    if (response.ok && data.total_points !== undefined) {
      return data;
    }

    throw new Error("Failed to obtain user points information");
  } catch (error) {
    console.error("Error in obtaining user points information:", error);
    return null;
  }
};
/**
 * Check Twitter follower status
 * @returns Returns true if successful, false otherwise
 * @remarks Calls proxy path /api/point/check_twitter_follower using POST method
 * @throws Returns false and logs error if request fails
 */
export const checkTwitterFollower = async (): Promise<boolean> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch("/api/point/check_twitter_follower", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      return true;
    }

    throw new Error("Failed to check Twitter follower status");
  } catch (error) {
    console.error("Error in checking Twitter follower status:", error);
    return false;
  }
};

/**
 * 获取最新推文数据
 * @returns 返回最新10条推文数据
 * @remarks 调用代理路径 /api/twitter/latest-tweets
 * @throws 如果获取失败，会返回 null 并记录错误
 */
export const fetchLatestTweets = async (): Promise<{
  code: number;
  data: {
    bookmark_count: number;
    category: string;
    content: string;
    created_at: string;
    event_at: string;
    impression_count: number;
    like_count: number;
    quote_count: number;
    reply_count: number;
    retweet_count: number;
    tweet_id: number;
    tweet_url: string;
    twitter_screen_name: string;
    twitter_user_id: string;
  }[];
} | null> => {
  try {
    const response = await fetch("/twitter/latest-tweets", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: {
      code: number;
      data: {
        bookmark_count: number;
        category: string;
        content: string;
        created_at: string;
        event_at: string;
        impression_count: number;
        like_count: number;
        quote_count: number;
        reply_count: number;
        retweet_count: number;
        tweet_id: number;
        tweet_url: string;
        twitter_screen_name: string;
        twitter_user_id: string;
      }[];
    } = await response.json();

    if (response.ok && data.code === 200 && data.data) {
      return data;
    }

    throw new Error("Failed to obtain latest tweets");
  } catch (error) {
    console.error("Error in obtaining latest tweets:", error);
    return null;
  }
};

/**
 * 获取相关推文链接
 * @returns 返回相关推文链接列表
 * @remarks 调用代理路径 /api/related_tweets
 * @throws 如果获取失败，会返回 null 并记录错误
 */
export const fetchRelatedTweets = async (): Promise<{
  code: number;
  data: string[];
} | null> => {
  try {
    const response = await fetch("/api/related_tweets", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: {
      code: number;
      data: string[];
    } = await response.json();

    if (response.ok && data.code === 200 && data.data) {
      return data;
    }

    throw new Error("Failed to obtain related tweets");
  } catch (error) {
    console.error("Error in obtaining related tweets:", error);
    return null;
  }
};
