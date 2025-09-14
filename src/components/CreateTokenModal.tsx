"use client";

import { uploadImageToIPFS } from "@/api/upload";
import FancyButton from "@/components/FancyButton";
import pot from "@/components/lottie/pot.json";
import { usePrice } from "@/context/PriceContext";
import { formatQuantity } from "@/utils";
import {
  addToast,
  Button,
  Input,
  Slider,
  Spinner,
  Textarea,
  Tooltip,
} from "@heroui/react";
import type { Provider } from "@reown/appkit-adapter-solana";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import Bignumber from "bignumber.js";
import Decimal from "decimal.js";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaCheck, FaChevronRight } from "react-icons/fa6";
import { IoClose, IoCloseSharp } from "react-icons/io5";
import { RiImageAddLine } from "react-icons/ri";
import { createToken, getTokenDetail } from "../api/token";
import { signAndSendTransaction, TokenParams } from "../utils/transaction";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const BASIS_POINT_MAX = 10000;
const TOKEN_DECIMALS = 6;
const WSOL_DECIMALS = 9;
const BIN_STEP = 400;

const priceOfBin = (binId: number, binStep: number): Decimal => {
  const binStepNum = new Decimal(binStep).div(BASIS_POINT_MAX);
  return new Decimal(1).plus(binStepNum).pow(binId);
};

const pricePerToken = (price: Decimal): Decimal => {
  const decimalsDiff = new Decimal(TOKEN_DECIMALS).minus(WSOL_DECIMALS);
  return price.times(new Decimal(10).pow(decimalsDiff));
};

const getByteLength = (str: string): number => {
  return new TextEncoder().encode(str).length;
};

const isValidTickerBytes = (value: string): boolean => {
  const byteLength = getByteLength(value);
  return byteLength >= 3 && byteLength <= 10;
};

interface TokenFormData {
  name: string;
  symbol: string;
  description: string;
  twitter: string;
  telegram: string;
  discord: string;
  initialBuy: number;
  currentPrice: number;
  protectedPrice: number;
  binId: number;
  imageUri?: string;
  isAntiSniper: boolean;
}

