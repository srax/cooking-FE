import { getTokenDetail, TokenDetailResponse } from "@/api/token";
import type {
  Bar,
  ErrorCallback,
  HistoryCallback,
  IBasicDataFeed,
  LibrarySymbolInfo,
  OnReadyCallback,
  PeriodParams,
  ResolutionString,
  ResolveCallback,
  SearchSymbolsCallback,
  SubscribeBarsCallback,
} from "../../../charting_library/charting_library";
import { intervalMap } from "./options";

export class GeckoTerminalDataFeed implements IBasicDataFeed {
  private _tokenAddress: string;
  private _intervals: { [key: string]: NodeJS.Timeout } = {};
  private _offset: number = 0;
  private _bars = [] as Bar[];

  constructor(tokenAddress: string) {
    this._tokenAddress = tokenAddress;
  }

  searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResult: SearchSymbolsCallback
  ): void {
    onResult([]);
  }

  resolveSymbol(
    symbolName: string,
    onResolve: ResolveCallback,
    onError: ErrorCallback
  ): void {
    getTokenDetail(this._tokenAddress)
      .then((r: TokenDetailResponse) => {
        if (r.error || !r.data) {
          onError(r.error ?? "Error fetching token info");
          return;
        }
        const pricescale = 1000000000;
        const symbolInfo: LibrarySymbolInfo = {
          name: symbolName,
          full_name: symbolName,
          description: `Price`,
          listed_exchange: "",
          format: "price",
          type: "crypto",
          session: "24x7",
          timezone: "Asia/Shanghai",
          exchange: "",
          minmov: 1,
          pricescale: pricescale,
          has_intraday: true,
          has_empty_bars: false,
          has_weekly_and_monthly: true,
          has_daily: true,
          supported_resolutions: Object.keys(intervalMap) as ResolutionString[],
          data_status: "streaming",
          ticker: r.data.symbol,
          base_name: [r.data.symbol],
          currency_code: "USD",
        };
        onResolve(symbolInfo);
      })
      .catch((error) => {
        console.error("Resolve error:", error);
        onError(error instanceof Error ? error.message : "Unknown error");
      });
  }

  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
    onError: ErrorCallback
  ): void {
    const limit = periodParams.countBack > 1000 ? 1000 : periodParams.countBack;
    const from = periodParams.from * 1000;
    const to = periodParams.to * 1000;

    fetch(
      `https://datapi.jup.ag/v2/charts/${this._tokenAddress}?interval=${intervalMap[resolution]}&candles=${limit}&from=${from}&to=${to}&type=price`,
      {
        method: "GET",
        redirect: "follow",
      }
    )
      .then((response) => response.json())
      .then(
        (r: {
          candles: {
            time: number;
            open: number;
            high: number;
            low: number;
            close: number;
            volume: number;
          }[];
        }) => {
          const bars: Bar[] = (r?.candles || [])
            .map((bar) => {
              const validPrice = (price: number) => !isNaN(price) && price >= 0;
              if (
                !validPrice(bar.close) ||
                !validPrice(bar.high) ||
                !validPrice(bar.low) ||
                !validPrice(bar.open) ||
                !validPrice(bar.volume)
              ) {
                console.warn("Invalid bar data detected:", bar);
                return null;
              }
              return {
                time: bar.time * 1000,
                close: bar.close,
                high: bar.high,
                low: bar.low,
                open: bar.open,
                volume: bar.volume,
              } as Bar;
            })
            .filter((bar): bar is Bar => bar !== null); // 调整类型断言

          this._offset = bars.length;
          this._bars = bars;
          console.log("Processed bars:", bars);

          onResult(bars, { noData: bars.length === 0 });
        }
      )
      .catch((error) => {
        console.error("GetBars error:", error);
        onError(error instanceof Error ? error.message : "Unknown error");
      });
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void
  ): void {
    if (this._intervals[listenerGuid]) {
      clearInterval(this._intervals[listenerGuid]);
      delete this._intervals[listenerGuid];
      console.log(`Cleared previous interval for listener: ${listenerGuid}`);
    }

    onResetCacheNeededCallback();
    let lastRequestTimestamp = Date.now();
    const interval = setInterval(() => {
      const limit = 5;
      const lastBar = this._bars[this._bars.length - 1];
      const periodSeconds =
        parseInt(intervalMap[resolution].replace(/[mhD]/, "")) *
        (intervalMap[resolution].endsWith("m")
          ? 60
          : intervalMap[resolution].endsWith("h")
          ? 3600
          : 86400);
      const from = lastRequestTimestamp;
      const to = lastRequestTimestamp + periodSeconds * 1000;
      lastRequestTimestamp = to;

      fetch(
        `https://datapi.jup.ag/v2/charts/${this._tokenAddress}?interval=${intervalMap[resolution]}&candles=${limit}&from=${from}&to=${to}&type=price`,
        {
          method: "GET",
          redirect: "follow",
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`kline error: ${response.status}`);
          }
          return response.json();
        })
        .then(
          (r: {
            candles: {
              time: number;
              open: number;
              high: number;
              low: number;
              close: number;
              volume: number;
            }[];
          }) => {
            const bars: Bar[] = (r?.candles || [])
              .map((bar) => {
                const validPrice = (price: number) =>
                  !isNaN(price) && price >= 0;
                if (
                  !validPrice(bar.close) ||
                  !validPrice(bar.high) ||
                  !validPrice(bar.low) ||
                  !validPrice(bar.open) ||
                  !validPrice(bar.volume)
                ) {
                  console.warn("Invalid price or volume data detected:", bar);
                  return null;
                }
                return {
                  time: bar.time * 1000,
                  close: bar.close,
                  high: bar.high,
                  low: bar.low,
                  open: bar.open,
                  volume: bar.volume,
                } as Bar;
              })
              .filter((bar): bar is Bar => bar !== null); // 调整类型断言

            bars.forEach((bar: Bar) => {
              const existingBarIndex = this._bars.findIndex(
                (b) => b.time === bar.time
              );
              if (existingBarIndex >= 0) {
                const existingBar = this._bars[existingBarIndex];
                const updatedBar: Bar = {
                  time: existingBar.time,
                  open: existingBar.open,
                  high: Math.max(existingBar.high, bar.high),
                  low: Math.min(existingBar.low, bar.low),
                  close: bar.close,
                  volume: bar.volume,
                };
                this._bars[existingBarIndex] = updatedBar;
                onTick(updatedBar);
              } else if (!lastBar || bar.time > lastBar.time) {
                console.log(
                  "Last bar time:",
                  lastBar?.time,
                  "New bar time:",
                  bar.time
                );
                this._bars = [...this._bars, bar].sort(
                  (a, b) => a.time - b.time
                );
                console.log("Adding new bar:", bar);
                onTick(bar);
              } else {
                console.log("Skipped bar with earlier time:", bar.time);
              }
            });

            if (bars.length === 0) {
              console.log("No new bars received from API");
            }
          }
        )
        .catch((error) => {
          console.error("Error fetching latest K-line data:", error);
        });
    }, 5000);

    this._intervals[listenerGuid] = interval;
  }

  unsubscribeBars(listenerGuid: string): void {
    if (this._intervals[listenerGuid]) {
      clearInterval(this._intervals[listenerGuid]);
      delete this._intervals[listenerGuid];
    }
  }

  clearAllIntervals(): void {
    Object.keys(this._intervals).forEach((listenerGuid) => {
      clearInterval(this._intervals[listenerGuid]);
      delete this._intervals[listenerGuid];
      console.log(`Cleared interval for listener: ${listenerGuid}`);
    });
  }

  onReady(callback: OnReadyCallback): void {
    setTimeout(() =>
      callback({
        supported_resolutions: Object.keys(intervalMap) as ResolutionString[],
      })
    );
  }
}
