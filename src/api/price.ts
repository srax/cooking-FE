/**
 * 获取基础价格信息
 * @param token - 用户认证令牌
 * @returns 返回价格数据（solusdt），或 null
 * @remarks 调用代理路径 /api/price/sol
 * @throws 如果获取失败，会返回 null 并记录错误
 */
export const fetchBasePrice = async (): Promise<{ solusdt: number } | null> => {
  try {
    const response = await fetch("/api/price/sol", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: { quote_time: string; usd: string } = await response.json();

    if (response.ok && data.usd) {
      return { solusdt: parseFloat(data.usd) };
    }

    throw new Error("Failed to obtain price information");
  } catch (error) {
    console.error("Error in obtaining basic price information:", error);
    return null;
  }
};
