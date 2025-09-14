import { Messages } from "@/config";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { createTranslator } from "next-intl";

// 扩展 duration 插件
dayjs.extend(duration);

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const shortenAddress = (address: string) => {
  return address.slice(0, 4) + "..." + address.slice(-4);
};
export type Locale = keyof typeof Messages;

export const formatTimeAgo = (timestamp: string, locale: Locale): string => {
  const t = createTranslator({
    locale,
    messages: Messages[locale],
    namespace: "Common.time",
  });

  // 将 UTC 时间字符串转换为 UTC 时间戳（秒）
  const timestampSeconds = Math.floor(Date.parse(timestamp) / 1000);

  // 获取当前 UTC 时间（秒）
  const now = Math.floor(Date.now() / 1000);
  const diffSeconds = now - timestampSeconds;

  if (isNaN(timestampSeconds)) {
    return "N/A";
  }
  if (diffSeconds < 0) return t("future");
  if (diffSeconds < 10) return t("justNow");
  if (diffSeconds < 30) return t("fewSeconds");

  const units: Array<[string, number]> = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, seconds] of units) {
    const interval = Math.floor(diffSeconds / seconds);
    if (interval >= 1) {
      return t(`units.${unit}`, { count: interval });
    }
  }

  return t("underMinute");
};

export const formatFinancialValue = (value: string | number, type: string) => {
  if (type === "duration") return { display: value, color: "text-gray-300" };

  const numericValue =
    typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.-]/g, ""))
      : Number(value);

  if (type === "balance")
    return {
      display: `$${Math.abs(numericValue).toFixed(2)}`,
      color: "text-green-400",
    };

  if (numericValue > 0) {
    return {
      display: `+$${Math.abs(numericValue).toFixed(2)}`,
      color: "text-green-400",
    };
  }
  if (numericValue < 0) {
    return {
      display: `-$${Math.abs(numericValue).toFixed(2)}`,
      color: "text-red-400",
    };
  }
  return {
    display: `$${numericValue.toFixed(2)}`,
    color: "text-gray-300",
  };
};

export function compactNumber(number: string | number, digits: number = 2) {
  let num = 0;
  if (typeof number === "string") {
    const value = Number(number);
    if (isNaN(value)) {
      return number;
    }
    num = value;
  } else {
    num = number;
  }
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
  const item = lookup.findLast((item) => num >= item.value);
  return item
    ? (num / item.value).toFixed(digits).replace(regexp, "").concat(item.symbol)
    : num.toFixed(digits).replace(regexp, "");
}

