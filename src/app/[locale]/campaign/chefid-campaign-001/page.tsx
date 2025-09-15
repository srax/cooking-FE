"use client";

import Image from "next/image";
import Link from "next/link";
import FancyButton from "@/components/FancyButton";
import { useEffect } from "react";

export default function ChefIDCampaignPage() {
  // Hide scrollbars globally for this page
  useEffect(() => {
    // Store original overflow values
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    // Hide scrollbars
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Cleanup function to restore original overflow when component unmounts
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  return (
    <div
      className="flex-col min-h-screen text-white bg-[rgba(19,5,17,1)] overflow-hidden"
      role="main"
      style={{ overflow: 'hidden' }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Diagonal scanlines background */}
        <div className="absolute inset-0 stripes opacity-50" />

        {/* Blurred glow effect */}
        <svg
          className="absolute inset-0"
          width="100%"
          height="100%"
          viewBox="0 0 1311 374"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter
              id="chefid-blur"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur stdDeviation="50" />
            </filter>
          </defs>
          <g filter="url(#chefid-blur)">
            <ellipse cx="655.5" cy="187" rx="555.5" ry="87" fill="#FCD845" fillOpacity="0.3" />
          </g>
        </svg>
      </div>


      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 pt-8">
        <div className="text-center max-w-2xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <Image
              src="/images/logo/logo.png"
              alt="Cooking City Logo"
              width={120}
              height={80}
              className="object-contain"
            />
          </div>

          <h1 className="font-jersey25Regular text-2xl md:text-4xl lg:text-5xl mb-6 text-shadow">
            Cooking city
          </h1>

          <p className="font-cofo text-lg md:text-xl mb-8 text-[#9F9B9F] leading-relaxed">
            Join the ultimate trading identity platform. Build your reputation,
            showcase your skills, and get rewarded!
          </p>

          <div className="space-y-4 mb-12">
            <div className="flex items-center justify-center gap-4">
              <div className="w-2 h-2 bg-[#FCD845] rounded-full animate-pulse"></div>
              <span className="font-cofo text-[#FCD845]">Future token airdrops</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="w-2 h-2 bg-[#FF8DF7] rounded-full animate-pulse"></div>
              <span className="font-cofo text-[#FF8DF7]">cooking city rewards!</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="w-2 h-2 bg-[#1AE371] rounded-full animate-pulse"></div>
              <span className="font-cofo text-[#1AE371]">your complete trader portfolio</span>
            </div>
          </div>

          {/* Get Started Button */}
          <div className="flex justify-center mt-12">
            <Link href="/">
              <FancyButton
                buttonText="GET STARTED"
              />
            </Link>
          </div>

        </div>
      </div>

      {/* Chat1 Character - Bottom Right */}
      <div className="absolute z-0" style={{ bottom: '-120px', right: '640px', width: '800px', height: '800px' }}>
        <img
          src="/images/campaign/chat1.png"
          alt="Chat Character"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Chat2 Character - Bottom Left (mirrored position) */}
      <div className="absolute z-0" style={{ bottom: '-160px', left: '720px', width: '800px', height: '800px' }}>
        <img
          src="/images/campaign/chat2.png"
          alt="Chat Character 2"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-10 w-4 h-4 bg-[#FF8DF7] rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute top-1/3 right-16 w-3 h-3 bg-[#FCD845] rounded-full opacity-40 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-20 w-2 h-2 bg-[#1AE371] rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute bottom-1/3 right-32 w-5 h-5 border border-[#FF8DF7] rounded-full opacity-30"></div>
    </div>
  );
}