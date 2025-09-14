import type { Metadata } from "next";

import ContextProvider from "@/context";
import { AuthProvider } from "@/context/AuthContext";
import { PriceProvider } from "@/context/PriceContext";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cooking City | A Pioneering Nation for Onchain Fair Launches",
  description:
    "Backed by Jump Crypto and CMT Digital, Cooking.City is a pioneering platform on Solana empowering 6 billion people with fair, transparent, and sustainable onchain token launches. We ensure equitable token distribution, robust price protection through our innovative Conviction Pool, and Referral Mechanism. Whether you're a dev launching the next big token or a trader seeking early alpha, Cooking.City fosters a thriving ecosystem where devs, believers, and traders align. Join the onchain renaissance today!",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  return (
    <html lang={params.locale} className="dark custom-cursor">
      <head>
        <meta
          property="description"
          content="Backed by Jump Crypto and CMT Digital, Cooking.City is a pioneering platform on Solana empowering 6 billion people with fair, transparent, and sustainable onchain token launches. We ensure equitable token distribution, robust price protection through our innovative Conviction Pool, and Referral Mechanism. Whether you're a dev launching the next big token or a trader seeking early alpha, Cooking.City fosters a thriving ecosystem where devs, believers, and traders align. Join the onchain renaissance today!"
        />
        <meta
          property="og:title"
          content="Cooking City | A Pioneering Nation for Onchain Fair Launches"
        />
        <meta
          property="og:description"
          content="Backed by Jump Crypto and CMT Digital, Cooking.City is a pioneering platform on Solana empowering 6 billion people with fair, transparent, and sustainable onchain token launches. We ensure equitable token distribution, robust price protection through our innovative Conviction Pool, and Referral Mechanism. Whether you're a dev launching the next big token or a trader seeking early alpha, Cooking.City fosters a thriving ecosystem where devs, believers, and traders align. Join the onchain renaissance today!"
        />
        <meta property="og:url" content="https://cooking.city/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cooking.city/icon.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta
          property="og:site_name"
          content="Cooking City | A Pioneering Nation for Onchain Fair Launches"
        />
        <meta property="image" content="https://cooking.city/icon.jpg" />
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-VP5TWTT5PM"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-VP5TWTT5PM');
            `,
          }}
        />
      </head>
      <body>
        <ContextProvider>
          <HeroUIProvider>
            <ToastProvider />
            <PriceProvider>
              <AuthProvider>{children}</AuthProvider>
            </PriceProvider>
          </HeroUIProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
