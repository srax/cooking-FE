"use client";

import GuideModal from "@/components/GuideModal";
import History from "@/components/home/History";
import TokenList from "@/components/home/TokenList";
import InviteCodeModal from "@/components/inviteCodeModal";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export const dynamic = "force-static";

export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [urlInviteCode, setUrlInviteCode] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    // setIsGuideOpen(true);
    const urlInviteCode = searchParams.get("invite_code");
    if (urlInviteCode) {
      setUrlInviteCode(urlInviteCode);
    }
    const hasSeenGuide = localStorage.getItem("hasSeenGuide");
    if (!hasSeenGuide) {
      setIsGuideOpen(true);
      localStorage.setItem("hasSeenGuide", "true");
    }
  }, [searchParams]);

  const handleOpenChange = () => {
    setIsGuideOpen(!isGuideOpen);
  };

  return (
    <div className="flex flex-col w-full bg-[#130511]">
      <GuideModal isOpen={isGuideOpen} onOpenChange={handleOpenChange} />
      <InviteCodeModal
        isOpen={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        urlInviteCode={urlInviteCode}
      ></InviteCodeModal>
      <History />
      <div className="flex-1 min-h-96">
        <TokenList />
      </div>
    </div>
  );
}
