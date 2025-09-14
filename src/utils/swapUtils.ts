import { createJupiterApiClient } from "@jup-ag/api";
import {
  deriveDbcPoolAddress,
  DynamicBondingCurveClient,
  getCurrentPoint,
  ActivationType,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import { Provider } from "@reown/appkit-adapter-solana";
import {
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  NATIVE_MINT,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { BN } from "bn.js";

const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_IS_DEV === "false"
    ? process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com"
    : process.env.NEXT_PUBLIC_DEV_RPC_URL || "";

const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

export interface SwapParams {
  provider: Provider;
  userPublicKey: string;
  tokenAddress: string;
  amount: number;
  isBuy: boolean;
  slippage: number;
  priorityLamports?: {
    priorityLevelWithMaxLamports: {
      maxLamports: number;
      priorityLevel: string;
    };
  };
}

export interface QuoteResult {
  hasRoute: boolean;
  estimatedOutput: number;
  quoteResponse: any | null;
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export async function getSolBalance(userPublicKey: string): Promise<number> {
  try {
    if (!isValidSolanaAddress(userPublicKey)) {
      throw new Error("Invalid user public key");
    }
    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    const publicKey = new PublicKey(userPublicKey);
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9;
  } catch (error) {
    console.error("Failed to fetch SOL balance:", error);
    throw new Error("Failed to fetch SOL balance");
  }
}

export async function getTokenDecimals(tokenAddress: string): Promise<number> {
  try {
    if (!isValidSolanaAddress(tokenAddress)) {
      throw new Error("Invalid token address");
    }
    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    const tokenMint = new PublicKey(tokenAddress);
    const mintInfo = await getMint(connection, tokenMint);
    return mintInfo.decimals;
  } catch (error) {
    console.error("Failed to fetch token decimals:", error);
    throw new Error("Failed to fetch token decimals");
  }
}

export async function getTokenPreviousBalance(
  userPublicKey: string,
  tokenAddress: string
): Promise<number> {
  try {
    if (!isValidSolanaAddress(userPublicKey)) {
      throw new Error("Invalid user public key");
    }
    if (!isValidSolanaAddress(tokenAddress)) {
      throw new Error("Invalid token address");
    }
    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    const publicKey = new PublicKey(userPublicKey);
    const tokenMint = new PublicKey(tokenAddress);
    const tokenAccountAddress = await getAssociatedTokenAddress(
      tokenMint,
      publicKey
    );
    try {
      const tokenAccount = await getAccount(connection, tokenAccountAddress);
      const decimals = await getTokenDecimals(tokenAddress);
      return Number(tokenAccount.amount) / Math.pow(10, decimals);
    } catch {
      return 0;
    }
  } catch (error) {
    console.error("Failed to fetch token balance:", error);
    return 0;
  }
}

export async function fetchJupiterQuote({
  provider,
  userPublicKey,
  tokenAddress,
  amount,
  isBuy,
  slippage,
}: SwapParams): Promise<QuoteResult> {
  try {
    if (!isValidSolanaAddress(userPublicKey)) {
      throw new Error("Invalid user public key address");
    }
    if (!isValidSolanaAddress(tokenAddress)) {
      throw new Error("Invalid token address");
    }
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    if (slippage < 0) {
      throw new Error("Slippage cannot be negative");
    }

    const jupiterQuoteApi = createJupiterApiClient();
    const inputMint = isBuy ? WSOL_MINT.toBase58() : tokenAddress;
    const outputMint = isBuy ? tokenAddress : WSOL_MINT.toBase58();

    const decimals = await getTokenDecimals(
      isBuy ? WSOL_MINT.toBase58() : tokenAddress
    );
    const amountInLamports = Math.floor(amount * Math.pow(10, decimals));
    const slippageBps = Math.floor(slippage * 100);

    const quoteResp = await jupiterQuoteApi.quoteGet({
      inputMint,
      outputMint,
      amount: amountInLamports,
      slippageBps,
      swapMode: "ExactIn",
      restrictIntermediateTokens: true,
      asLegacyTransaction: false,
      maxAccounts: 64,
    });

    if (!quoteResp || !quoteResp.outAmount) {
      return {
        hasRoute: false,
        estimatedOutput: 0,
        quoteResponse: null,
      };
    }

    const outputDecimals = await getTokenDecimals(
      isBuy ? tokenAddress : WSOL_MINT.toBase58()
    );
    return {
      hasRoute: true,
      estimatedOutput:
        Number(quoteResp.outAmount) / Math.pow(10, outputDecimals),
      quoteResponse: quoteResp,
    };
  } catch (error: any) {
    console.error("Failed to fetch Jupiter quote:", error);
    return {
      hasRoute: false,
      estimatedOutput: 0,
      quoteResponse: null,
    };
  }
}

export async function fetchMeteoraQuote({
  provider,
  userPublicKey,
  tokenAddress,
  amount,
  isBuy,
  slippage,
}: SwapParams): Promise<QuoteResult> {
  try {
    if (!isValidSolanaAddress(userPublicKey)) {
      throw new Error("Invalid user public key address");
    }
    if (!isValidSolanaAddress(tokenAddress)) {
      throw new Error("Invalid token address");
    }
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    if (slippage < 0) {
      throw new Error("Slippage cannot be negative");
    }

    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    const client = new DynamicBondingCurveClient(connection, "confirmed");
    const baseMint = new PublicKey(tokenAddress);

    let virtualPoolState;
    let attempts = 0;
    while (attempts < 3) {
      virtualPoolState = await client.state.getPoolByBaseMint(baseMint);
      if (virtualPoolState) break;
      console.log(`Pool not found, retrying (${attempts + 1}/3)...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }
    if (!virtualPoolState) {
      throw new Error(`Pool not found for base mint: ${baseMint.toString()}`);
    }

    const configState = virtualPoolState.account.config;
    if (!configState) {
      throw new Error("Pool config is undefined");
    }

    const poolConfigState = await client.state.getPoolConfig(configState);
    if (!poolConfigState.curve || poolConfigState.curve.length === 0) {
      throw new Error("Invalid config state: curve is empty");
    }

    if (
      !virtualPoolState.account.sqrtPrice ||
      virtualPoolState.account.sqrtPrice.isZero()
    ) {
      throw new Error("Invalid pool state: sqrtPrice is zero or undefined");
    }

    const decimals = await getTokenDecimals(
      isBuy ? WSOL_MINT.toBase58() : tokenAddress
    );
    const amountIn = new BN(Math.floor(amount * Math.pow(10, decimals)));
    const slippageBps = Math.floor(slippage * 100);
    const swapBaseForQuote = !isBuy; // isBuy: true (SOL->Token) -> false; isBuy: false (Token->SOL) -> true
    const hasReferral = false;
    // Use the SDK's getCurrentPoint function to get the current point
    const currentPoint = await getCurrentPoint(connection, ActivationType.Slot);

    const quote = await client.pool.swapQuote({
      virtualPool: virtualPoolState.account,
      config: poolConfigState,
      swapBaseForQuote,
      amountIn,
      slippageBps,
      hasReferral,
      currentPoint: new BN(currentPoint),
    });

    const outputDecimals = await getTokenDecimals(
      isBuy ? tokenAddress : WSOL_MINT.toBase58()
    );
    return {
      hasRoute: true,
      estimatedOutput: Number(quote.outputAmount) / Math.pow(10, outputDecimals),
      quoteResponse: {
        amountIn,
        amountOut: quote.outputAmount,
        minimumAmountOut: quote.outputAmount,
        nextSqrtPrice: quote.nextSqrtPrice,
        fee: {
          trading: quote.tradingFee,
          protocol: quote.protocolFee,
          referral: quote.referralFee,
        },
        price: quote.nextSqrtPrice,
      },
    };
  } catch (error: any) {
    console.error("Failed to fetch Meteora quote:", error);
    return {
      hasRoute: false,
      estimatedOutput: 0,
      quoteResponse: null,
    };
  }
}

export async function executeJupiterSwap({
  provider,
  userPublicKey,
  tokenAddress,
  amount,
  isBuy,
  slippage,
}: SwapParams): Promise<string> {
  try {
    if (!isValidSolanaAddress(userPublicKey)) {
      throw new Error("Invalid user public key address");
    }
    if (!isValidSolanaAddress(tokenAddress)) {
      throw new Error("Invalid token address");
    }
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    if (slippage < 0) {
      throw new Error("Slippage cannot be negative");
    }

    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    const jupiterQuoteApi = createJupiterApiClient();

    const inputMint = isBuy ? WSOL_MINT.toBase58() : tokenAddress;
    const outputMint = isBuy ? tokenAddress : WSOL_MINT.toBase58();

    const decimals = await getTokenDecimals(inputMint);
    const amountInLamports = Math.floor(amount * Math.pow(10, decimals));
    const slippageBps = Math.floor(slippage * 100);

    let quoteResp;
    try {
      quoteResp = await jupiterQuoteApi.quoteGet({
        inputMint,
        outputMint,
        amount: amountInLamports,
        slippageBps,
        swapMode: "ExactIn",
        restrictIntermediateTokens: true,
        asLegacyTransaction: false,
        maxAccounts: 64,
      });
    } catch (apiError: any) {
      throw new Error(
        apiError.response?.data?.error ||
          apiError.message ||
          "Unable to fetch trade quote"
      );
    }

    if (!quoteResp || !quoteResp.outAmount) {
      throw new Error("No valid trading route found");
    }

    let swapResponse;
    try {
      swapResponse = await jupiterQuoteApi.swapPost({
        swapRequest: {
          quoteResponse: quoteResp,
          userPublicKey: userPublicKey,
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
        },
      });

      if (!swapResponse || !swapResponse.swapTransaction) {
        throw new Error("Invalid swap transaction response");
      }
    } catch (apiError: any) {
      throw new Error(
        apiError.response?.data?.error ||
          apiError.message ||
          "Unable to generate trade transaction"
      );
    }

    const swapTransactionBuf = Buffer.from(
      swapResponse.swapTransaction,
      "base64"
    );
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    let signature: string;
    try {
      const signResult = await provider.signAndSendTransaction(transaction);
      signature = signResult;
    } catch (signError: any) {
      throw new Error(
        `Failed to sign or send transaction: ${
          signError.message || "Unknown error"
        }`
      );
    }

    const confirmation = await connection.confirmTransaction(
      signature,
      "confirmed"
    );
    if (confirmation.value.err) {
      throw new Error("Transaction confirmation failed");
    }

    return signature;
  } catch (error) {
    console.error("Jupiter Swap error:", error);
    throw new Error((error as Error).message || "Swap failed: Unknown error");
  }
}

export async function executeMeteoraSwap({
  provider,
  userPublicKey,
  tokenAddress,
  amount,
  isBuy,
  slippage,
}: SwapParams): Promise<string> {
  try {
    if (!isValidSolanaAddress(userPublicKey)) {
      throw new Error("Invalid user public key address");
    }
    if (!isValidSolanaAddress(tokenAddress)) {
      throw new Error("Invalid token address");
    }
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    if (slippage < 0) {
      throw new Error("Slippage cannot be negative");
    }

    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    const client = new DynamicBondingCurveClient(connection, "confirmed");
    const baseMint = new PublicKey(tokenAddress);

    let virtualPoolState: any = null;
    let poolConfigState: any = null;

    let attempts = 0;
    while (attempts < 3) {
      virtualPoolState = await client.state.getPoolByBaseMint(baseMint);
      if (virtualPoolState) break;
      console.log(`Pool not found, retrying (${attempts + 1}/3)...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }
    if (!virtualPoolState) {
      throw new Error(`Pool not found for base mint: ${baseMint.toString()}`);
    }

    const configState = virtualPoolState.account.config;
    console.log(configState.toBase58(), "configState");
    console.log(baseMint.toBase58(), "baseMint");
    console.log(NATIVE_MINT.toBase58(), "NATIVE_MINT");

    if (!configState) {
      throw new Error("Pool config is undefined");
    }

    poolConfigState = await client.state.getPoolConfig(configState);
    if (!poolConfigState.curve || poolConfigState.curve.length === 0) {
      throw new Error("Invalid config state: curve is empty");
    }

    const poolAddress = deriveDbcPoolAddress(
      NATIVE_MINT,
      baseMint,
      configState.toBase58()
    );
    console.log("Derived pool address:", poolAddress.toString());

    if (
      !virtualPoolState.account.sqrtPrice ||
      virtualPoolState.account.sqrtPrice.isZero()
    ) {
      throw new Error("Invalid pool state: sqrtPrice is zero or undefined");
    }

    const decimals = await getTokenDecimals(
      isBuy ? WSOL_MINT.toBase58() : tokenAddress
    );
    const amountIn = new BN(Math.floor(amount * Math.pow(10, decimals)));
    const slippageBps = Math.floor(slippage * 100);
    const swapBaseForQuote = !isBuy; // isBuy: true (SOL->Token) -> false; isBuy: false (Token->SOL) -> true
    const hasReferral = false;
    // Use the SDK's getCurrentPoint function to get the current point
    const currentPoint = await getCurrentPoint(connection, ActivationType.Slot);

    const quote = await client.pool.swapQuote({
      virtualPool: virtualPoolState.account,
      config: poolConfigState,
      swapBaseForQuote,
      amountIn,
      slippageBps,
      hasReferral,
      currentPoint: new BN(currentPoint),
    });

    console.log("Meteora Swap Quote:", {
      amountIn: amountIn.toString(),
      amountOut: quote.outputAmount.toString(),
      minimumAmountOut: quote.outputAmount.toString(),
      nextSqrtPrice: quote.nextSqrtPrice.toString(),
      fee: {
        trading: quote.tradingFee.toString(),
        protocol: quote.protocolFee.toString(),
        referral: quote.referralFee.toString(),
      },
      price: {
        beforeSwap: quote.nextSqrtPrice.toString(),
        afterSwap: quote.nextSqrtPrice.toString(),
      },
    });

    const swapParam = {
      amountIn,
      minimumAmountOut: quote.outputAmount,
      swapBaseForQuote,
      owner: new PublicKey(userPublicKey),
      pool: poolAddress,
      referralTokenAccount: null,
    };

    const swapTransaction = await client.pool.swap(swapParam);
    const swapInstructions: TransactionInstruction[] = [];
    swapInstructions.push(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 })
    );
    swapInstructions.push(...swapTransaction.instructions);

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    const swapMessage = new TransactionMessage({
      payerKey: new PublicKey(userPublicKey),
      recentBlockhash: blockhash,
      instructions: swapInstructions,
    }).compileToV0Message();
    const swapTx = new VersionedTransaction(swapMessage);

    const signedSwapTx = await provider.signTransaction(swapTx);
    const swapSignature = await connection.sendRawTransaction(
      signedSwapTx.serialize(),
      {
        skipPreflight: true,
        preflightCommitment: "confirmed",
        maxRetries: 5,
      }
    );

    const confirmation = await connection.confirmTransaction(
      { signature: swapSignature, blockhash, lastValidBlockHeight },
      "confirmed"
    );
    if (confirmation.value.err) {
      throw new Error("Transaction confirmation failed");
    }

    console.log("Meteora Swap successful:", swapSignature);
    return swapSignature;
  } catch (error: any) {
    console.error("Meteora Swap error:", error);
    throw new Error(error.message || "Meteora Swap failed: Unknown error");
  }
}

export async function buyToken(params: SwapParams): Promise<string> {
  return executeMeteoraSwap(params);
}

export async function sellToken(params: SwapParams): Promise<string> {
  return executeMeteoraSwap(params);
}
