import React, { useEffect, useState } from "react";

// 容错处理函数：如果字段为空，返回 '-'
const safeFormat = (value: any, formatter?: (val: any) => string) => {
  if (value === undefined || value === null || value === "") return "-";
  return formatter ? formatter(value) : value;
};

// 计算倒计时并格式化
const calculateCountdown = (
  graduationTime: string,
  preciseMode: boolean = false
) => {
  // 将 UTC 时间字符串解析为 Date 对象
  const targetDate = new Date(graduationTime); // 追加 'Z' 表示 UTC 时间
  if (isNaN(targetDate.getTime())) return "-"; // 如果日期无效，返回 '-'

  // TODO: 根据测试调整时间
  // 加上 5 天
  targetDate.setUTCDate(targetDate.getUTCDate() + 5);

  // 加上 30 分钟
  // targetDate.setUTCMinutes(targetDate.getUTCMinutes() + 20);

  // 获取当前时间
  const now = new Date();
  const timeDiff = targetDate.getTime() - now.getTime();

  // 如果时间已过去，返回 'Expired'
  if (timeDiff <= 0) return "Expired";

  // 计算天、小时、分钟、秒
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  if (preciseMode) {
    // 精确模式：格式为 03d : 22h : 12m : 33s
    return `${days.toString().padStart(2, "0")}d : ${hours
      .toString()
      .padStart(2, "0")}h : ${minutes.toString().padStart(2, "0")}m : ${seconds
      .toString()
      .padStart(2, "0")}s`;
  }

  // 默认模式：格式为 X days Y hours left
  let countdown = "";
  if (days > 0) countdown += `${days} days `;
  if (hours > 0 || days > 0) countdown += `${hours} hours `;
  countdown += "left";

  return countdown.trim();
};

// 定义组件 props 类型
interface CountdownProps {
  graduationTime?: string;
  textColor?: string;
  fontSize?: string;
  preciseMode?: boolean; // 新增精确模式属性
}

// 倒计时组件
const CountdownComponent: React.FC<CountdownProps> = ({
  graduationTime,
  textColor = "rgba(255, 255, 255, 0.4)",
  fontSize = "0.75rem",
  preciseMode = false, // 默认使用原模式
}) => {
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    // 初始计算倒计时
    const updateCountdown = () => {
      const result = safeFormat(graduationTime, (time) =>
        calculateCountdown(time, preciseMode)
      );
      setCountdown(result);
    };

    // 立即更新一次
    updateCountdown();

    // 如果 graduationTime 存在，设置定时器每秒更新（精确模式需要秒级更新）
    if (graduationTime) {
      const interval = setInterval(
        updateCountdown,
        preciseMode ? 1000 : 60 * 1000
      ); // 精确模式每秒更新，默认模式每分钟更新
      return () => clearInterval(interval); // 清理定时器
    }
  }, [graduationTime, preciseMode]);

  return (
    <p
      className="mt-1"
      style={{
        color: textColor,
        fontSize: fontSize,
      }}
    >
      {countdown !== null ? countdown : "-"}
    </p>
  );
};

export default CountdownComponent;
