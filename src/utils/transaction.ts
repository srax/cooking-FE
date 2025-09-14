import * as anchor from "@coral-xyz/anchor";
import {
  deriveCustomizablePermissionlessLbPair,
  deriveOracle,
  deriveReserve,
} from "@meteora-ag/dlmm";
import {
  deriveDbcPoolAddress,
  DynamicBondingCurveClient,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SendTransactionError,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { BN } from "bn.js";
import bs58 from "bs58";
import { Buffer } from "buffer";
import CookCity_DEV from "./devIdl.json";
import CookCity from "./idl.json";

const cluster =
  process.env.NEXT_PUBLIC_IS_DEV === "false" ? "mainnet" : "devnet";

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

export interface TokenParams {
  name: string;
  symbol: string;
  uri: string;
  userPubkey: string;
  mint: string;
  insuranceAmt: number;
  insurancePx: number;
  buyAmount?: number;
  binId: number;
  isAntiSniper: boolean;
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
  signAllTransactions: <T extends Transaction | VersionedTransaction>(
    txs: T[]
  ) => Promise<T[]>;
  publicKey: PublicKey;
}

async function createMint(
  connection: Connection,
  tokenParams: TokenParams,
  wallet: { address: string; provider: WalletProvider },
  mintKeypair: Keypair
) {
  const FIXED_CONFIG_ADDRESS = new PublicKey(
    tokenParams?.isAntiSniper
      ? process.env.NEXT_PUBLIC_IS_DEV === "false"
        ? process.env.NEXT_PUBLIC_ANTI_SNIPER_CONFIG_ID ||
          "HEio7a9vLFJg6qCJViqrQaeHXLRBPmQA8QpjYVgJkF9K"
        : process.env.NEXT_PUBLIC_ANTI_SNIPER_CONFIG_DEV_ID ||
          "G2Q5WTWYvLFhJwyDbE2idNxDnqjCcDByhSre9X1M1pZy"
      : process.env.NEXT_PUBLIC_IS_DEV === "false"
      ? process.env.NEXT_PUBLIC_CONFIG_ID ||
        "3RLX3QUSpDDFM98KXCwwHzUik77cB6mMe9M8rcALfV7K"
      : process.env.NEXT_PUBLIC_CONFIG_DEV_ID ||
        "2jCxhSEPVgsfVtnTco64MhAvu76ocNskkuRW7Wnoi3q3"
  );
  const configAddress = FIXED_CONFIG_ADDRESS;
  console.log(`Using fixed config: ${configAddress.toString()}`);

  const baseMint = mintKeypair;
  console.log(`Using provided base mint: ${baseMint.publicKey.toString()}`);

  const createPoolParam = {
    name: tokenParams.name,
    symbol: tokenParams.symbol,
    uri: tokenParams.uri,
    payer: new PublicKey(wallet.address),
    poolCreator: new PublicKey(wallet.address),
    config: configAddress,
    baseMint: baseMint.publicKey,
  };

  const client = new DynamicBondingCurveClient(connection, "confirmed");

  console.log("Creating pool transaction...");
  try {
    if (tokenParams.buyAmount && tokenParams.buyAmount > 0) {
      const buyAmountInLamports = new BN(tokenParams.buyAmount);
      const slippageBps = 500; // 5% 滑点
      const calculatedMinimumAmountOut = buyAmountInLamports
        .mul(new BN(10000 - slippageBps))
        .div(new BN(10000));
      console.log(buyAmountInLamports.toString(), "buyAmountInLamports");

      const poolTransaction = await client.pool.createPoolWithFirstBuy({
        createPoolParam: {
          baseMint: createPoolParam.baseMint,
          config: configAddress,
          name: tokenParams.name,
          symbol: tokenParams.symbol,
          uri: createPoolParam.uri,
          payer: new PublicKey(wallet.address),
          poolCreator: new PublicKey(wallet.address),
        },
        firstBuyParam: {
          buyer: new PublicKey(wallet.address),
          receiver: new PublicKey(wallet.address),
          buyAmount: buyAmountInLamports,
          minimumAmountOut: calculatedMinimumAmountOut,
          referralTokenAccount: null,
        },
      });
      console.log(
        "createMint instructions:",
        poolTransaction.createPoolTx.instructions.length,
        poolTransaction?.swapBuyTx &&
          poolTransaction?.swapBuyTx.instructions.length
      );
      return {
        instructions:
          poolTransaction?.swapBuyTx &&
          poolTransaction?.swapBuyTx.instructions.length
            ? [
                ...poolTransaction.createPoolTx.instructions,
                ...poolTransaction.swapBuyTx.instructions,
              ]
            : poolTransaction.createPoolTx.instructions,
        configAddress,
        baseMint: baseMint.publicKey,
      };
    } else {
      const poolTransaction = await client.pool.createPool(createPoolParam);
      console.log(
        "createMint instructions:",
        poolTransaction.instructions.length
      );
      return {
        instructions: poolTransaction.instructions,
        configAddress,
        baseMint: baseMint.publicKey,
      };
    }
  } catch (error) {
    console.error("Failed to create pool:", error);
    throw error;
  }
}

async function getHighestPriorityFee(account: string[]): Promise<number> {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_IS_DEV === "false"
        ? process.env.NEXT_PUBLIC_RPC_URL ||
            "https://api.mainnet-beta.solana.com"
        : process.env.NEXT_PUBLIC_DEV_RPC_URL || "",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getPriorityFeeEstimate",
          params: [
            {
              accountKeys: account,
              options: { priorityLevel: "High" },
            },
          ],
        }),
      }
    );

    const data = await response.json();
    if (data.error) {
      console.error("get fees error:", data.error);
      return 1_500_000;
    }
    const fees = data.result?.priorityFeeEstimate || 1_500_000;
    return Math.max(fees, 1_500_000);
  } catch (error) {
    console.error("request QuickNode err:", error);
    return 1_500_000;
  }
}

