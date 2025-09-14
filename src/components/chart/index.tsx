"use client";

import { GeckoTerminalDataFeed } from "@/components/chart/datafeed";
import { timeFrameOptions } from "@/components/chart/options";
import React, { memo, useEffect, useRef } from "react";
import {
  LanguageCode,
  ResolutionString,
  TradingTerminalWidgetOptions,
  widget,
} from "../../../charting_library/charting_library";

export interface Props {
  options: Partial<TradingTerminalWidgetOptions>;
  tokenAddress: string;
  height?: string;
  width?: string;
  className?: string;
}

const Chart = memo((props: Props) => {
  const chartContainerRef = useRef<HTMLDivElement>(
    null
  ) as React.MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    const datafeed = new GeckoTerminalDataFeed(props.tokenAddress);
    const widgetOptions: TradingTerminalWidgetOptions = {
      theme: props.options.theme,
      symbol: "loading",
      datafeed: datafeed,
      container: chartContainerRef.current,
      library_path: "/static/charting_library/",
      locale: props.options.locale as LanguageCode,
      disabled_features: [
        "save_chart_properties_to_local_storage",
        ...(props.options.disabled_features ?? [
          "header_symbol_search",
          "header_compare",
          "header_saveload",
          "symbol_info",
          "symbol_info_long_description",
          "symbol_info_price_source",
          "hide_main_series_symbol_from_indicator_legend",
          "open_account_manager",
          "header_undo_redo",
          "volume_force_overlay",
        ]),
      ],
      enabled_features: [
        ...(props.options.enabled_features ?? [
          "hide_resolution_in_legend",
          "scales_time_hours_format",
          "header_fullscreen_button",
          "header_in_fullscreen_mode",
          "header_screenshot",
          "header_resolutions",
          "show_symbol_logos",
        ]),
      ],
      charts_storage_url: props.options.charts_storage_url,
      charts_storage_api_version: props.options.charts_storage_api_version,
      client_id: props.options.client_id,
      user_id: props.options.user_id ?? "public_user_id",
      fullscreen: props.options.fullscreen,
      autosize: props.options.autosize,
      interval: timeFrameOptions[0].resolution,
      timeframe: timeFrameOptions[0].text,
      time_frames: timeFrameOptions,
      timezone: "Asia/Shanghai",
      custom_css_url:
        props.options.theme == "dark" ? "/static/custom.css" : undefined,
      header_widget_buttons_mode: "adaptive",
      overrides: {
        "mainSeriesProperties.style": 1,
        "paneProperties.backgroundType": "solid",
        "paneProperties.background":
          props.options.theme == "dark" ? "#18181A" : undefined,
        volumePaneSize: "medium",
        "volume.options.showLastValue": false,
        "paneProperties.legendProperties.showStudyArguments": false,
        "mainSeriesProperties.candleStyle.upColor": "#1abd81",
        "mainSeriesProperties.candleStyle.downColor": "#FA2256",
        "mainSeriesProperties.candleStyle.drawWick": true,
        "mainSeriesProperties.candleStyle.drawBorder": true,
        "mainSeriesProperties.candleStyle.borderColor": "#1abd81",
        "mainSeriesProperties.candleStyle.borderUpColor": "#1abd81",
        "mainSeriesProperties.candleStyle.borderDownColor": "#FA2256",
      },
      favorites: {
        intervals: ["1", "5", "1h", "1D"] as ResolutionString[],
      },
      custom_formatters: {
        timeFormatter: {
          format: (date) => {
            const _format_str = "%h:%m";
            return _format_str
              .replace("%h", date.getUTCHours().toString().padStart(2, "0"))
              .replace("%m", date.getUTCMinutes().toString().padStart(2, "0"))
              .replace("%s", date.getUTCSeconds().toString().padStart(2, "0"));
          },
          formatLocal: function (date: Date): string {
            return this.format(date);
          },
        },
        dateFormatter: {
          format: (date) => {
            return (
              date.getUTCFullYear() +
              "/" +
              (date.getUTCMonth() + 1) +
              "/" +
              date.getUTCDate()
            );
          },
          formatLocal: function (date: Date): string {
            return this.format(date);
          },
        },
        tickMarkFormatter: (date, tickMarkType) => {
          switch (tickMarkType) {
            case "Year":
              return "Y" + date.getUTCFullYear();
            case "Month":
              return "M" + (date.getUTCMonth() + 1);
            case "DayOfMonth":
              return "D" + date.getUTCDate();
            case "Time":
              return "T" + date.getUTCHours() + ":" + date.getUTCMinutes();
            case "TimeWithSeconds":
              return (
                "S" +
                date.getUTCHours() +
                ":" +
                date.getUTCMinutes() +
                ":" +
                date.getUTCSeconds()
              );
          }
        },
        priceFormatterFactory: () => {
          return {
            format: (price: number) => {
              return price.toFixed(9);
            },
          };
        },
      },
    };
    const tvWidget = new widget(widgetOptions);
    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => {
        console.log("Chart initialized with symbol:", props.tokenAddress);
      });
    });
    return () => {
      datafeed.clearAllIntervals();
      tvWidget.remove();
    };
  }, [props]);

  return (
    <div
      ref={chartContainerRef}
      className={props.className}
      style={{ height: props.height, width: props.width }}
    />
  );
});

export default Chart;
