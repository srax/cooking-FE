import Image from "next/image";
import PentagonChart from "./PentagonChart";

interface SocialCardProps {
  userName?: string;
  userAddress?: string;
  userInitial?: string;
  rank?: string;
  pnl?: string;
  followers?: string;
  earnings?: string;
  volume?: number;
  onChain?: number;
  duration?: number;
  twitter?: number;
  pnlRate?: number;
}

export default function SocialCard({
  userName = "USER NAME",
  userAddress = "0x13.12233gb",
  userInitial = "U",
  rank = "II",
  pnl = "$10k",
  followers = "30k",
  earnings = "2.2M",
  volume = 50,
  onChain = 20,
  duration = 20,
  twitter = 15,
  pnlRate = 20,
}: SocialCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-6">
      <div className="relative bg-gradient-to-r from-[#1a0f2e] to-[#2d1b4e] rounded-xl p-4 border border-[#332231] overflow-hidden">
        {/* Background Pattern - Reduced */}
    
     
        
        <div className="relative z-10">
          {/* Top Section */}
                 
            <div className="flex items-center">
              <Image
                src="/images/logo/cooking_city_logo.svg"
                alt="Cooking City Logo"
                width={60}
                height={40}
                className="w-16 h-10 absolute top-0 left-0"
              />
            </div>
            <div className="flex items-center">
              <Image
                src="/images/logo/cooking_city_logo.svg"
                alt="Cooking City Logo"
                width={60}
                height={40}
                className="w-16 h-10 absolute top-0 right-0"
              />
            </div>
          
          {/* Pentagon Chart */}
          <div className="flex justify-center mb-3 mt-6">
            <PentagonChart 
              data={[
                { label: "Volume", value: volume },
                { label: "On-Chain", value: onChain },
                { label: "Duration", value: duration },
                { label: "Twitter", value: twitter },
                { label: "P&L Rate", value: pnlRate }
              ]}
              size={200}
            />
          </div>
          
          {/* Bottom Section */}
          <div className="flex justify-between items-end">
            {/* User Profile */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#FCD845] rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-black font-jersey25Regular text-lg">{userInitial}</span>
              </div>
              <div>
                <div className="text-white font-jersey25Regular text-md">{userName}</div>
                <div className="text-[#9F9B9F] font-cofo text-sm">{userAddress}</div>
              </div>
            </div>
            
            {/* Metrics */}
            <div className="flex gap-3">
              <div className="bg-[#130511]/50 border border-[#332231] text-center rounded-lg px-6 py-1 min-w-[120px]">
                <div className="text-[#9F9B9F] text-xs">P&L</div>
                <div className="text-white font-jersey25Regular text-sm">{pnl}</div>
              </div>
              <div className="bg-[#130511]/50 border border-[#332231] text-center rounded-lg px-6 py-1 min-w-[120px]">
                <div className="text-[#9F9B9F] text-xs">Followers</div>
                <div className="text-white font-jersey25Regular text-sm">{followers}</div>
              </div>
              <div className="bg-[#130511]/50 border border-[#332231] text-center rounded-lg px-6 py-1 min-w-[120px]">
                <div className="text-[#9F9B9F] text-xs">Earnings</div>
                <div className="text-white font-jersey25Regular text-sm">{earnings}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
