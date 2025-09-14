"use client";

import Image from "next/image";

const RANK_IMAGES = [
  "/images/campaign/2147227481.png",
  "/images/campaign/2147227460.png",
  "/images/campaign/2147227482.png",
];

interface RankCellProps {
  rank: number;
}

export default function RankCell({ rank }: RankCellProps) {
  // Early return for invalid ranks
  if (!rank) {
    return <div className="w-10 font-cofo pl-1">-</div>;
  }

  const hasRankImage = rank <= RANK_IMAGES.length;

  if (hasRankImage) {
    return (
      <div className="w-10">
        <Image
          src={RANK_IMAGES[rank - 1]}
          alt={`Rank ${rank}`}
          width={28}
          height={28}
        />
      </div>
    );
  }

  const rankDisplay = rank.toString().padStart(2, "0");

  return <div className="w-10 font-cofo pl-1">{rankDisplay}</div>;
}
