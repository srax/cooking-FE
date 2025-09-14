"use client";

import { solanaWeb3JsAdapter } from "@/config";
import { solana } from "@reown/appkit/networks";
import { createAppKit, type AppKit } from "@reown/appkit/react";
import type { ReactNode } from "react";
import { createContext, useMemo } from "react";

const metadata = {
  name: "Cooking City | A Pioneering Nation for Onchain Fair Launches",
  description:
    "Backed by Jump Crypto and CMT Digital, Cooking.City is a pioneering platform on Solana empowering 6 billion people with fair, transparent, and sustainable onchain token launches. We ensure equitable token distribution, robust price protection through our innovative Conviction Pool, and Referral Mechanism. Whether you're a dev launching the next big token or a trader seeking early alpha, Cooking.City fosters a thriving ecosystem where devs, believers, and traders align. Join the onchain renaissance today!",
  url: "https://cooking.city/en",
  icons: ["https://cooking.city/images/logo/cooking_city_logo.svg"],
};

interface AppKitContextType {
  projectId: string | undefined;
  appKit: AppKit | undefined;
}

export const AppKitContext = createContext<AppKitContextType>({
  projectId: undefined,
  appKit: undefined,
});

export function ContextProvider({
  children,
  injectedProjectId,
}: {
  children: ReactNode;
  injectedProjectId?: string;
}) {
  const appKit = useMemo(() => {
    return createAppKit({
      adapters: [solanaWeb3JsAdapter],
      projectId: "4a3739b9614071e3514dc7615a207361",
      networks: [solana],
      metadata,
      themeMode: "dark",
      showWallets: false,
      features: {
        analytics: false,
        email: false,
        socials: false,
        onramp: false,
        // allWallets: false,
      },
      enableWalletGuide: false,
      enableNetworkSwitch: false,
      enableWalletConnect: false,
      defaultNetwork: solana,
      featuredWalletIds: [
        "971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709",
        "aba1f652e61fd536e8a7a5cd5e0319c9047c435ef8f7e907717361ff33bb3588",
      ],
      themeVariables: {
        "--w3m-accent": "#000000",
      },
    });
  }, []);
  return (
    <AppKitContext.Provider
      value={{
        projectId: "4a3739b9614071e3514dc7615a207361",
        appKit,
      }}
    >
      {appKit ? children : null}
    </AppKitContext.Provider>
  );
}

export default ContextProvider;
