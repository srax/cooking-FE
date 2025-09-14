import {
  ResolutionString,
  TimeFrameItem,
} from "../../../charting_library/charting_library/charting_library";

export const timeFrameOptions: TimeFrameItem[] = [
  { text: "1h", resolution: "1" as ResolutionString, title: "1H" },
  { text: "1d", resolution: "5" as ResolutionString, title: "1D" },
  { text: "5d", resolution: "1H" as ResolutionString, title: "5D" },
  // { "text": "1m", "resolution": "1D" as ResolutionString, title: "1M" },
  // { "text": "3m", "resolution": "1D" as ResolutionString, title: "3M" },
];

export const intervalMap: { [key: string]: string } = {
  "1": "1_MINUTE",
  "5": "5_MINUTE",
  "15": "15_MINUTE",
  "60": "1_HOUR",
  // '4H': '4h',
  "1D": "1_DAY",
};
