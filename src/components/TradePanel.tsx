"use client";

import {
  getTokenDetail,
  TokenDetailByRaydiumResponse,
  TokenDetailResponse,
} from "@/api/token";
import FancyButton from "@/components/FancyButton";
import { useAuth } from "@/context/AuthContext";
import { shortenAddress } from "@/utils";
import {
  buyToken,
  executeJupiterSwap,
  fetchJupiterQuote,
  fetchMeteoraQuote,
  getSolBalance,
  getTokenPreviousBalance,
  isValidSolanaAddress,
  sellToken,
  SwapParams,
} from "@/utils/swapUtils";
import {
  addToast,
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Tabs,
} from "@heroui/react";
import { Provider } from "@reown/appkit-adapter-solana";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import { memo, useEffect, useRef, useState } from "react";

const BUY_AMOUNT_OPTIONS = ["reset", "point1", "point5", "one", "max"];
const SELL_AMOUNT_OPTIONS = [
  "reset",
  "quarter",
  "half",
  "threequarters",
  "max",
];
const SLIPPAGE_DEFAULT = 5;

interface TradePanelProps {
  address: string;
  tokenSymbol: string;
  solBalance: number;
  tokenBalance: number;
  raydiumData: TokenDetailByRaydiumResponse | undefined;
  tokenData: TokenDetailResponse["data"] | null;
  setSolBalance: (balance: number) => void;
  setTokenBalance: (balance: number) => void;
  setTokenSymbol: (symbol: string) => void;
}

