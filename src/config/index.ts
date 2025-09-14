import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { solana, solanaDevnet } from "@reown/appkit/networks";
import enMessages from "../../messages/en.json";
import zhCNMessages from "../../messages/zh.json";

// Get projectId from https://cloud.reown.com
export const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID || "4a3739b9614071e3514dc7615a207361"; // this is a public projectId only to use on localhost

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const networks = [solana, solanaDevnet] as [
  AppKitNetwork,
  ...AppKitNetwork[]
];

export const solanaWeb3JsAdapter = new SolanaAdapter();

export const Messages = {
  en: enMessages,
  zh: zhCNMessages,
} as const;
