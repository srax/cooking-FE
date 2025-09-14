import { formatQuantity } from "@/utils";
import moment from "moment";
import { TradingCompetitionSchema } from "./types";

export default function Rule({ event }: { event: TradingCompetitionSchema }) {
  console.log(event, "event");

  const titleClass = "self-stretch text-[#FFF]  text-lg";
  const contentClass =
    "text-sm font-cofo text-[#9F9B9F] mt-3 mb-4 leading-normal";

  return (
    <div className="relative max-w-screen-lg mx-auto">
      <div className="w-full absolute top-0 left-0 inset-0 rounded-full bg-[#492513] opacity-70 blur-[50px]"></div>
      <div className="border relative border-[#332231] bg-[#130511]/90 py-6 px-8 my-10 text-white z-10">
        <div className={titleClass}>Event time</div>
        <div className={contentClass}>
          <span>{`${moment(event.start_at)
            .utc()
            .format("MMM DD HH:mm")}`}</span>
          <span> UTC - </span>
          <span>{`${moment(event.end_at || "")
            .utc()
            .format("MMM DD HH:mm")}`}</span>
          <span> UTC</span>
        </div>

        <div className={titleClass}>Allocation</div>
        <div className={`${contentClass} flex flex-col gap-2`}>
          <p>🥇: {formatQuantity(event.allocation_1st) || "0"} SOL</p>
          <p>🥈: {formatQuantity(event.allocation_2nd) || "0"} SOL</p>
          <p>🥉: {formatQuantity(event.allocation_3rd) || "0"} SOL</p>
          <p>4th: {formatQuantity(event.allocation_4th) || "0"} SOL</p>
          <p>5th: {formatQuantity(event.allocation_5th) || "0"} SOL</p>
          <p>
            No.6 - No.20: {formatQuantity(event.allocation_6th_20th) || "0"} SOL
          </p>
          <p>
            The rest:{" "}
            {formatQuantity(
              (event.prize_pool_sol || 0) -
                ((parseFloat(event.allocation_1st) || 0) +
                  (parseFloat(event.allocation_2nd) || 0) +
                  (parseFloat(event.allocation_3rd) || 0) +
                  (parseFloat(event.allocation_4th) || 0) +
                  (parseFloat(event.allocation_5th) || 0) +
                  (parseFloat(event.allocation_6th_20th) || 0) * 15)
            ) || "0"}{" "}
            SOL{" "}
            <span className="uppercase">
              ({event.allocation_rest_method || "N/A"})
            </span>
          </p>
        </div>

        {event.rich_text_content ? (
          <div
            className={` rich-text-content`}
            dangerouslySetInnerHTML={{ __html: event.rich_text_content }}
          />
        ) : (
          <>
            <div className={titleClass}>How to join</div>
            <div className={`${contentClass} flex flex-col gap-2`}>
              <p>· Connect wallet on CookingCity</p>
              <p>· Then your trading volume starts to count</p>
            </div>

            <div className={titleClass}>How to claim the prize</div>
            <div className={`${contentClass} flex flex-col gap-2`}>
              <p>
                · The rankings and rewards will be announced within 24 hours
                after the event ends.
              </p>
              <p>· Rewards should be claimed manually in the event page.</p>
              <p>
                · Rewards must be claimed within 15 days, otherwise they will
                expire.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
