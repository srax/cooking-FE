"use client";

import { useAuth } from "@/context/AuthContext";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { addToast, useDisclosure } from "@heroui/react";
import { useAppKit } from "@reown/appkit/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaXTwitter } from "react-icons/fa6";
import CreateTokenModal from "./CreateTokenModal";
import FancyButton from "./FancyButton";
import SolanaWalletButton from "./MyWallet";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { open } = useAppKit();
  const navigation = [
    { name: "Explore", href: "/" },
    { name: "Michelin", href: "/michelin" },
    { name: "reward", href: "/reward" },
    { name: "Campaign", href: "/campaign" },
  ];

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 90) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY]);

  const { isLoggedIn, loading, address, isConnected, signAndLogin, logout } =
    useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleConnect = async () => {
    if (isLoggedIn) return;
    setIsLoading(true);
    try {
      if (!isConnected) {
        await open();
      } else {
        await signAndLogin();
      }
    } catch (error) {
      console.error("Connection or login failed:", error);
      addToast({
        title: "Login Failed",
        description:
          error instanceof Error ? error.message : "Unable to connect or login",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateToken = () => {
    if (!isLoggedIn) {
      addToast({
        title: "Please connect your wallet",
        description: "You need to connect your wallet to create a token",
        color: "danger",
      });
      handleConnect();
      return;
    }
    onOpen();
  };

  // Hide header on ChefID campaign page
  if (pathname === '/campaign/chefid-campaign-001') {
    return null;
  }

  return (
    <>
      <div
        className={`px-10 max-sm:px-4 bg-[#130511] py-2 max-sm:py-1 flex items-center justify-between transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center">
          <Link
            href="/"
            className="flex w-[60px] max-sm:w-[48px] h-[40px] max-sm:h-[32px]"
          >
            <Image
              src="/images/logo/cooking_city_logo.svg"
              alt="Logo"
              width={57}
              height={38}
              priority
              className="max-sm:w-[48px] max-sm:h-[32px]"
            />
          </Link>
          <div className="hidden md:flex flex-1 items-center space-x-6 ml-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-base py-3 uppercase ${
                  pathname === item.href ? "text-[#ff8df7]" : "text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-end gap-2 max-sm:gap-1">
          {/* 移动端汉堡菜单按钮 */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6 max-sm:w-5 max-sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  isMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
          {/* PC 端的按钮 */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="https://cooking-city.gitbook.io/intro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center opacity-90 hover:opacity-100"
            >
              <Image
                src={"/images/header/gitbook.svg"}
                width={20}
                className="flex-shrink-0"
                height={20}
                alt={"gitbook"}
              />
            </Link>
            <Link
              href="https://x.com/cookingcityHQ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center opacity-90 hover:opacity-100"
            >
              <FaXTwitter className="w-5 h-5" />
            </Link>
            <Link
              href="https://cooking-city.gitbook.io/docs/side-dish/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center opacity-90 hover:opacity-100"
            >
              <Image
                src={"/images/header/docs.svg"}
                width={20}
                className="flex-shrink-0"
                height={20}
                alt={"docs"}
              />
            </Link>
            <FancyButton
              buttonText="CREATE TOKEN"
              onClick={handleCreateToken}
              icon={
                <Image
                  src={"/images/home/create_icon.svg"}
                  width={14}
                  height={14}
                  alt=""
                />
              }
            />
            <SolanaWalletButton />
          </div>
        </div>
      </div>

      {/* 移动端导航菜单 */}
      <div
        className={`md:hidden fixed inset-0 bg-black/90 z-50 transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex justify-between items-center mb-8">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Image
                src="/images/logo/cooking_city_logo.svg"
                alt="Logo"
                width={48}
                height={32}
                priority
              />
            </Link>
            <button
              className="text-white focus:outline-none"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-lg uppercase ${
                  pathname === item.href ? "text-[#ff8df7]" : "text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/assets"
              className={`text-lg uppercase ${
                pathname === "/assets" ? "text-[#ff8df7]" : "text-white"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
          </nav>
          <div className="mt-8">
            <button
              onClick={() => {
                onOpen();
                setIsMenuOpen(false);
              }}
              className="w-full bg-yellow-500 text-black uppercase font-semibold py-3 rounded-md"
            >
              CREATE TOKEN
            </button>
          </div>
          <div className="mt-auto">
            <div className="w-full py-3 border-t border-white/20">
              <SolanaWalletButton />
            </div>
          </div>
        </div>
      </div>

      <CreateTokenModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};

export default Header;
