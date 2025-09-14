import * as anchor from "@coral-xyz/anchor";
import { deriveCustomizablePermissionlessLbPair } from "@meteora-ag/dlmm";
import { NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import CookCity_DEV from "./devIdl.json";
import CookCity from "./idl.json";

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_IS_DEV === "false"
    ? process.env.NEXT_PUBLIC_COOKCITY_PROGRAM_ID ||
      "3tAKBGFWaFWtxKhNwjbfaL4fivGfn1fj1bD6Lyw5TtKJ"
    : process.env.NEXT_PUBLIC_COOKCITY_DEV_PROGRAM_ID ||
      "3tAKBGFWaFWtxKhNwjbfaL4fivGfn1fj1bD6Lyw5TtKJ"
);
const METEORA_DLMM_PROGRAM = new PublicKey(
  process.env.NEXT_PUBLIC_METEORA_DLMM_PROGRAM ||
    "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo"
);

interface RefundParams {
  mint: string;
  userPubkey: string;
}

interface SendOptions {
  skipPreflight?: boolean;
  preflightCommitment?: "processed" | "confirmed" | "finalized";
  maxRetries?: number;
  minContextSlot?: number;
}

interface WalletProvider {
  signTransaction: <T extends Transaction | VersionedTransaction>(
    tx: T
  ) => Promise<T>;
  publicKey: PublicKey;
}

enum InsuranceState {
  None,
  Deposited,
  Deployed,
  Refunded,
}

interface InsuranceInfo {
  insuranceLp: PublicKey;
  insuranceAmt: anchor.BN;
  insurancePrice: anchor.BN;
  insuranceState: InsuranceState;
  depositTs: anchor.BN;
  deployTs: anchor.BN;
  refundTs: anchor.BN;
}

interface DishAccount {
  creator: PublicKey;
  mint: PublicKey;
  name: string;
  symbol: string;
  pool: PublicKey;
  position: PublicKey;
  insuranceInfo: InsuranceInfo;
  isGraduated: boolean;
  withdrawTokenVaultAmt: anchor.BN;
  withdrawWsolVaultAmt: anchor.BN;
}

export async function refundInsurance(
  connection: Connection,
  refundParams: RefundParams,
  wallet: {
    address: string;
    provider: any;
  },
  sendOptions: SendOptions = {
    skipPreflight: true,
    preflightCommitment: "confirmed",
  }
): Promise<string> {
  console.log("Connection endpoint:", connection.rpcEndpoint);

  const provider = new anchor.AnchorProvider(connection, wallet.provider, {
    commitment: sendOptions.preflightCommitment || "confirmed",
  });
  anchor.setProvider(provider);

  const program = new anchor.Program(
    process.env.NEXT_PUBLIC_IS_DEV === "false"
      ? (CookCity as anchor.Idl)
      : (CookCity_DEV as anchor.Idl),
    provider
  );

  console.log("IDL accounts:", CookCity.accounts);

  const mintPubkey = new PublicKey(refundParams.mint);
  const userPubkey = new PublicKey(wallet.address);

  console.log("Mint address:", mintPubkey.toBase58());
  console.log(
    "User pubkey:",
    userPubkey.toBase58(),
    "Wallet address:",
    wallet.address
  );
  if (userPubkey.toBase58() !== wallet.address) {
    throw new Error("User pubkey does not match wallet address");
  }

  const balance = await connection.getBalance(userPubkey);
  console.log("Wallet SOL balance:", balance / 1e9, "SOL");
  if (balance < 5000) {
    throw new Error("Insufficient SOL balance for transaction fees");
  }

  const programAccountInfo = await connection.getAccountInfo(PROGRAM_ID);
  console.log("Program exists:", !!programAccountInfo);
  if (!programAccountInfo) {
    throw new Error("Program does not exist on this network");
  }

  const mintAccountInfo = await connection.getAccountInfo(mintPubkey);
  console.log("Mint exists:", !!mintAccountInfo);
  if (!mintAccountInfo) {
    throw new Error("Mint account does not exist");
  }

  const [configAddr] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    PROGRAM_ID
  );

  const [dish] = PublicKey.findProgramAddressSync(
    [Buffer.from("dish"), mintPubkey.toBytes()],
    PROGRAM_ID
  );
  const [insuranceVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("insurance_vault"), dish.toBytes()],
    PROGRAM_ID
  );
  const [lbPair] = deriveCustomizablePermissionlessLbPair(
    mintPubkey,
    NATIVE_MINT,
    METEORA_DLMM_PROGRAM
  );

  const refundInsuranceIx = await program.methods
    .refundInsurance()
    .accountsPartial({
      payer: userPubkey,
      config: configAddr,
      lbPair,
      dish,
      mint: mintPubkey,
      insuranceVault,
      wsolMint: NATIVE_MINT,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  const cuLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1_400_000,
  });

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  const message = new TransactionMessage({
    payerKey: userPubkey,
    recentBlockhash: blockhash,
    instructions: [cuLimitIx, refundInsuranceIx],
  }).compileToV0Message();

  const transaction = new VersionedTransaction(message);
  const signedTransaction = await wallet.provider.signTransaction(transaction);

  const serializedTx = signedTransaction.serialize();
  console.log(
    "Refund insurance transaction size:",
    serializedTx.length,
    "bytes"
  );
  const signature = await connection.sendRawTransaction(serializedTx, {
    skipPreflight: sendOptions.skipPreflight,
    preflightCommitment: sendOptions.preflightCommitment,
    maxRetries: sendOptions.maxRetries,
    minContextSlot: sendOptions.minContextSlot,
  });

  console.log("Confirming refund insurance transaction:", signature);
  const confirmation = await connection.confirmTransaction(
    {
      signature,
      blockhash,
      lastValidBlockHeight,
    },
    sendOptions.preflightCommitment || "confirmed"
  );

  if (confirmation.value.err) {
    console.error(
      "Transaction error details:",
      JSON.stringify(confirmation.value.err, null, 2)
    );
  }

  console.log("Refund insurance transaction successful, signature:", signature);
  return signature;
}
