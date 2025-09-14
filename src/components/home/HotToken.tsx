'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getPinnedToken, Token } from '@/api/token';
import { addToast, Avatar, Skeleton } from '@heroui/react';
import { formatTimeAgo, shortenAddress } from '@/utils';
import { PiCopySimpleBold } from 'react-icons/pi';
import { useTranslations } from 'next-intl';

export default function HotToken() {
  const [hotToken, setHotToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Home');
  const tCommon = useTranslations('Common');

  useEffect(() => {
    const fetchPinnedToken = async () => {
      try {
        setLoading(true);
        const response = await getPinnedToken();
        if (response.code === 200 && response.data) {
          setHotToken(response.data);
        } else {
          setHotToken(null);
        }
      } catch (error) {
        console.error('Failed to fetch pinned token:', error);
        setHotToken(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPinnedToken();
  }, []);

  // Handle copy to clipboard
  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      addToast({
        title: tCommon('toasts.success.copied'),
        description: tCommon('toasts.success.copiedDesc'),
        color: 'success',
      });
    } catch (error) {
      console.error('Failed to copy address:', error);
      addToast({
        title: tCommon('toasts.error.copyFailed'),
        description: tCommon('toasts.error.copyFailedDesc'),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex -mb-44 gap-3 animate-pulse">
        <Skeleton className="w-[161px] h-[219px] bg-gray-300 hidden md:block" />
        <div className="grid grid-cols-[87px_1fr] gap-2">
          <Skeleton className="w-[87px] h-[87px] rounded-full bg-gray-300 mt-4 border-2 border-gray-300" />
          <div className="text-white w-full">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Skeleton className="w-32 h-8 bg-gray-300" />
                <Skeleton className="w-16 h-4 bg-gray-300" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-24 h-4 bg-gray-300" />
                <Skeleton className="w-4 h-4 bg-gray-300" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-28 h-4 bg-gray-300" />
                <Skeleton className="w-20 h-4 bg-gray-300" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-36 h-4 bg-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hotToken) {
    return (
      <div className="flex -mb-44 gap-3" >
        <Image
          src="/images/home/chef_peter.png"
          alt={t('hotToken.accessibility.chefPeter')}
          width={161}
          height={219}
          priority
          className="object-contain hidden md:block"
        />
        <div className="grid grid-cols-[87px_1fr] gap-2">
          <Avatar
            src=""
            className="size-16 sm:size-20 rounded-full"
            fallback="-"
            alt={t('hotToken.accessibility.avatar', { name: t('hotToken.fallbackName') })}
          />
          <div className="text-white w-full">
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-[montserrat]">-</p>
              <div className="flex items-center gap-2 text-[#857A83] text-sm">
                <p>-</p>
              </div>
              <div className="flex whitespace-nowrap items-center gap-2 text-[#857A83] text-sm">
                <p className="whitespace-nowrap">{t('hotToken.marketCap')}: <span className="text-[#FF8DF7]">-</span></p>
                <p className="whitespace-nowrap">{t('hotToken.holderCount')}: <span className="text-white">-</span></p>
              </div>
              <p className="flex items-center gap-2 text-[#857A83] text-sm">
              {t('hotToken.createdBy')} <span className="text-[#FCD845]">-</span> <span className="text-white">-</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex -mb-44 gap-3">
      <Image
        src="/images/home/chef_peter.png"
        alt="Chef Peter"
        width={161}
        height={219}
        priority
        className="object-contain hidden md:block"
      />
      <div className="grid grid-cols-[87px_1fr] gap-2">
        <Avatar
          src={hotToken.logo }
          className="size-16 sm:size-20 rounded-full"
          fallback={hotToken.name?.[0] ?? '-'}
          alt={`Token avatar for ${hotToken.name ?? '-'}`}
        />
        <div className="text-white w-full">
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-[montserrat]">
              {hotToken.name || '-'}
              <span className="font-[montserrat] text-[#857A83] ml-1 text-xs">
                ${hotToken.symbol || '-'}
              </span>
            </p>
            <div className="flex items-center gap-2 text-[#857A83] text-sm">
              <p>{hotToken.address ? shortenAddress(hotToken.address) : '-'}</p>
              {hotToken.address && (
                <PiCopySimpleBold
                  className="cursor-pointer"
                  onClick={() => handleCopyAddress(hotToken.address)}
                />
              )}
            </div>
            <div className="flex whitespace-nowrap items-center gap-2 text-[#857A83] text-sm">
              <p className="whitespace-nowrap">
              {t('hotToken.marketCap')}: <span className="text-[#FF8DF7]">{hotToken.market_cap ? `$${hotToken.market_cap.toLocaleString()}` : '-'}</span>
              </p>
              <p className="whitespace-nowrap">
              {t('hotToken.holderCount')}: <span className="text-white">{hotToken.holders ?? '-'}</span>
              </p>
            </div>
            <p className="flex items-center gap-2 text-[#857A83] text-sm">
            {t('hotToken.createdBy')}{' '}
              <span className="text-[#FCD845]">{hotToken.signer ? shortenAddress(hotToken.signer) : '-'}</span>{' '}
              <span className="text-white">
                {hotToken.created_at ? formatTimeAgo(hotToken.created_at, 'en') : '-'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}