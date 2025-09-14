import {
  ActivationType,
  BaseFeeMode,
  buildCurve,
  CollectFeeMode,
  DynamicBondingCurveClient,
  MigrationFeeOption,
  MigrationOption,
  TokenDecimal,
  TokenType,
  TokenUpdateAuthorityOption,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import { NATIVE_MINT } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import "dotenv/config";

interface WalletProvider {
  signTransaction: <T extends Transaction>(tx: T) => Promise<T>;
  publicKey: PublicKey;
}

async function createConfig(
  connection: Connection,
  wallet: { address: string; provider: WalletProvider },
  feeClaimerAddress: string
): Promise<PublicKey> {
  const feeClaimer = new PublicKey(feeClaimerAddress || wallet.address); // 默认使用用户地址作为 feeClaimer

  const config = Keypair.generate();
  console.log(`Config account: ${config.publicKey.toString()}`);

  const curveConfig = buildCurve({
    totalTokenSupply: 1000000000,
    percentageSupplyOnMigration: 20,
    migrationQuoteThreshold: 80, // 80 SOL
    migrationOption: MigrationOption.MET_DAMM_V2,
    tokenBaseDecimal: TokenDecimal.SIX,
    tokenQuoteDecimal: TokenDecimal.NINE,
    lockedVestingParam: {
      totalLockedVestingAmount: 0,
      numberOfVestingPeriod: 0,
      cliffUnlockAmount: 0,
      totalVestingDuration: 0,
      cliffDurationFromMigrationTime: 0,
    },
    baseFeeParams: {
      baseFeeMode: BaseFeeMode.FeeSchedulerLinear,
      feeSchedulerParam: {
        startingFeeBps: 100,
        endingFeeBps: 100,
        numberOfPeriod: 0,
        totalDuration: 0,
      },
    },
    dynamicFeeEnabled: true,
    activationType: ActivationType.Slot,
    collectFeeMode: CollectFeeMode.QuoteToken,
    migrationFeeOption: MigrationFeeOption.FixedBps100,
    tokenType: TokenType.SPL,
    partnerLpPercentage: 0,
    creatorLpPercentage: 0,
    partnerLockedLpPercentage: 100,
    creatorLockedLpPercentage: 0,
    creatorTradingFeePercentage: 0,
    leftover: 0,
    tokenUpdateAuthority: TokenUpdateAuthorityOption.Immutable,
    migrationFee: {
      feePercentage: 0,
      creatorFeePercentage: 0,
    },
  });

  console.log("curve config", curveConfig);

  try {
    const client = new DynamicBondingCurveClient(connection, "confirmed");

    const transaction = await client.partner.createConfig({
      config: config.publicKey,
      feeClaimer,
      leftoverReceiver: feeClaimer,
      quoteMint: NATIVE_MINT,
      payer: new PublicKey(wallet.address),
      ...curveConfig,
    });

    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(wallet.address);

    transaction.partialSign(config);

    const signedTransaction = await wallet.provider.signTransaction(
      transaction
    );

    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    await connection.confirmTransaction(signature, "confirmed");

    console.log(`Config created successfully!`);
    console.log(`Transaction: https://solscan.io/tx/${signature}`);
    console.log(`Config address: ${config.publicKey.toString()}`);

    return config.publicKey;
  } catch (error) {
    console.error("Failed to create config:", error);
    throw error;
  }
}

export { createConfig };
