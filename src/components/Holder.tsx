"use client";

import { shortenAddress } from "@/utils";
import { addToast } from "@heroui/react";
import {
  Connection,
  PublicKey,
  TokenAccountBalancePair,
} from "@solana/web3.js";
import Bignumber from "bignumber.js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CiShare1 } from "react-icons/ci";
import { MdOutlinePeopleOutline } from "react-icons/md";

interface HolderProps {
  address: string;
}

interface HolderInfo extends TokenAccountBalancePair {
  owner?: string;
}

export default function Holder({ address }: HolderProps) {
  const [loading, setLoading] = useState(false);
  const [holders, setHolders] = useState<HolderInfo[]>([]);
  const [tokenSupply, setTokenSupply] = useState<string>("0");

  const fetchHolders = async () => {
    if (!address) return;

    try {
      setLoading(true);
      const connection = new Connection(
        process.env.NEXT_PUBLIC_IS_DEV === "false"
          ? process.env.NEXT_PUBLIC_RPC_URL ||
            "https://api.mainnet-beta.solana.com"
          : process.env.NEXT_PUBLIC_DEV_RPC_URL || "",
        "confirmed"
      );
      const mintPublicKey = new PublicKey(address);

      const largestAccounts = await connection.getTokenLargestAccounts(
        mintPublicKey
      );
      const tokenSupply = await connection.getTokenSupply(mintPublicKey);
      setTokenSupply(tokenSupply.value.uiAmountString || "0");
      const filterData = largestAccounts.value.filter(
        (i) => Number(i.amount) > 0
      );

      const holdersWithOwners = await Promise.all(
        filterData.map(async (account) => {
          try {
            const accountInfo = await connection.getAccountInfo(
              account.address
            );
            if (accountInfo) {
              const owner = new PublicKey(
                accountInfo.data.slice(32, 64)
              ).toBase58();
              return { ...account, owner };
            }
            return { ...account, owner: "Unknown" };
          } catch (error) {
            console.error(
              `Error fetching owner for account ${account.address.toBase58()}:`,
              error
            );
            return { ...account, owner: "Unknown" };
          }
        })
      );

      setHolders(holdersWithOwners);
    } catch (error) {
      console.error("Failed to fetch holders:", error);
      setHolders([]);
      addToast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch holders",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolders();

    const interval = setInterval(() => {
      fetchHolders();
    }, 5000);

    return () => clearInterval(interval);
  }, [address]);

  return (
    <div
      className="border-none bg-transparent"
      role="region"
      aria-label="holder distribution"
    >
      <div className="flex justify-between">
        <p className="text-[18px] text-white uppercase">Holder Distribution</p>
        <div className="font-cofo text-[#1AE371] flex justify-between items-center">
          <MdOutlinePeopleOutline className="w-5 h-5" />
          <p className="font-cofo text-sm">{holders.length} holders</p>
        </div>
      </div>
      <div className="w-full h-[1px] bg-[#30212e] mt-3"></div>
      <div className="mt-4">
        {holders.map((holder, index) => (
          <div
            key={holder?.address?.toBase58()}
            className="flex items-center justify-between text-xs mb-6"
          >
            <div className="flex items-center gap-2 truncate font-cofo">
              <span>{index + 1}.</span>
              <span className="truncate">
                {shortenAddress(
                  holder?.owner || holder?.address?.toBase58() || ""
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>
                {new Bignumber(holder.uiAmount || 0)
                  .div(tokenSupply)
                  .times(100)
                  .toFixed(2)}
                %
              </span>
              <Link
                href={`https://solscan.io/account/${
                  holder?.owner || holder?.address?.toBase58() || ""
                }`}
                target="_blank"
                className="text-gray-400"
              >
                <CiShare1 />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
