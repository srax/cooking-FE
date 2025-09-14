"use client";

import {
  getTokenTransactions,
  Request,
  Transaction,
  TransactionsResponse,
} from "@/api/token";
import { formatQuantity, formatTimeAgo, shortenAddress } from "@/utils";
import {
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { RiShareBoxLine } from "react-icons/ri";

interface TransactionsProps {
  address: string;
}

function Transactions({ address }: TransactionsProps) {
  const [hasMore, setHasMore] = useState(true);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getTransactionData = async (queryParams: Request) => {
    setIsLoading(true);
    try {
      const response: TransactionsResponse = await getTokenTransactions(
        queryParams
      );
      if (response.txs && response.txs.length > 0) {
        setTransactionsList(response.txs);
        setHasMore(!!response.next);
      } else {
        setTransactionsList([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch transaction data:", error);
      setTransactionsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const queryParams: Request = {
      address: address,
      limit: 50,
    };
    getTransactionData(queryParams);
  }, [address]);

  const columns = [
    { key: "Maker", label: "Maker" },
    { key: "Date", label: "Date" },
    { key: "Type", label: "Type" },
    { key: "Volume", label: "Volume" },
    { key: "Token", label: "Token" },
    { key: "SOL", label: "SOL" },
    { key: "Price", label: "Price" },
    { key: "Txn", label: "Txn" },
  ];

  return (
    <div className="relative max-h-[70vh] overflow-hidden overflow-y-auto no-scrollbar">
      <Table
        removeWrapper
        aria-label="history"
        classNames={{
          base: "min-h-[500px]",
          table: "min-w-full",
          thead: "border-b border-[#2c2c3a]",
          th: [
            "bg-transparent",
            "text-gray-400",
            "text-sm",
            "font-normal",
            "first:pl-0",
            "last:pr-0",
          ],
          td: ["py-4", "text-sm", "text-white", "first:pl-0", "last:pr-0"],
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              className="font-cofo uppercase text-sm text-white/60"
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent="No data available"
          loadingContent={<Spinner />}
          isLoading={isLoading}
        >
          {transactionsList.map((transaction, idx) => (
            <TableRow key={transaction.txHash} className="text-sm">
              <TableCell>{shortenAddress(transaction.traderAddress)}</TableCell>
              <TableCell>
                {formatTimeAgo(transaction.timestamp, "en")}
              </TableCell>
              <TableCell>
                <span
                  className={`text-${
                    transaction.type === "buy" ? "[#00FFA2]" : "[#FA2256]"
                  }`}
                >
                  {transaction.type === "buy" ? "Buy" : "Sell"}
                </span>
              </TableCell>
              <TableCell>${formatQuantity(transaction.usdVolume)}</TableCell>
              <TableCell>{formatQuantity(transaction.amount)}</TableCell>
              <TableCell>{formatQuantity(transaction.nativeVolume)}</TableCell>
              <TableCell>${formatQuantity(transaction.usdPrice)}</TableCell>
              <TableCell>
                <Link
                  href={`https://solscan.io/tx/${transaction.txHash}`}
                  target="_blank"
                >
                  <RiShareBoxLine />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default React.memo(Transactions);