const TradePanel = memo(
  ({
    address,
    tokenSymbol,
    solBalance,
    tokenBalance,
    tokenData,
    setSolBalance,
    setTokenBalance,
    setTokenSymbol,
    raydiumData,
  }: TradePanelProps) => {
    const [amount, setAmount] = useState("");
    const [tradeMode, setTradeMode] = useState<"Buy" | "Sell">("Buy");
    const [isTokenUnit, setIsTokenUnit] = useState(false);
    const [slippage, setSlippage] = useState(SLIPPAGE_DEFAULT);
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [slippageInput, setSlippageInput] = useState(slippage.toString());
    const [calculatedAmounts, setCalculatedAmounts] = useState<
      Record<string, string>
    >({});
    const { open } = useAppKit();
    const { address: userAddress, isConnected } = useAppKitAccount();
    const { walletProvider } = useAppKitProvider<Provider>("solana");
    const { isLoggedIn, signAndLogin } = useAuth();
    const isMounted = useRef(true);

    const isJupiterRoute =
      tokenData?.status === "graduated" ||
      raydiumData?.data?.rows[0]?.migrateAmmId;

    const fetchBalance = async () => {
      if (!userAddress || !address) return;
      setIsDataLoading(true);
      try {
        const [sol, token, tokenDetail] = await Promise.all([
          getSolBalance(userAddress),
          getTokenPreviousBalance(userAddress, address),
          getTokenDetail(address),
        ]);

        if (!isMounted.current) return;

        setSolBalance(sol);
        setTokenBalance(token);

        if (tokenDetail.code === 200 && tokenDetail.data) {
          setTokenSymbol(tokenDetail.data.symbol || "TOKEN");
        } else {
          addToast({
            title: "Token Data Error",
            description: "Failed to fetch token details.",
            color: "danger",
          });
        }
      } catch (error: any) {
        if (!isMounted.current) return;
        console.error("Fetch Balance Failed:", error);
        addToast({
          title: "Error",
          description: error.message || "Failed to fetch balance data",
          color: "danger",
        });
      } finally {
        if (isMounted.current) setIsDataLoading(false);
      }
    };

    const fetchQuote = async (params: SwapParams) => {
      if (isJupiterRoute) {
        const quote = await fetchJupiterQuote(params);
        if (quote.hasRoute) return quote.estimatedOutput;
      }
      const meteoraQuote = await fetchMeteoraQuote(params);
      return meteoraQuote.hasRoute ? meteoraQuote.estimatedOutput : 0;
    };

    const calculateAmount = async (value: string): Promise<string> => {
      if (value === "reset") return "";
      let newAmount: number;
      if (tradeMode === "Buy") {
        if (isTokenUnit) {
          if (value === "max") {
            newAmount = await fetchQuote({
              provider: walletProvider,
              userPublicKey: userAddress || "",
              tokenAddress: address,
              amount: solBalance,
              isBuy: true,
              slippage,
            });
          } else {
            const valueMap: { [key: string]: string } = {
              point1: "0.1",
              point5: "0.5",
              one: "1",
            };
            newAmount = parseFloat(valueMap[value] || "0");
          }
        } else {
          if (value === "max") {
            newAmount = solBalance;
          } else {
            const valueMap: { [key: string]: string } = {
              point1: "0.1",
              point5: "0.5",
              one: "1",
            };
            newAmount = parseFloat(valueMap[value] || "0");
          }
        }
      } else {
        if (isTokenUnit) {
          if (value === "max") {
            newAmount = tokenBalance;
          } else {
            const percentageMap: { [key: string]: number } = {
              quarter: 25,
              half: 50,
              threequarters: 75,
            };
            newAmount = (tokenBalance * (percentageMap[value] || 0)) / 100;
          }
        } else {
          if (value === "max") {
            newAmount = await fetchQuote({
              provider: walletProvider,
              userPublicKey: userAddress || "",
              tokenAddress: address,
              amount: tokenBalance,
              isBuy: false,
              slippage,
            });
          } else {
            const percentageMap: { [key: string]: number } = {
              quarter: 25,
              half: 50,
              threequarters: 75,
            };
            newAmount = (tokenBalance * (percentageMap[value] || 0)) / 100;
            newAmount = await fetchQuote({
              provider: walletProvider,
              userPublicKey: userAddress || "",
              tokenAddress: address,
              amount: newAmount,
              isBuy: false,
              slippage,
            });
          }
        }
      }
      return newAmount.toFixed(6);
    };

    const updateCalculatedAmounts = async () => {
      const options =
        tradeMode === "Buy" ? BUY_AMOUNT_OPTIONS : SELL_AMOUNT_OPTIONS;
      const newCalculatedAmounts: Record<string, string> = {};
      for (const value of options) {
        newCalculatedAmounts[value] = await calculateAmount(value);
      }
      setCalculatedAmounts(newCalculatedAmounts);
    };

    useEffect(() => {
      isMounted.current = true;
      fetchBalance();
      updateCalculatedAmounts();

      return () => {
        isMounted.current = false;
      };
    }, [
      userAddress,
      address,
      tradeMode,
      isTokenUnit,
      solBalance,
      tokenBalance,
      slippage,
      isJupiterRoute,
    ]);

    const handleUnitToggle = async () => {
      const newUnit = !isTokenUnit;
      setIsTokenUnit(newUnit);
      let newAmount = "";
      if (amount) {
        const parsedAmount = parseFloat(amount);
        const swapParams: SwapParams = {
          provider: walletProvider,
          userPublicKey: userAddress || "",
          tokenAddress: address,
          amount: parsedAmount,
          isBuy: tradeMode === "Buy" ? !newUnit : newUnit,
          slippage,
        };

        newAmount = (await fetchQuote(swapParams)).toFixed(6);
      }

      setAmount(newAmount);
      addToast({
        title: `Switched to ${newUnit ? tokenSymbol : "SOL"}`,
        description: `Unit changed to ${newUnit ? tokenSymbol : "SOL"}`,
      });
    };

    const handleAmountSelect = async (value: string) => {
      const calculatedAmount = await calculateAmount(value);
      setAmount(calculatedAmount);
    };

    const handleSetSlippage = () => {
      setIsOpen(true);
    };

    const handleSlippageConfirm = () => {
      const newSlippage = parseFloat(slippageInput);
      if (isNaN(newSlippage) || newSlippage < 0 || newSlippage > 25) {
        addToast({
          title: "Invalid Slippage",
          description: "Please enter a valid slippage percentage (0-25)",
          color: "danger",
        });
        return;
      }
      setSlippage(newSlippage);
      addToast({
        title: `Slippage Set to ${newSlippage}%`,
        description: `Slippage updated to ${newSlippage}%`,
        color: "success",
      });
      setIsOpen(false);
    };

    const handlePlaceTrade = async () => {
      if (!isConnected || !userAddress) {
        addToast({
          title: "Connect Wallet",
          description: "Please connect your wallet to trade",
          color: "warning",
        });
        open();
        return;
      }

      if (!isLoggedIn) {
        addToast({
          title: "Login Required",
          description: "Please log in to trade",
          color: "warning",
        });
        try {
          await signAndLogin();
        } catch (error) {
          addToast({
            title: "Login Failed",
            description: "Unable to log in. Please try again",
            color: "danger",
          });
        }
        return;
      }

      const parsedAmount = parseFloat(amount);
      if (!amount || parsedAmount <= 0) {
        addToast({
          title: "Invalid Amount",
          description: "Please enter a valid amount greater than 0",
          color: "danger",
        });
        return;
      }

      if (!address || !isValidSolanaAddress(address)) {
        addToast({
          title: "Invalid Token Address",
          description: "Please provide a valid token address",
          color: "danger",
        });
        return;
      }

      setIsLoading(true);
      try {
        addToast({
          title: "Processing Trade",
          description: "Your trade is being processed",
        });

        let finalAmount = parsedAmount;
        if (isTokenUnit && tradeMode === "Buy") {
          finalAmount = await fetchQuote({
            provider: walletProvider,
            userPublicKey: userAddress,
            tokenAddress: address,
            amount: parsedAmount,
            isBuy: false,
            slippage,
          });
        } else if (!isTokenUnit && tradeMode === "Sell") {
          finalAmount = await fetchQuote({
            provider: walletProvider,
            userPublicKey: userAddress,
            tokenAddress: address,
            amount: parsedAmount,
            isBuy: true,
            slippage,
          });
        }

        const swapParams: SwapParams = {
          provider: walletProvider,
          userPublicKey: userAddress,
          tokenAddress: address,
          amount: finalAmount,
          isBuy: tradeMode === "Buy",
          slippage,
        };

        let txId: string;
        if (isJupiterRoute) {
          txId = await executeJupiterSwap(swapParams);
        } else {
          txId =
            tradeMode === "Buy"
              ? await buyToken(swapParams)
              : await sellToken(swapParams);
        }

        await fetchBalance();

        addToast({
          title: `Trade Successful: ${shortenAddress(txId)}`,
          color: "success",
        });
        setAmount("");
      } catch (error: any) {
        console.error("Trade Failed:", error);
        addToast({
          title: "Trade Failed",
          description: `Trade failed: ${error.message || "Unknown error"}`,
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const amountOptions =
      tradeMode === "Buy" ? BUY_AMOUNT_OPTIONS : SELL_AMOUNT_OPTIONS;
    const isTradeDisabled =
      isDataLoading || isLoading || !isConnected || !isLoggedIn;

    return (
      <>
        <Card className="border mt-6 border-[#30212E] bg-transparent rounded">
          <CardBody className="p-0">
            <div className="flex gap-2 w-full">
              <Tabs
                radius="sm"
                selectedKey={tradeMode}
                onSelectionChange={(key) => {
                  const newMode = key as "Buy" | "Sell";
                  setTradeMode(newMode);
                  setIsTokenUnit(newMode === "Sell");
                  setAmount("");
                }}
                classNames={{
                  base: "w-full h-[56px]",
                  tabList: "w-full flex bg-transparent gap-0 h-[56px]",
                  cursor:
                    "w-full p-0 border-b-1 border-[#30212e] group-data-[selected=true]:bg-transparent rounded-none group-data-[selected=true]:border-[#fcd845]",
                  tab: "flex-1 p-0 border-b-1 border-[#30212e] w-full rounded-none h-[56px]",
                  tabContent:
                    "group-data-[selected=true]:bg-transparent group-data-[selected=true]:text-[#fcd845] rounded-none text-sm sm:text-base",
                }}
                aria-label="Trade Tabs"
              >
                <Tab key="Buy" title="Buy" />
                <Tab key="Sell" title="Sell" />
              </Tabs>
            </div>
            <div className="px-5 py-[18px]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  variant="bordered"
                  radius="sm"
                  className="w-full sm:flex-1 text-center font-cofo border-none rounded-sm bg-white/5 text-xs text-white h-[30px]"
                  onClick={handleUnitToggle}
                  aria-label={`Switch unit to ${
                    isTokenUnit ? "SOL" : tokenSymbol
                  }`}
                >
                  Switch to {isTokenUnit ? "SOL" : tokenSymbol}
                </Button>
                <Button
                  variant="bordered"
                  radius="sm"
                  className="w-full sm:flex-1 text-center font-cofo border-none rounded-sm bg-white/5 text-xs text-white h-[30px]"
                  onClick={handleSetSlippage}
                  aria-label="Set Slippage"
                >
                  Set Slippage
                </Button>
              </div>
              <div>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (
                      value === "" ||
                      (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))
                    ) {
                      setAmount(value);
                    }
                  }}
                  min="0"
                  step="0.000001"
                  endContent={
                    <span className="text-gray-400">
                      {isTokenUnit ? tokenSymbol : "SOL"}
                    </span>
                  }
                  classNames={{
                    base: "h-12 border border-white/15 rounded-sm mt-5",
                    inputWrapper: [
                      "h-12",
                      "bg-transparent",
                      "border",
                      "border-black",
                      "hover:!bg-transparent",
                      "focus:!bg-transparent",
                    ],
                    input: [
                      "text-white",
                      "text-right",
                      "text-lg sm:text-xl",
                      "font-medium",
                    ],
                  }}
                  aria-label="Amount Input"
                />
              </div>
              <div className="flex mt-4 flex-wrap gap-2 w-full">
                {amountOptions.map((value) => (
                  <Button
                    key={value}
                    variant="bordered"
                    radius="sm"
                    className={`flex-1 h-[30px] min-w-[60px] font-cofo rounded-sm px-2 text-xs mb-6 ${
                      amount === calculatedAmounts[value]
                        ? "text-white"
                        : "text-white/60"
                    } transition-colors`}
                    onClick={() => handleAmountSelect(value)}
                    aria-label={`Select ${
                      value === "reset"
                        ? "Reset"
                        : value === "max"
                        ? "Max"
                        : tradeMode === "Buy"
                        ? value
                        : `${value} percentage`
                    }`}
                  >
                    {value === "reset"
                      ? "Reset"
                      : value === "max"
                      ? "Max"
                      : tradeMode === "Buy"
                      ? { point1: "0.1", point5: "0.5", one: "1" }[value]
                      : { quarter: "25%", half: "50%", threequarters: "75%" }[
                          value
                        ]}
                  </Button>
                ))}
              </div>
              <FancyButton
                className="w-full h-[43px] uppercase rounded-sm text-black text-base font-semibold"
                onClick={handlePlaceTrade}
                buttonText={
                  isDataLoading || isLoading
                    ? "Loading..."
                    : isConnected
                    ? isLoggedIn
                      ? "Place Trade"
                      : "Login to Trade"
                    : "Connect Wallet"
                }
              />
            </div>
          </CardBody>
        </Card>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          backdrop="blur"
          classNames={{
            base: "bg-[#150714] border-none max-w-[90vw] sm:max-w-md rounded-[6px]",
            header: ["p-4 border-b-1 border-white/10", "pb-0"],
            body: "p-6",
            footer: "p-4 sm:p-5 pt-0",
            closeButton: [
              "hover:bg-[#FCD845]",
              "hover:text-black",
              "active:text-black",
              "top-4",
              "right-4",
              "z-10",
              "rounded-sm",
              "bg-[#FCD845]",
              "text-[#000]",
              "w-[18px]",
              "h-[18px]",
              "p-0",
            ],
            backdrop: "bg-black/50 backdrop-blur-sm",
          }}
          role="dialog"
          aria-label="setSlippageModal"
        >
          <ModalContent>
            <ModalHeader className="text-white text-[20px] uppercase">
              Set max slippage
            </ModalHeader>
            <ModalBody>
              <Input
                type="number"
                value={slippageInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (
                    value === "" ||
                    (parseFloat(value) >= 0 && parseFloat(value) <= 25)
                  ) {
                    setSlippageInput(value);
                  }
                }}
                min="0"
                max="25"
                step="0.1"
                placeholder="0 - 25"
                endContent={<span className="text-gray-400">%</span>}
                classNames={{
                  base: "h-12 border border-white/15 rounded-sm",
                  inputWrapper: [
                    "h-12",
                    "bg-transparent",
                    "border",
                    "border-black",
                    "hover:!bg-transparent",
                    "focus:!bg-transparent",
                  ],
                  input: ["text-white", "text-right", "text-lg", "font-medium"],
                }}
                aria-label="Slippage Input"
              />
            </ModalBody>
            <ModalFooter>
              <FancyButton
                className="w-full"
                buttonText="Confirm"
                onClick={handleSlippageConfirm}
              />
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }
);

export default TradePanel;