const CreateTokenModal: React.FC<{
  isOpen: boolean;
  onOpenChange: () => void;
  className?: string;
}> = ({ isOpen, onOpenChange, className }) => {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { open } = useAppKit();
  const { prices } = usePrice();
  const [isSubmitting, setIsSubmitting] = useState(false); // 新增：控制提交状态
  const [formData, setFormData] = useState<TokenFormData>({
    name: "",
    symbol: "",
    description: "",
    twitter: "",
    telegram: "",
    discord: "",
    initialBuy: 0,
    currentPrice: 0,
    protectedPrice: pricePerToken(priceOfBin(-200, BIN_STEP)).toNumber(),
    binId: -300,
    imageUri: "",
    isAntiSniper: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tickerError, setTickerError] = useState<string>("");
  const [tgError, setTgError] = useState<string>("");
  const [twError, setTwError] = useState<string>("");
  const [dsError, setDsError] = useState<string>("");
  const router = useRouter();
  const [imageUriLoading, setImageUriLoading] = useState<boolean>(false);
  const getDetailsIntervalRef = useRef<NodeJS.Timeout | null>(null); // 新增：保存定时器引用

  useEffect(() => {
    return () => {
      if (getDetailsIntervalRef.current) {
        clearInterval(getDetailsIntervalRef.current);
      }
    };
  }, []);

  const handleImageUpload = useCallback((uri: string) => {
    setFormData((prev) => ({ ...prev, imageUri: uri }));
    addToast({
      title: "Upload successful",
      description: "The image has been successfully uploaded to IPFS",
      color: "success",
    });
  }, []);

  const clearIPFSImages = () => {
    setFormData((prev) => ({ ...prev, imageUri: "" }));
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    console.log("Image object URL:", objectUrl);

    try {
      setImageUriLoading(true);
      const ipfsUri = await uploadImageToIPFS(file);
      handleImageUpload(ipfsUri);
    } catch (error) {
      addToast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload image to IPFS",
        color: "danger",
      });
    } finally {
      setImageUriLoading(false);
      event.target.value = "";
    }
  };

  const handleInputChange = (
    field: keyof TokenFormData,
    value: string | number
  ) => {
    if (field === "name") {
      const strValue = value as string;
      const byteLength = getByteLength(strValue);
      if (byteLength > 32) {
        setTickerError(`Ticker byte length is ${byteLength}, max is 32`);
        return;
      }
      setTickerError("");
      setFormData((prev) => ({ ...prev, [field]: strValue }));
    }
    if (field === "twitter" || field === "discord" || field === "telegram") {
      const strValue = value as string;
      if (strValue.length > 100) {
        if (field === "twitter") {
          setTwError(`Socials link length is ${strValue.length}, max is 100`);
          return;
        } else if (field === "discord") {
          setDsError(`Socials link length is ${strValue.length}, max is 100`);
          return;
        } else {
          setTgError(`Socials link length is ${strValue.length}, max is 100`);
          return;
        }
      }
      setTwError("");
      setDsError("");
      setTgError("");

      setFormData((prev) => ({ ...prev, [field]: strValue }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSliderChange = (value: number) => {
    const binId = Math.round(value);
    const price = priceOfBin(binId, BIN_STEP);
    const tokenPrice = pricePerToken(price);
    setFormData((prev) => ({
      ...prev,
      binId,
      protectedPrice: tokenPrice.toNumber(),
    }));
  };

  const handleInitialBuy = (value: number) => {
    setFormData((prev) => ({ ...prev, initialBuy: value }));
  };

  const handleInitialBuyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, initialBuy: value as any }));
  };

  const handleInitialBuyInput = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setFormData((prev) => ({ ...prev, initialBuy: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, initialBuy: 0 }));
    }
  };

  const handleConvictionAmount = (value: string) => {
    setFormData((prev) => ({ ...prev, currentPrice: Number(value) }));
  };
  const handleChangeAntiSniper = (value: boolean) => {
    setFormData((prev) => ({ ...prev, isAntiSniper: value }));
  };

  const onSubmit = async () => {
    if (isSubmitting) {
      console.log("Transaction already in progress, ignoring...");
      return;
    }
    if (formData.currentPrice > 0 && formData.initialBuy <= 0) {
      addToast({
        title: "Invalid Input",
        description:
          "Initial buy amount must be greater than 0 when setting conviction amount",
        color: "danger",
      });
      return;
    }
    // if (formData.currentPrice > 0 && formData.currentPrice < 10) {
    //   addToast({
    //     title: "Invalid Input",
    //     description: "conviction amount must be greater than 10 ",
    //     color: "danger",
    //   });
    //   return;
    // }

    if (!formData.symbol || formData.symbol.length < 2) {
      addToast({
        title: "Invalid Symbol",
        description: "Symbol must be at least 2 characters",
        color: "danger",
      });
      return;
    }

    if (!isConnected || !address || !walletProvider) {
      addToast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to proceed",
        color: "danger",
      });
      await open();
      return;
    }

    setIsSubmitting(true);
    try {
      addToast({
        title: "Processing",
        description: "Creating your token...",
        color: "default",
      });

      const buyAmount =
        formData.initialBuy === 0
          ? 0
          : Math.round((formData.initialBuy / 100) * 100 * LAMPORTS_PER_SOL);
      const insuranceAmt = Math.round(formData.currentPrice * LAMPORTS_PER_SOL);
      const insurancePx = Math.round(
        formData.protectedPrice * LAMPORTS_PER_SOL
      );

      const connection = new Connection(
        process.env.NEXT_PUBLIC_IS_DEV === "false"
          ? process.env.NEXT_PUBLIC_RPC_URL ||
            "https://api.mainnet-beta.solana.com"
          : process.env.NEXT_PUBLIC_DEV_RPC_URL || "",
        "confirmed"
      );
      const userPubkey = new PublicKey(address);
      const balance = await connection.getBalance(userPubkey);
      const requiredBalance =
        buyAmount +
        0.01 * LAMPORTS_PER_SOL +
        formData.currentPrice * LAMPORTS_PER_SOL;
      if (balance < requiredBalance) {
        addToast({
          title: "Insufficient Balance",
          description: "Your wallet does not have enough SOL",
          color: "danger",
        });
        return;
      }

      const metadata = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image: formData.imageUri || "",
        external_url: "",
        attributes: [],
        properties: {
          files: formData.imageUri
            ? [{ uri: formData.imageUri, type: "image" }]
            : [],
          category: "image",
        },
        social_links: {
          ...(formData.twitter && { twitter: `${formData.twitter}` }),
          ...(formData.telegram && { telegram: `${formData.telegram}` }),
          ...(formData.discord && { discord: `${formData.discord}` }),
        },
      };

      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });
      const metadataFile = new File([metadataBlob], "metadata.json", {
        type: "application/json",
      });
      const metadataUri = await uploadImageToIPFS(metadataFile);

      const createParams = {
        insurance_amt: formData.currentPrice,
        insurance_px: formData.protectedPrice,
        name: formData.name,
        symbol: formData.symbol,
        uri: metadataUri,
        user_pubkey: address,
        network:
          process.env.NEXT_PUBLIC_IS_DEV === "false" ? "mainnet" : "devnet",
        platform: "meteora",
        platform_params: "",
      };

      const tokenResponse = await createToken(createParams);
      if (!tokenResponse?.data?.mint) {
        throw new Error("Failed to get mint from token creation response");
      }

      const tokenParams: TokenParams = {
        name: formData.name,
        symbol: formData.symbol,
        uri: metadataUri,
        insuranceAmt,
        insurancePx,
        userPubkey: address,
        mint: tokenResponse.data.mint,
        buyAmount,
        binId: formData.binId,
        isAntiSniper: formData.isAntiSniper,
      };

      console.log(
        "Submitting token creation transaction with params:",
        tokenParams
      );

      const { signatures, mintPubkey } = await signAndSendTransaction(
        connection,
        tokenParams,
        { address, provider: walletProvider as any },
        {
          skipPreflight: true,
          preflightCommitment: "confirmed",
          maxRetries: 5,
        }
      );

      addToast({
        title: "Token Created",
        description: `Token ${formData.name} (${
          formData.symbol
        }) created successfully! TxID: ${signatures[0].slice(0, 8)}...`,
        color: "success",
      });

      setFormData({
        name: "",
        symbol: "",
        description: "",
        twitter: "",
        telegram: "",
        discord: "",
        initialBuy: 0,
        currentPrice: 0,
        protectedPrice: pricePerToken(priceOfBin(-300, BIN_STEP)).toNumber(),
        binId: -300,
        imageUri: "",
        isAntiSniper: false,
      });

      // 等待 token 详情可用
      await new Promise<void>((resolve) => {
        getDetailsIntervalRef.current = setInterval(async () => {
          try {
            const res = await getTokenDetail(mintPubkey);
            if (res.code === 200) {
              clearInterval(getDetailsIntervalRef.current!);
              onOpenChange();
              setTimeout(() => {
                router.push(`/en/detail/${mintPubkey}`);
                resolve();
              }, 200);
            }
          } catch (err) {
            console.error("Failed to get token details:", err);
          }
        }, 1000);
      });
    } catch (error) {
      console.error("Submit error:", error);
      let errorMessage = "Failed to create token";
      if (error instanceof Error) {
        if (error.message.includes("already been processed")) {
          errorMessage =
            "Transaction already processed. Please check the blockchain.";
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient balance";
        } else if (error.message.includes("slippage")) {
          errorMessage = "Slippage error";
        } else {
          errorMessage = error.message;
        }
      }
      addToast({
        title: "Error",
        description: errorMessage,
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageVariants = {
    initial: { rotateY: 90, opacity: 0 },
    in: { rotateY: 0, opacity: 1 },
    out: { rotateY: -90, opacity: 0 },
  };

  const pageTransition = {
    type: "tween",
    duration: 0.5,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md z-50 flex items-center justify-center px-4 max-sm:px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`bg-[#1A0D1A] rounded-lg shadow-lg w-full max-w-[400px] max-sm:max-w-[90%] no-scrollbar md:max-w-[460px] overflow-x-hidden text-center text-white border border-[#332231] ${className}`}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key="step1"
                  variants={pageVariants}
                  initial="initial"
                  animate="in"
                  exit="out"
                  transition={pageTransition}
                >
                  <div className="flex justify-between items-center p-4 max-sm:p-3 border-b border-[#332231]">
                    <div className="text-lg max-sm:text-base md:text-xl font-bold uppercase flex items-end">
                      <Lottie
                        animationData={pot}
                        className="w-[40px] max-sm:w-[30px]"
                        loop
                      />
                      <span className="ml-2 max-sm:ml-1 max-sm:text-sm">
                        COOK A NEW TOKEN
                      </span>
                    </div>
                    <button
                      onClick={onOpenChange}
                      className="text-[#000] w-5 h-5 max-sm:w-4 max-sm:h-4 bg-[#fcd845] rounded-sm flex items-center justify-center"
                    >
                      <IoCloseSharp className="w-5 h-5 max-sm:w-4 max-sm:h-4" />
                    </button>
                  </div>

                  <div className="p-4 max-sm:p-3 text-left max-h-[60vh] max-sm:max-h-[70vh] overflow-y-auto no-scrollbar">
                    <div className="flex p-2 items-center rounded-[0.125rem] bg-[rgba(252,216,69,0.15)] h-[2.125rem] mb-4">
                      <Image
                        src={"/images/header/fee.svg"}
                        width={12}
                        className="flex-shrink-0 mr-[.625rem]"
                        height={12}
                        alt={"fee"}
                      />
                      <p className="text-base">
                        Creator earns{" "}
                        <span className="text-sm text-[#FCD845]"> 10%</span> of
                        trading fees. Create token now!
                      </p>
                    </div>
                    <div className="text-base max-sm:text-sm uppercase">
                      NEW TOKEN INFORMATION{" "}
                      <span className="text-[#FA2256]">*</span>
                    </div>
                    <Input
                      placeholder="Ticker"
                      value={formData.symbol}
                      onChange={(e) =>
                        handleInputChange("symbol", e.target.value)
                      }
                      className="mt-2 max-sm:mt-1"
                      classNames={{
                        inputWrapper:
                          "rounded-sm bg-transparent border border-white/15 text-sm max-sm:text-xs",
                      }}
                    />
                    <Input
                      placeholder="Coin name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      isInvalid={!!tickerError}
                      errorMessage={tickerError}
                      className="mt-2 max-sm:mt-1"
                      classNames={{
                        inputWrapper:
                          "rounded-sm bg-transparent border border-white/15 text-sm max-sm:text-xs",
                      }}
                    />
                    <Textarea
                      placeholder="Description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      className="mt-2 max-sm:mt-1"
                      classNames={{
                        inputWrapper:
                          "rounded-sm bg-transparent border border-white/15 text-sm max-sm:text-xs",
                      }}
                    />
                    <input
                      ref={fileInputRef}
                      id="upload-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {formData.imageUri && (
                      <div className="flex justify-center">
                        <div className="relative">
                          <Image
                            src={formData.imageUri}
                            alt="Uploaded Image"
                            width={250}
                            height={250}
                            className="rounded-[6px] relative max-sm:w-[200px] max-sm:h-[200px] md:w-[200px] md:h-[200px] object-cover"
                          />
                          <div
                            onClick={clearIPFSImages}
                            className="absolute right-[0px] top-[0px] w-[22px] h-[22px] flex items-center justify-center rounded-bl-[14px] rounded-tl-none rounded-tr-[3px] rounded-br-none bg-black opacity-[0.3]"
                          >
                            <IoClose className="w-full h-full opacity-[1]" />
                          </div>
                        </div>
                      </div>
                    )}
                    {imageUriLoading ? (
                      <div className="flex items-center justify-center w-full">
                        <Spinner color="default" className="my-[10px]" />
                      </div>
                    ) : formData.imageUri ? (
                      <></>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center capitalize mt-6 max-sm:mt-4 gap-2 w-full h-11 max-sm:h-9 bg-[#332231]"
                      >
                        <RiImageAddLine className="w-[15px] h-[15px] max-sm:w-[12px] max-sm:h-[12px]" />
                        <p className="text-sm max-sm:text-xs">
                          Upload Pictures
                        </p>
                      </div>
                    )}
                    <div className="text-base max-sm:text-sm text-white mt-6 max-sm:mt-4 mb-2">
                      ADD SOCIALS{" "}
                      <span className="text-[#857A83]">(OPTIONAL)</span>
                    </div>
                    <Input
                      placeholder="Telegram Link"
                      value={formData.telegram}
                      onChange={(e) =>
                        handleInputChange("telegram", e.target.value)
                      }
                      className="mt-2 max-sm:mt-1"
                      isInvalid={!!tgError}
                      errorMessage={tgError}
                      classNames={{
                        inputWrapper:
                          "rounded-sm bg-transparent border border-white/15 text-sm max-sm:text-xs",
                      }}
                    />
                    <Input
                      placeholder="X Link"
                      value={formData.twitter}
                      onChange={(e) =>
                        handleInputChange("twitter", e.target.value)
                      }
                      isInvalid={!!twError}
                      errorMessage={twError}
                      className="mt-2 max-sm:mt-1"
                      classNames={{
                        inputWrapper:
                          "rounded-sm bg-transparent border border-white/15 text-sm max-sm:text-xs",
                      }}
                    />
                    <Input
                      placeholder="Discord Link"
                      value={formData.discord}
                      onChange={(e) =>
                        handleInputChange("discord", e.target.value)
                      }
                      isInvalid={!!dsError}
                      errorMessage={dsError}
                      className="mt-2 max-sm:mt-1"
                      classNames={{
                        inputWrapper:
                          "rounded-sm bg-transparent border border-white/15 text-sm max-sm:text-xs",
                      }}
                    />
                    <div className="text-base max-sm:text-sm text-white mt-4 max-sm:mt-3 mb-2 uppercase">
                      Token to Purchase{" "}
                      <span className="text-[#857A83]">(Optional)</span>
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Enter SOL amount"
                        value={formData.initialBuy.toString()}
                        onBlur={(e) => handleInitialBuyInput(e.target.value)}
                        onChange={(e) => handleInitialBuyChange(e.target.value)}
                        className="mt-2 max-sm:mt-1"
                        classNames={{
                          inputWrapper:
                            "rounded-sm bg-transparent border border-white/15 text-sm max-sm:text-xs",
                        }}
                        endContent={
                          <div className="flex items-center">
                            <p className="text-sm max-sm:text-xs">SOL</p>
                            <Image
                              src={"/images/logo/solana.svg"}
                              alt="solana"
                              width={24}
                              height={24}
                              className="max-sm:w-5 max-sm:h-5"
                            />
                          </div>
                        }
                      />
                      <div className="flex gap-2 mt-2 max-sm:mt-1 max-sm:grid max-sm:grid-cols-2 max-sm:gap-1">
                        {[0.1, 1, 5, 10].map((value) => (
                          <Button
                            key={value}
                            onPress={() => handleInitialBuy(value)}
                            className={`flex-1 h-[26px] max-sm:h-[22px] text-sm max-sm:text-xs ${
                              formData.initialBuy === value
                                ? "bg-[#FCD9441A]/10 text-white border border-[#FCD944]"
                                : "bg-white/5 text-[#857A83] border-none"
                            } hover:bg-[#FCD9441A]/10 rounded-sm font-cofo`}
                          >
                            {value} SOL
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs max-sm:text-[10px] text-[#857A83] font-cofo mt-4 max-sm:mt-3">
                      Cost{" "}
                      <span className="text-white">
                        {formData.initialBuy} SOL ($
                        {(
                          formData.initialBuy * (prices?.solusdt || 170)
                        ).toFixed(2)}
                        )
                      </span>
                    </div>
                    <div className="text-base max-sm:text-sm text-white mt-6 max-sm:mt-4 uppercase mb-2">
                      Conviction Pool{" "}
                      <span className="text-[#857A83]">(Optional)</span>
                    </div>
                    <div className="text-sm max-sm:text-xs text-[#857A83] font-cofo">
                      Lock SOL and set a price. If your token drops below that
                      price, ur token will be swapped into conviction sol as
                      safety net. If not, you can claim back the SOL in few
                      days.
                    </div>
                    <div className="text-sm max-sm:text-xs text-white font-cofo mt-6 max-sm:mt-4 mb-2">
                      Trigger Price
                    </div>
                    <Slider
                      step={1}
                      minValue={-260}
                      maxValue={-200}
                      value={formData.binId}
                      onChange={(value) => handleSliderChange(value as number)}
                      className="w-full"
                      aria-label="Trigger Price Slider"
                      classNames={{
                        filler: "bg-stripe-pink rounded-lg",
                        track: "bg-[#473846] !border-[#473846] border-none  ",
                        thumb: "custom-thumb",
                        trackWrapper: "rounded-lg",
                      }}
                    />
                    <div className="flex flex-col mt-6 max-sm:mt-4 items-center">
                      <p className="text-[24px] max-sm:text-lg leading-none text-[#FF8DF7]">
                        ~$
                        {formatQuantity(
                          new Bignumber(1000000000)
                            .times(formData.protectedPrice)
                            .times(prices?.solusdt || 170)
                            .toString()
                        )}{" "}
                        Market Cap
                      </p>
                      {/* <p className="font-cofo text-sm max-sm:text-xs">
                        Token Price: [{formatQuantity(formData.protectedPrice)}]
                        SOL
                      </p> */}
                    </div>
                    <div className="text-sm max-sm:text-xs text-white font-cofo mt-6 max-sm:mt-4 mb-2">
                      Conviction Amount
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Min. 10 SOL"
                        value={formData.currentPrice.toString()}
                        onChange={(e) => handleConvictionAmount(e.target.value)}
                        className="mt-2 max-sm:mt-1"
                        classNames={{
                          inputWrapper:
                            "rounded-sm bg-transparent border border-white/15 text-sm max-sm:text-xs",
                        }}
                        endContent={
                          <div className="flex items-center">
                            <p className="text-sm max-sm:text-xs">SOL</p>
                            <Image
                              src={"/images/logo/solana.svg"}
                              alt="solana"
                              width={24}
                              height={24}
                              className="max-sm:w-5 max-sm:h-5"
                            />
                          </div>
                        }
                      />
                      <div className="flex gap-2 mt-2 max-sm:mt-1 max-sm:grid max-sm:grid-cols-2 max-sm:gap-1">
                        {[10, 20, 50, 100].map((value) => (
                          <Button
                            key={value}
                            onPress={() =>
                              handleConvictionAmount(value.toString())
                            }
                            className={`flex-1 h-[26px] max-sm:h-[22px] text-sm max-sm:text-xs ${
                              formData.currentPrice === value
                                ? "bg-[#FCD9441A]/10 text-white border border-[#FCD944]"
                                : "bg-white/5 text-[#857A83] border-none"
                            } hover:bg-[#FCD9441A]/10 rounded-sm font-cofo`}
                          >
                            {value} SOL
                          </Button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2 relative ">
                        <input
                          type="checkbox"
                          id="anti-sniper-checkbox"
                          checked={formData.isAntiSniper}
                          onChange={(e) =>
                            handleChangeAntiSniper(e.target.checked)
                          }
                          className="appearance-none w-4 h-4 border-2 border-[#473745] bg-[#271B24] rounded-sm checked:bg-[#FCD944] checked:border-[#FCD944] cursor-pointer relative flex items-center justify-center"
                        />
                        {formData.isAntiSniper && (
                          <FaCheck
                            onClick={() => {
                              handleChangeAntiSniper(!formData.isAntiSniper);
                            }}
                            className="absolute cursor-pointer text-black text-xs font-bold top-1/2 left-[8px] -translate-x-1/2 -translate-y-1/2"
                          />
                        )}
                        <label
                          htmlFor="anti-sniper-checkbox"
                          className="text-base text-white cursor-pointer"
                        >
                          Enable Anti-snipe
                        </label>
                        <Tooltip
                          content={
                            <p className="text-xs font-cofo max-w-[200px]">
                              Trading fees would be set up to 50% for the first
                              few minutes of trading to deter token sniping
                            </p>
                          }
                          classNames={{
                            content: "bg-[#332231] rounded-sm",
                          }}
                        >
                          <Image
                            src={"/images/create/tooltip.svg"}
                            alt="tooltip"
                            width={16}
                            height={16}
                          />
                        </Tooltip>
                      </div>
                    </div>
                    <div className="mt-6 max-sm:mt-4 flex justify-center">
                      <FancyButton
                        className="w-[165px] max-sm:w-[140px]"
                        buttonText={
                          isSubmitting ? "CREATING..." : "CREATE TOKEN"
                        }
                        onClick={onSubmit}
                        endIcon={<FaChevronRight className="text-black" />}
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateTokenModal;
