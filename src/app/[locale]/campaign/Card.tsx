"use client";

import { Link } from "@/i18n/navigation";
import { cn } from "@heroui/react";
import moment from "moment";
import Image from "next/image";

interface LinkOrNotProps {
  href?: string;
  children: React.ReactNode;
}

function LinkOrNot({ href, children }: LinkOrNotProps) {
  return href ? <Link href={href}>{children}</Link> : <>{children}</>;
}

interface CardProps {
  name: string;
  imageUrl: string;
  href?: string;
  startTime?: string;
  endTime?: string;
  status?: "coming soon" | "ongoing" | "ended";
}

export default function Card({
  name,
  imageUrl,
  href,
  startTime,
  endTime,
  status,
}: CardProps) {
  return (
    <div
      className={cn(
        "max-sm:w-full max-sm:h-auto h-[280px] w-[315px] relative",
        "hover:shadow-xl hover:shadow-[#FF8DF733]",
        {
          "border-1 border-[#FF8DF74D] hover:border-[#FF8DF7]":
            status != "ended",
        }
      )}
    >
      <div
        className={cn("absolute top-0 right-0 px-1.5", {
          "bg-[#1AE371]": status !== "ended",
          "bg-[#FA2256]": status === "ended",
        })}
      >
        <span className="text-black font-jersey25Regular text-sm uppercase">
          {status}
        </span>
      </div>
      <LinkOrNot href={href}>
        <div className="w-[313px] max-sm:w-full max-sm:h-auto h-[189px] overflow-hidden">
          <Image
            src={imageUrl}
            width={315}
            height={189}
            alt={name}
            className="w-full h-full object-contain"
          />
        </div>
      </LinkOrNot>
      <div className="p-4">
        <p className="font-jersey25Regular text-lg">
          <LinkOrNot href={href}>{name}</LinkOrNot>
        </p>
        <p className="text-sm font-cofo text-[#9F9B9F]">
          {endTime ? (
            <>
              <span>{`${moment(startTime).utc().format("MMM DD HH:mm")}`}</span>
              <span> UTC - </span>
              <span>{`${moment(endTime).utc().format("MMM DD HH:mm")}`}</span>
              <span> UTC</span>
            </>
          ) : (
            <>
              <span className="uppercase">starting time: </span>
              <span>
                {`${moment(startTime).utc().format("MMM DD HH:mm")}`} UTC
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
