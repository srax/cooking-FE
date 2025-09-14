"use client";

import { useAuth } from "@/context/AuthContext";
import { DynamicBondingCurveClient } from "@meteora-ag/dynamic-bonding-curve-sdk";
import type { Provider } from "@reown/appkit-adapter-solana";
import { useAppKitProvider } from "@reown/appkit/react";
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { BN } from "bn.js";
import { useCallback, useEffect, useState } from "react";

export type CreatorViewProps = {
  cofoTextStyle?: string;
  loginState: LoginState;
};

interface LoginState {
  isConnected: boolean;
  isLoggedIn: boolean;
}

interface CreatorFee {
  poolAddress: string;
  creatorQuoteFee: number;
  isClaimable: boolean;
}

export const CreatorView = ({
  cofoTextStyle = "font-cofo",
  loginState,
}: CreatorViewProps) => {
  const { address, isConnected, isLoggedIn } = useAuth();
  const { walletProvider } = useAppKitProvider<Provider>("solana");

  const [creatorFeesList, setCreatorFeesList] = useState<CreatorFee[]>([]);
  const [isLoadingFees, setIsLoadingFees] = useState(false);
  const [feesError, setFeesError] = useState<string | null>(null);
  const [claimingPoolAddress, setClaimingPoolAddress] = useState<string | null>(
    null
  );
  const [totalClaimableFees, setTotalClaimableFees] = useState(0);

  // 获取creator费用
  const getCreatorFees = useCallback(async (creatorAddress: string) => {
    if (!creatorAddress) return;

    setIsLoadingFees(true);
    setFeesError(null);
    setCreatorFeesList([]);

    try {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_RPC_URL ||
          "https://api.mainnet-beta.solana.com",
        "confirmed"
      );
      const client = new DynamicBondingCurveClient(connection, "confirmed");

      // 1. 获取池子信息
      const pools = await client.state.getPoolsByCreator(creatorAddress);
      console.log(pools, "获取到的池子信息");

      // 2. 获取配置ID
      const configId = process.env.NEXT_PUBLIC_CONFIG_ID;
      const antiSniperConfigId = process.env.NEXT_PUBLIC_ANTI_SNIPER_CONFIG_ID;

      if (!configId && !antiSniperConfigId) {
        throw new Error("配置ID未设置");
      }

      // 3. 筛选匹配的池子
      const matchedPoolAddresses: string[] = [];
      pools.forEach((pool: any) => {
        const poolConfigId = pool.account.config?.toString();
        if (poolConfigId === configId || poolConfigId === antiSniperConfigId) {
          matchedPoolAddresses.push(pool.publicKey.toString());
        }
      });

      console.log("匹配的池子地址:", matchedPoolAddresses);

      if (matchedPoolAddresses.length === 0) {
        setTotalClaimableFees(0);
        setCreatorFeesList([]);
        return;
      }

      // 4. 调用getPoolsFeesByCreator方法获取费用信息
      const feesData = await client.state.getPoolsFeesByCreator(creatorAddress);
      console.log("费用数据:", feesData);

      // 5. 处理费用数据并筛选匹配的池子
      const feesList: CreatorFee[] = [];
      let totalFees = 0;

      feesData.forEach((feeData: any) => {
        const poolAddress = feeData.poolAddress.toString();
        if (matchedPoolAddresses.includes(poolAddress)) {
          const creatorQuoteFee = feeData.creatorQuoteFee?.toNumber() || 0;
          const isClaimable = creatorQuoteFee > 0;

          feesList.push({
            poolAddress,
            creatorQuoteFee,
            isClaimable,
          });

          totalFees += creatorQuoteFee;
        }
      });

      setCreatorFeesList(feesList);
      setTotalClaimableFees(totalFees / 1e9); // 转换为SOL单位

      console.log("处理后的费用列表:", feesList);
      console.log("总费用:", totalFees);
    } catch (error) {
      console.error("获取创建者费用时出错:", error);
      setFeesError("获取创建者费用失败: " + (error as Error).message);
      setTotalClaimableFees(0);
      setCreatorFeesList([]);
    } finally {
      setIsLoadingFees(false);
    }
  }, []);

  // 领取单个池子的费用
  const claimSinglePoolFee = async (poolAddress: string) => {
    if (!walletProvider || !address) {
      console.error("钱包未连接");
      return;
    }

    setClaimingPoolAddress(poolAddress);

    try {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_RPC_URL ||
          "https://api.mainnet-beta.solana.com",
        "confirmed"
      );
      const client = new DynamicBondingCurveClient(connection, "confirmed");

      console.log(`开始领取池子 ${poolAddress} 的费用`);

      // 调用Meteora SDK的费用领取方法获取交易指令
      const claimTransaction = await client.creator.claimCreatorTradingFee({
        payer: new PublicKey(address),
        pool: new PublicKey(poolAddress),
        creator: new PublicKey(address),
        maxBaseAmount: new BN(Number.MAX_SAFE_INTEGER),
        maxQuoteAmount: new BN(Number.MAX_SAFE_INTEGER),
      });

      console.log(`池子 ${poolAddress} 交易指令生成成功:`, claimTransaction);

      // 获取最新的区块哈希
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      // 构建交易消息
      const message = new TransactionMessage({
        payerKey: new PublicKey(address),
        recentBlockhash: blockhash,
        instructions: claimTransaction.instructions,
      }).compileToV0Message();

      // 创建版本化交易
      const transaction = new VersionedTransaction(message);

      // 使用钱包签名交易
      const signedTransaction = await walletProvider.signTransaction(
        transaction
      );

      // 发送交易
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: true,
          preflightCommitment: "confirmed",
          maxRetries: 5,
        }
      );

      console.log(`池子 ${poolAddress} 交易发送成功，签名:`, signature);

      // 等待交易确认
      const confirmation = await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error(`交易确认失败: ${confirmation.value.err}`);
      }

      console.log(`池子 ${poolAddress} 费用领取成功，交易签名:`, signature);

      // 重新获取费用信息
      await getCreatorFees(address);

      return signature;
    } catch (error) {
      console.error(`池子 ${poolAddress} 费用领取失败:`, error);
      throw error;
    } finally {
      setClaimingPoolAddress(null);
    }
  };

  // 自动获取creator fees当用户连接钱包时
  useEffect(() => {
    const loadCreatorFees = async () => {
      if (address && isConnected && isLoggedIn) {
        await getCreatorFees(address);
      }
    };
    loadCreatorFees();
  }, [address, isConnected, isLoggedIn, getCreatorFees]);

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-6 pt-5">
        <h1 className="text-[32px] leading-9 md:leading-6 uppercase text-white text-left inline-block">
          Claim your creator fees
        </h1>
      </div>

      {loginState.isConnected && loginState.isLoggedIn ? (
        <div>
          {/* Creator Fees List */}
          {isLoadingFees ? (
            <div className="text-center py-8">
              <div className="text-white">Loading creator fees...</div>
            </div>
          ) : creatorFeesList.length > 0 ? (
            <div className="w-full">
              <div className="space-y-3">
                {creatorFeesList.map((fee, index) => (
                  <div
                    key={fee.poolAddress}
                    className="bg-[rgba(39,27,36,0.5)] border-[#473745] border-solid border-[1px] rounded-lg p-4 flex items-center justify-between hover:bg-[rgba(51,34,49,0.7)] transition-all duration-200"
                  >
                    <div className="flex-1 flex items-center gap-6">
                      <div className="flex flex-col">
                        <span
                          className={`${cofoTextStyle} text-xs text-[#9f9b9f] mb-1`}
                        >
                          Pool Address
                        </span>
                        <span className="text-sm text-white font-mono tracking-[-0.02em]">
                          {fee.poolAddress.slice(0, 8)}...
                          {fee.poolAddress.slice(-8)}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span
                          className={`${cofoTextStyle} text-xs text-[#9f9b9f] mb-1`}
                        >
                          Amount
                        </span>
                        <div className="flex items-center">
                          <span className="text-lg font-semibold text-[#ff8df7] tracking-[-0.06em]">
                            {(fee.creatorQuoteFee / 1e9).toFixed(6)}
                          </span>
                          <span className="text-white ml-1">SOL</span>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <span
                          className={`${cofoTextStyle} text-xs text-[#9f9b9f] mb-1`}
                        >
                          Status
                        </span>
                        <span
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            fee.isClaimable
                              ? "bg-[rgba(255,141,247,0.2)] text-[#ff8df7] border border-[rgba(255,141,247,0.3)]"
                              : "bg-[rgba(51,34,49,0.5)] text-[#9f9b9f] border border-[#473745]"
                          }`}
                        >
                          {fee.isClaimable ? "Claimable" : "No Fees"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => claimSinglePoolFee(fee.poolAddress)}
                      disabled={
                        !fee.isClaimable ||
                        claimingPoolAddress === fee.poolAddress
                      }
                      className="z-40 relative rounded bg-[#332231] flex items-center justify-center py-2.5 px-5 text-sm text-white uppercase transition-colors hover:bg-[#473745] disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                    >
                      {claimingPoolAddress === fee.poolAddress
                        ? "Claiming..."
                        : fee.isClaimable
                        ? "Claim"
                        : "N/A"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-[#9f9b9f]">
                No creator pools found. Create a token to start earning creator
                fees!
              </div>
            </div>
          )}

          {feesError && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded text-red-300 text-sm">
              {feesError}
            </div>
          )}
        </div>
      ) : (
        <div className="border-[#332231] w-full min-h-[200px] relative rounded-lg bg-gray border-solid border-[1px] box-border flex items-center justify-center p-6 text-center text-xl text-white">
          Please connect wallet to view your creator fees
        </div>
      )}
    </div>
  );
};
