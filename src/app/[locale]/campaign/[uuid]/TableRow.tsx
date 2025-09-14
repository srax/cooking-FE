"use client";

import { claimCompetitionReward } from "@/api/competition";
import FancyButton from "@/components/FancyButton";
import { formatQuantity, shortenAddress } from "@/utils";
import { Avatar, cn } from "@heroui/react";
import Image from "next/image";
import { useState } from "react";
import RankCell from "./RankCell";

interface TableRowProps {
  rank: number;
  address?: string;
  avatar?: string;
  tradingVolume: number;
  reward?: number;
  classname?: string;
  labelChildren?: React.ReactNode;
  highlight?: boolean;
  competitionUuid?: string;
  claimed?: boolean; // 是否已领取奖励
}

export default function TableRow({
  rank,
  address,
  avatar,
  tradingVolume,
  reward,
  classname,
  labelChildren,
  highlight = false,
  competitionUuid,
  claimed = false, // 默认未领取奖励
}: TableRowProps) {
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const hasReward = !!reward;

  // Check if current user can claim reward
  const canClaimReward = highlight && reward && reward > 0 && competitionUuid;

  const handleClaimReward = async () => {
    if (!competitionUuid || !canClaimReward) return;

    try {
      setIsClaimingReward(true);

      // Call claim reward API
      const claimResponse = await claimCompetitionReward(competitionUuid);

      // If the request was successful (code 200), we should have data
      if (claimResponse.code === 200) {
        if (!claimResponse.data) {
          console.error("Success response but no data field");
          throw new Error("Success response but no data received");
        }

        // Show success message with transaction details
        const message =
          claimResponse.data.message || "Reward claimed successfully";
        const amount = claimResponse.data.reward_amount || "Unknown";
        const txHash = claimResponse.data.tx_hash || "No transaction hash";

        if (typeof window !== "undefined") {
          alert(`${message}\nReward: ${amount} SOL\nTransaction: ${txHash}`);
        }

        // Trigger page refresh after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        // If code is not 200, it's an error
        throw new Error(claimResponse.message || "Failed to claim reward");
      }
    } catch (error) {
      console.error("Failed to claim reward:", error);

      // Display error message
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (typeof window !== "undefined") {
        alert(`Failed to claim reward: ${errorMessage}`);
      }
    } finally {
      setIsClaimingReward(false);
      // Reset status to allow retry
    }
  };

  return (
    <div
      className={cn(
        "grid gap-2 min-h-[48px] py-2 lg:py-0 items-center px-2",
        hasReward ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2",
        classname
      )}
    >
      <div className="lg:ml-6">
        <div className="flex items-center gap-1">
          <RankCell rank={rank} />
          <div className="flex flex-col gap-1 max-sm:flex-row max-sm:justify-between max-sm:w-full">
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                <Avatar
                  radius="full"
                  name={address ? address[0] : "N/A"}
                  src={avatar}
                  className="w-5 h-5 mr-2 flex-shrink-0"
                />
                <span
                  className={cn(
                    "font-jersey25Regular",
                    highlight ? "text-[#FF8DF7]" : "text-white"
                  )}
                >
                  {shortenAddress(address || "")}
                </span>
              </div>
              {labelChildren}
            </div>
            <div className=" lg:hidden lg:ml-6 text-white font-jersey25Regular">
              {tradingVolume ? `$${formatQuantity(tradingVolume)}` : "-"}
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:ml-6 text-white font-jersey25Regular">
        {tradingVolume ? `$${formatQuantity(tradingVolume)}` : "-"}
      </div>
      {hasReward && (
        <div className="lg:ml-6 text-[#FCD845] font-jersey25Regular justify-self-end lg:justify-self-start w-full pr-6">
          <div className="flex items-center justify-between">
            <span>{reward > 0 ? `${formatQuantity(reward)} Sol` : "-"}</span>
            {canClaimReward ? (
              claimed ? (
                <Image
                  src={"/images/campaign/2147227550.png"}
                  width={83.5}
                  height={29}
                  alt="Claimed"
                />
              ) : (
                <FancyButton
                  buttonText="Claim Reward"
                  height={40}
                  onClick={handleClaimReward}
                  disabled={isClaimingReward}
                />
              )
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