export function formatQuantity(balance: string | number) {
  let num = 0;
  if (typeof balance === "string") {
    const value = Number(balance);
    if (isNaN(value)) {
      return "0";
    }
    num = value;
  } else {
    num = balance;
  }

  if (num > 1) {
    return compactNumber(num, 2);
  } else if (num < 0) {
    return `-${compactNumber(Math.abs(num), 2)}`;
  } else {
    return shitNumber(num);
  }
}
export function shitNumber(
  number: string | number,
  tailValidNumberCount: number = 4,
  limitZeroCount: number = 4
) {
  let num = 0;
  if (typeof number === "string") {
    const value = Number(number);
    if (isNaN(value)) {
      return "0";
    }
    num = value;
  } else {
    num = number;
  }

  if (num > 1) {
    return num.toFixed(2).replace(/\.0+$|(?<=\.[0-9]*[1-9])0+$/, "");
  } else {
    const numStr = num.toString();
    const matchGroups = numStr.match(/(\d)\.(\d+)[e|E]-(\d+)/);
    if (matchGroups && matchGroups.length === 4) {
      //scientist number
      let tail = matchGroups[1] + matchGroups[2];
      if (tail.length > tailValidNumberCount) {
        tail = tail.substring(0, tailValidNumberCount);
      }
      let fixStr = "0." + "0".repeat(Number(matchGroups[3]) - 1) + tail;
      if (Number(matchGroups[3]) - 1 > limitZeroCount) {
        fixStr = "0.0" + `{${Number(matchGroups[3]) - 1}}` + tail;
      }
      return fixStr.replace(/\.0+$|(?<=\.[0-9]*[1-9])0+$/, "");
    } else {
      const matchGroups = numStr.match(/0\.(0+)([1-9]+)/);
      if (matchGroups && matchGroups.length === 3) {
        const zeroCount = matchGroups[1].length;
        let tail = matchGroups[2];
        if (tail.length > tailValidNumberCount) {
          tail = tail.substring(0, tailValidNumberCount);
        }
        let fixStr = "0." + "0".repeat(zeroCount) + tail;
        if (zeroCount > limitZeroCount) {
          fixStr = "0.0" + `{${zeroCount}}` + tail;
        }
        return fixStr.replace(/\.0+$|(?<=\.[0-9]*[1-9])0+$/, "");
      } else {
        return num
          .toFixed(tailValidNumberCount)
          .replace(/\.0+$|(?<=\.[0-9]*[1-9])0+$/, "");
      }
    }
  }
}
// 处理将来的时间 变为 **d**h**m**s 后续优化为**d**h 或者**h**m 或者 **m**s
export const formatTimeFuture = (target: string): string => {
  const now = dayjs();
  const end = dayjs(target);

  // 处理过去时间的情况
  if (end.isBefore(now)) return "0s";

  const timeDiff = end.diff(now);
  const duration = dayjs.duration(timeDiff);

  // 分解时间部分
  const parts: TimeParts = {
    days: duration.days(),
    hours: duration.hours(),
    minutes: duration.minutes(),
    seconds: duration.seconds(),
  };

  // 构建格式化字符串
  return [
    parts.days > 0 ? `${parts.days}d` : "",
    parts.hours > 0 ? `${parts.hours}h` : "",
    parts.minutes > 0 ? `${parts.minutes}m` : "",
    `${parts.seconds}s`, // 秒始终显示
  ]
    .filter(Boolean)
    .join("");
};

export const formatWithUnits = (pastTime: string): string => {
  const elapsed = dayjs.duration(dayjs().diff(pastTime));

  const totalDays = Math.floor(Math.abs(elapsed.asDays()));

  const remainingDuration = dayjs.duration({
    hours: Math.abs(elapsed.hours()),
    minutes: Math.abs(elapsed.minutes()),
    seconds: Math.abs(elapsed.seconds()),
  });

  const units = [
    { value: totalDays, suffix: "d" },
    { value: remainingDuration.hours(), suffix: "h" },
    { value: remainingDuration.minutes(), suffix: "m" },
    { value: remainingDuration.seconds(), suffix: "s" },
  ];

  let shouldShow = false;
  return units
    .map(({ value, suffix }, index) => {
      if (value > 0 || index === units.length - 1) shouldShow = true;
      return shouldShow ? `${value}${suffix}` : null;
    })
    .filter(Boolean)
    .join("");
};

export const calculateRemainingTime = (
  eventTime: Date
): {
  h?: string;
  m?: string;
  s?: string;
} | null => {
  const now = new Date().getTime();
  const eventTimestamp = eventTime.getTime();

  if (eventTimestamp <= now) {
    throw new Error("传入的时间必须是未来时间");
  }

  const diff = eventTimestamp - now;
  const oneHourMs = 60 * 60 * 1000;

  if (diff > 100 * oneHourMs) {
    return null;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const padZero = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  return {
    h: padZero(hours),
    m: padZero(minutes),
    s: padZero(seconds),
  };
};

/**
 * 生成指定时间范围内的随机未来时间
 * @param minHours 最小小时数（默认1小时）
 * @param maxHours 最大小时数（默认100小时）
 * @returns 随机未来时间的Date对象
 */
export const generateRandomFutureTime = (
  minHours: number = 1,
  maxHours: number = 100
): Date => {
  if (minHours < 0 || maxHours < minHours || maxHours > 100) {
    throw new Error("时间范围必须为 0 < 最小小时数 ≤ 最大小时数 ≤ 100");
  }

  // 转换为毫秒
  const minMs = minHours * 60 * 60 * 1000;
  const maxMs = maxHours * 60 * 60 * 1000;

  // 生成随机时间差（包含最小值，不包含最大值）
  const randomMs = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

  // 返回随机未来时间
  return new Date(Date.now() + randomMs);
};