export async function signAndSendTransaction(
  connection: Connection,
  tokenParams: TokenParams,
  wallet: { address: string; provider: WalletProvider },
  sendOptions: SendOptions = {
    skipPreflight: true,
    preflightCommitment: "confirmed",
    maxRetries: 5,
  }
): Promise<{ signatures: string[]; mintPubkey: string }> {
  const signatures: string[] = [];
  const FIXED_CONFIG_ADDRESS = new PublicKey(
    tokenParams?.isAntiSniper
      ? process.env.NEXT_PUBLIC_IS_DEV === "false"
        ? process.env.NEXT_PUBLIC_ANTI_SNIPER_CONFIG_ID ||
          "HEio7a9vLFJg6qCJViqrQaeHXLRBPmQA8QpjYVgJkF9K"
        : process.env.NEXT_PUBLIC_ANTI_SNIPER_CONFIG_DEV_ID ||
          "G2Q5WTWYvLFhJwyDbE2idNxDnqjCcDByhSre9X1M1pZy"
      : process.env.NEXT_PUBLIC_IS_DEV === "false"
      ? process.env.NEXT_PUBLIC_CONFIG_ID ||
        "3RLX3QUSpDDFM98KXCwwHzUik77cB6mMe9M8rcALfV7K"
      : process.env.NEXT_PUBLIC_CONFIG_DEV_ID ||
        "2jCxhSEPVgsfVtnTco64MhAvu76ocNskkuRW7Wnoi3q3"
  );
  const provider = new anchor.AnchorProvider(connection, wallet.provider, {
    commitment: sendOptions.preflightCommitment || "confirmed",
  });
  anchor.setProvider(provider);

  const program = new anchor.Program(
    process.env.NEXT_PUBLIC_IS_DEV === "false"
      ? (CookCity as anchor.Idl)
      : (CookCity_DEV as anchor.Idl)
  );

  let mintKeypair: Keypair;
  try {
    const secretKey = bs58.decode(tokenParams.mint);
    if (secretKey.length !== 64) {
      throw new Error(
        `Invalid mint secret key length: ${secretKey.length}, expected 64`
      );
    }
    mintKeypair = Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error("Invalid mint secret key:", error);
    throw new Error("Invalid mint secret key provided");
  }
  const mintPubkey = mintKeypair.publicKey;
  console.log("Mint public key:", mintPubkey.toString());

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
  const [tokenVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("dish_token_vault"), dish.toBytes()],
    program.programId
  );
  const [wsolVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("dish_wsol_vault"), dish.toBytes()],
    program.programId
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  console.log("Latest blockhash:", blockhash);

  // 第一笔交易：代币池创建
  const poolInstructions: anchor.web3.TransactionInstruction[] = [];
  poolInstructions.push(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 2_000_000 })
  );
  const poolAccountKeys = [
    PROGRAM_ID.toBase58(),
    mintPubkey.toBase58(),
    FIXED_CONFIG_ADDRESS.toBase58(),
    wallet.address,
  ];
  const poolPriorityFee = await getHighestPriorityFee(poolAccountKeys);
  console.log("Pool priority fee:", poolPriorityFee);
  poolInstructions.push(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: Math.max(poolPriorityFee, 1_500_000),
    })
  );

  const {
    instructions: createMintInstructions,
    configAddress,
    baseMint,
  } = await createMint(connection, tokenParams, wallet, mintKeypair);
  poolInstructions.push(...createMintInstructions);

  const poolMessage = new TransactionMessage({
    payerKey: new PublicKey(wallet.address),
    recentBlockhash: blockhash,
    instructions: poolInstructions,
  }).compileToV0Message();
  const poolTx = new VersionedTransaction(poolMessage);
  poolTx.sign([mintKeypair]);
  const signedPoolTx = await wallet.provider.signTransaction(poolTx);

  console.log("Sending pool creation transaction...");
  console.log("Pool transaction size:", signedPoolTx.serialize().length);
  const txSignature = bs58.encode(signedPoolTx.signatures[0]);
  console.log("Pool transaction signature:", txSignature);

  try {
    if (txSignature.length < 80 || txSignature.length > 88) {
      throw new Error(
        `Invalid transaction signature length: ${txSignature.length}`
      );
    }

    const poolSignature = await connection.sendRawTransaction(
      signedPoolTx.serialize(),
      {
        skipPreflight: sendOptions.skipPreflight,
        preflightCommitment: sendOptions.preflightCommitment,
        maxRetries: sendOptions.maxRetries,
      }
    );
    console.log("Transaction sent, signature:", poolSignature);

    const confirmation = await connection.confirmTransaction(
      { signature: poolSignature, blockhash, lastValidBlockHeight },
      sendOptions.preflightCommitment
    );
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    const signatureStatus = await connection.getSignatureStatuses([
      poolSignature,
    ]);
    const status = signatureStatus.value[0];
    if (!status || status.err) {
      throw new Error(
        `Failed to confirm transaction: ${status?.err || "Unknown error"}`
      );
    }

    signatures.push(poolSignature);
    console.log("Pool creation transaction successful:", poolSignature);
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      console.error("Pool transaction logs:", await error.getLogs(connection));
      if (error.message.includes("already been processed")) {
        throw new Error("Transaction already processed");
      }
    } else if (error.message.includes("Invalid param: WrongSize")) {
      console.error("Signature validation failed:", txSignature);
      throw new Error("Invalid transaction signature size");
    }
    console.error("Failed to send/confirm pool creation transaction:", error);
    throw error;
  }

  // 第二笔交易：保险池初始化
  if (tokenParams.insuranceAmt !== 0) {
    const insuranceInstructions: anchor.web3.TransactionInstruction[] = [];
    insuranceInstructions.push(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 2_000_000 })
    );
    const insuranceAccountKeys = [
      PROGRAM_ID.toBase58(),
      METEORA_DLMM_PROGRAM.toBase58(),
      configAddr.toBase58(),
      dish.toBase58(),
      insuranceVault.toBase58(),
      tokenVault.toBase58(),
      wsolVault.toBase58(),
      mintPubkey.toBase58(),
      NATIVE_MINT.toBase58(),
      wallet.address,
    ];
    const insurancePriorityFee = await getHighestPriorityFee(
      insuranceAccountKeys
    );
    console.log("Insurance priority fee:", insurancePriorityFee);
    insuranceInstructions.push(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: Math.max(insurancePriorityFee, 1_500_000),
      })
    );

    const poolId = deriveDbcPoolAddress(NATIVE_MINT, baseMint, configAddress);
    console.log("Derived pool address:", poolId.toString());

    const configAccountInfo = await connection.getAccountInfo(configAddr);
    if (!configAccountInfo) {
      insuranceInstructions.push(
        await program.methods
          .initConfig()
          .accounts({
            config: configAddr,
            authority: new PublicKey(wallet.address),
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      );
    }

    const insuranceIx = await program.methods
      .initInsurance({
        amt: new BN(tokenParams.insuranceAmt),
        startPrice: new BN(tokenParams.insurancePx),
        creator: provider.wallet.publicKey,
        mint: mintPubkey,
        name: tokenParams.name,
        symbol: tokenParams.symbol,
        uri: "",
        poolId,
      })
      .accountsPartial({
        mint: mintPubkey,
        dish,
        insuranceVault,
        wsolMint: NATIVE_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
    insuranceInstructions.push(insuranceIx);

    const userTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      provider.wallet.publicKey
    );
    const userTokenAccountInfo = await connection.getAccountInfo(
      userTokenAccount
    );
    if (!userTokenAccountInfo) {
      insuranceInstructions.push(
        createAssociatedTokenAccountInstruction(
          provider.wallet.publicKey,
          userTokenAccount,
          provider.wallet.publicKey,
          mintPubkey
        )
      );
    }

    const transferIx = createTransferInstruction(
      userTokenAccount,
      tokenVault,
      provider.wallet.publicKey,
      1
    );
    insuranceInstructions.push(transferIx);

    const [lbPair] = deriveCustomizablePermissionlessLbPair(
      mintPubkey,
      NATIVE_MINT,
      METEORA_DLMM_PROGRAM
    );
    const [reserveX] = deriveReserve(mintPubkey, lbPair, METEORA_DLMM_PROGRAM);
    const [reserveY] = deriveReserve(NATIVE_MINT, lbPair, METEORA_DLMM_PROGRAM);
    const [oracle] = deriveOracle(lbPair, METEORA_DLMM_PROGRAM);
    const DLMM_EVT_AUTHORITY = new PublicKey(
      "D1ZN9Wj1fRSUQfCjhvnu1hqDMT7hzjzBBpi12nVniYD6"
    );
    console.log("Selected binId:", tokenParams.binId);

    const initPoolIx = await program.methods
      .initCurvePool({
        activeId: tokenParams.binId,
        bin_step: 400,
        base_factor: 100,
        activation_type: 0,
        has_alpha_vault: false,
        activation_point: null,
        creator_pool_on_off_control: false,
        base_fee_power_factor: 0,
        padding: new Array(62).fill(0),
      })
      .accountsPartial({
        mint: mintPubkey,
        dish,
        lbPair,
        wsolMint: NATIVE_MINT,
        tokenVault,
        insuranceVault,
        wsolVault,
        reserveX,
        reserveY,
        oracle,
        dlmmEvtAuthority: DLMM_EVT_AUTHORITY,
        meteoraDlmmProgram: METEORA_DLMM_PROGRAM,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
    insuranceInstructions.push(initPoolIx);

    const insuranceMessage = new TransactionMessage({
      payerKey: new PublicKey(wallet.address),
      recentBlockhash: blockhash,
      instructions: insuranceInstructions,
    }).compileToV0Message();
    const insuranceTx = new VersionedTransaction(insuranceMessage);
    const signedInsuranceTx = await wallet.provider.signTransaction(
      insuranceTx
    );

    console.log("Sending insurance pool transaction...");
    console.log(
      "Insurance transaction size:",
      signedInsuranceTx.serialize().length
    );
    const insuranceSignature = bs58.encode(signedInsuranceTx.signatures[0]);
    console.log("Insurance transaction signature:", insuranceSignature);

    try {
      // 验证签名长度
      if (insuranceSignature.length < 80 || insuranceSignature.length > 88) {
        throw new Error(
          `Invalid insurance transaction signature length: ${insuranceSignature.length}`
        );
      }

      // 先发送交易
      const sentInsuranceSignature = await connection.sendRawTransaction(
        signedInsuranceTx.serialize(),
        {
          skipPreflight: sendOptions.skipPreflight,
          preflightCommitment: sendOptions.preflightCommitment,
          maxRetries: sendOptions.maxRetries,
        }
      );
      console.log(
        "Insurance transaction sent, signature:",
        sentInsuranceSignature
      );

      // 等待确认
      const confirmation = await connection.confirmTransaction(
        { signature: sentInsuranceSignature, blockhash, lastValidBlockHeight },
        sendOptions.preflightCommitment
      );
      if (confirmation.value.err) {
        throw new Error(
          `Insurance transaction failed: ${confirmation.value.err}`
        );
      }

      // 确认后检查状态
      const insuranceStatus = await connection.getSignatureStatuses([
        sentInsuranceSignature,
      ]);
      const status = insuranceStatus.value[0];
      if (!status || status.err) {
        throw new Error(
          `Failed to confirm insurance transaction: ${
            status?.err || "Unknown error"
          }`
        );
      }

      signatures.push(sentInsuranceSignature);
      console.log(
        "Insurance pool transaction successful:",
        sentInsuranceSignature
      );
    } catch (error: any) {
      if (error instanceof SendTransactionError) {
        console.error(
          "Insurance transaction logs:",
          await error.getLogs(connection)
        );
        if (error.message.includes("already been processed")) {
          throw new Error("Insurance transaction already processed");
        }
      } else if (error.message.includes("Invalid param: WrongSize")) {
        console.error(
          "Insurance signature validation failed:",
          insuranceSignature
        );
        throw new Error("Invalid insurance transaction signature size");
      }
      console.error(
        "Failed to send/confirm insurance pool transaction:",
        error
      );
      throw error;
    }
  }

  return { signatures, mintPubkey: mintPubkey.toString() };
}
