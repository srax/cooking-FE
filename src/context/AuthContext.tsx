"use client";

import { fetchUserInfo, login } from "@/api/user";
import type { Provider } from "@reown/appkit-adapter-solana";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
  useDisconnect,
} from "@reown/appkit/react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface UserInfo {
  profile: {
    address: string;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    nick_name: string;
    twitter_screen_name?: string | null;
    telegram_username?: string | null;
    points: number | null;
  };
}

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  address: string | undefined;
  isConnected: boolean;
  userInfo: UserInfo | null;
  signAndLogin: () => Promise<void>;
  logout: () => void;
  checkLoginStatus: () => Promise<void>;
  getUserPoints: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const validateToken = async (token: string): Promise<UserInfo | null> => {
  try {
    const result = await fetchUserInfo(token);
    return result;
  } catch (error) {
    console.error("Token验证失败:", error);
    return null;
  }
};

const getInitialLoginStatus = (): boolean => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    return !!token;
  }
  return false;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { open } = useAppKit();
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    getInitialLoginStatus()
  );
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [hasRejectedSignature, setHasRejectedSignature] =
    useState<boolean>(false);

  const { disconnect } = useDisconnect();
  const checkLoginStatus = useCallback(async () => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("token");
    if (!isConnected) {
      setUserInfo(null);
      setLoading(false);
      return;
    }
    if (token) {
      const userData = await validateToken(token);
      if (userData) {
        setIsLoggedIn(true);
        setUserInfo(userData);
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
        localStorage.removeItem("token");
      }
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }
    setLoading(false);
    setHasInitialized(true);
  }, [isConnected]);

  const signAndLogin = useCallback(
    async (isManual: boolean = false) => {
      if (!isConnected || !address || !walletProvider || isConnecting) {
        console.error(
          "Wallet not connected, missing address, or connection in progress"
        );
        if (!isConnected && !isConnecting) {
          setIsConnecting(true);
          try {
            await open();
            setIsConnecting(false);
          } catch (error) {
            console.error("Wallet connection failed:", error);
            setIsConnecting(false);
            return;
          }
        }
        return;
      }

      if (isManual) {
        setHasRejectedSignature(false);
      }
      setLoading(true);
      try {
        const messageToSign = "cooking.city";
        const encodedMessage = new TextEncoder().encode(messageToSign);
        const signature = await walletProvider.signMessage(encodedMessage);
        const loginParams = {
          invite_code: null,
          message: messageToSign,
          public_key: address,
          signature: Buffer.from(signature).toString("hex"),
        };
        const res = await login(loginParams);
        if (res) {
          localStorage.setItem("token", res);
          setIsLoggedIn(true);
          setHasRejectedSignature(false);
          const userData = await validateToken(res);
          setUserInfo(userData);
          window.dispatchEvent(new Event("loginStatusChanged"));
        } else {
          console.error("Login failed: No token returned");
        }
      } catch (error) {
        console.error("Signature or login failed:", error);
        if (error instanceof Error && error.message.includes("User rejected")) {
          console.log("User rejected signature");
          setHasRejectedSignature(true);
        }
      } finally {
        setLoading(false);
      }
    },
    [address, walletProvider, isConnected, open, isConnecting]
  );

  const logout = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setIsLoggedIn(false);
    setHasRejectedSignature(false);
    setUserInfo(null);
    useDisconnect();
    try {
      await disconnect(); // 调用断开连接
      router.push("/");
      console.log("钱包已断开连接");
    } catch (error) {
      console.error("断开连接失败:", error);
    }
  }, []);

  const getUserPoints = useCallback(() => {
    return userInfo?.profile.points?.toString() ?? "0";
  }, [userInfo]);

  useEffect(() => {
    if (isConnected && !hasInitialized) {
      checkLoginStatus();
    } else if (
      isConnected &&
      hasInitialized &&
      !isLoggedIn &&
      !loading &&
      !isConnecting &&
      !hasRejectedSignature
    ) {
      signAndLogin(false);
    } else if (!isConnected) {
      setLoading(false);
      setIsConnecting(false);
      setHasRejectedSignature(false);
    }
    const handleLoginStatusChange = () => {
      if (isConnected && !hasInitialized) checkLoginStatus();
    };
    window.addEventListener("loginStatusChanged", handleLoginStatusChange);
    return () =>
      window.removeEventListener("loginStatusChanged", handleLoginStatusChange);
  }, [isConnected, checkLoginStatus, hasInitialized]);

  useEffect(() => {
    if (!isConnected && isLoggedIn && hasInitialized && !loading) {
      logout();
    }
  }, [
    isConnected,
    isLoggedIn,
    loading,
    logout,
    hasInitialized,
    isConnecting,
    hasRejectedSignature,
  ]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        address,
        isConnected,
        userInfo,
        signAndLogin,
        logout,
        checkLoginStatus,
        getUserPoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
