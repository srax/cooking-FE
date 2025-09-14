import { cn } from "@heroui/react";

interface EventTimeProps {
  classname?: string;
  startTime: string;
  endTime?: string;
  status?: string;
}

export default function EventTime({
  classname,
  startTime,
  endTime,
  status,
}: EventTimeProps) {
  // 如果状态是ended，显示ENDED
  if (status === "ended") {
    return (
      <div
        className={cn(
          "bg-[#FA2256] font-cofo rounded-full text-sm py-0.5 px-2 text-white uppercase",
          classname
        )}
      >
        ENDED
      </div>
    );
  }
  // 格式化时间字符串为 "JUL 19" 格式
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return null;
      }
      const month = date
        .toLocaleDateString("en-US", { month: "short" })
        .toUpperCase();
      const day = date.getDate();
      return `${month} ${day}`;
    } catch (error) {
      // 如果解析失败，返回null
      return null;
    }
  };

  const formatTimeText = () => {
    const formattedStartTime = formatTime(startTime);

    // 如果开始时间无效，返回null（不显示组件）
    if (!formattedStartTime) {
      return null;
    }

    if (endTime) {
      const formattedEndTime = formatTime(endTime);
      // 如果结束时间无效，只显示开始时间
      if (!formattedEndTime) {
        return `Start: ${formattedStartTime}`;
      }
      return `Time: ${formattedStartTime} - ${formattedEndTime}`;
    }

    return `Start: ${formattedStartTime}`;
  };

  const timeText = formatTimeText();

  // 如果时间文本为null，不渲染组件
  if (!timeText) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-[#FF8DF7] font-cofo rounded-full text-sm py-0.5 px-2 text-black uppercase",
        classname
      )}
    >
      {timeText}
    </div>
  );
}
