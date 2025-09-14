'use client';

import { useState, useEffect } from 'react';
import { addToast, Button } from '@heroui/react';
import Image from 'next/image';
import { RiFileCopy2Line } from 'react-icons/ri';
import { IoIosShareAlt } from 'react-icons/io';
import { useTranslations } from 'next-intl';
import { InviteesResponse, fetchInvitees, InvitationCodeResponse, fetchInvitationCode } from '@/api/referral';

export const dynamic = 'force-static';

export default function AirdropReferral() {
  const t = useTranslations('AirdropReferral');
  const tCommon = useTranslations('Common');
  const [referrals, setReferrals] = useState<number>(0);
  const [tradingVolume, setTradingVolume] = useState<number>(0);
  const [referralCode, setReferralCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;
      setLoading(true);
      try {
        const [inviteesResponse, codeResponse] = await Promise.all([
          fetchInvitees(),
          fetchInvitationCode(),
        ]);

        if (inviteesResponse.code === 200 && inviteesResponse.data) {
          setReferrals(inviteesResponse.data.invitee_count);
          setTradingVolume(inviteesResponse.data.total_transaction_volume_in_sol);
        } else {
          throw new Error(inviteesResponse.message || tCommon('toasts.error.fetchReferralInfo'));
        }

        if (codeResponse.code === 200 && codeResponse.data) {
          setReferralCode(codeResponse.data);
        } else {
          throw new Error(codeResponse.message || tCommon('toasts.error.fetchReferralCode'));
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : tCommon('toasts.error.networkError');
        if (isMounted) {
          setError(errorMessage);
          addToast({
            title: tCommon('toasts.error.genericError'),
            color: 'danger',
            description: errorMessage,
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [tCommon]);

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}`;
    }
    return '';
  };

  const handleCopyLink = () => {
    if (!referralCode) {
      addToast({
        title: tCommon('toasts.error.genericError'),
        color: 'danger',
        description: tCommon('toasts.error.codeNotLoaded'),
      });
      return;
    }
    const baseUrl = getBaseUrl();
    const inviteLink = `${baseUrl}/invite?code=${referralCode}`;
    navigator.clipboard.writeText(inviteLink);
    addToast({
      title: tCommon('toasts.success.linkCopied'),
      color: 'success',
      description: tCommon('toasts.success.linkCopiedDesc', { code: referralCode }),
    });
  };

  const handleShareOnX = () => {
    if (!referralCode) {
      addToast({
        title: tCommon('toasts.error.genericError'),
        color: 'danger',
        description: tCommon('toasts.error.codeNotLoaded'),
      });
      return;
    }
    const baseUrl = getBaseUrl();
    const inviteLink = `${baseUrl}/invite?code=${referralCode}`;
    const tweetText = encodeURIComponent(t('shareText', { code: referralCode, link: inviteLink }));
    const shareUrl = `https://x.com/intent/post?text=${tweetText}`;
    window.open(shareUrl, '_blank');
    addToast({
      title: tCommon('toasts.success.shareX'),
      color: 'success',
      description: tCommon('toasts.success.shareXDesc'),
    });
  };

  return (
    <div
      className="flex flex-col mt-16 sm:mt-20 min-h-screen text-white px-4 sm:px-0"
      role="main"
      aria-label={t('accessibility.page')}
    >
      <div className="max-w-7xl mx-auto w-full">
        <section
          className="mt-6 sm:mt-8 h-[450px] sm:h-[550px] relative overflow-hidden bg-[#332231] rounded-lg border-2 border-black"
          role="region"
          aria-label={t('accessibility.hero')}
        >
          <div className="absolute top-1/2 left-1/2 w-[1500px] sm:w-[2440px] h-[1500px] sm:h-[2440px] sunburst animate-spin opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-20 text-center flex flex-col justify-center items-center px-4">
            <p className="text-3xl sm:text-5xl lg:text-6xl font-montserrat whitespace-nowrap text-shadow-lg font-bold text-white">
              {t('title1')}
            </p>
            <p className="text-3xl sm:text-5xl lg:text-6xl font-montserrat mt-4 sm:mt-7 text-shadow-lg whitespace-nowrap font-bold text-white">
              <span className="text-[#FCD845]">{t('title2')}</span>
            </p>
            <div className="mt-8 sm:mt-12 lg:mt-20 max-w-full" role="region" aria-label={t('accessibility.referralCode')}>
              {loading ? (
                <p className="text-sm sm:text-base text-white/85">{tCommon('loading')}</p>
              ) : error ? (
                <p className="text-sm sm:text-base text-red-500">{error}</p>
              ) : (
                <p className="text-sm sm:text-base text-white/85 truncate max-w-[250px] sm:max-w-[400px]">
                  {t('yourCode')} <span className="text-[#FCD845] font-bold">{referralCode}</span>
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
              <Button
                onPress={handleCopyLink}
                variant="bordered"
                className="border-[#FCD845] text-[#FCD845] h-9 sm:h-10 text-sm sm:text-base min-w-[140px]"
                isDisabled={loading || !!error}
                aria-label={t('accessibility.copyButton')}
              >
                <RiFileCopy2Line className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('copyLink')}
              </Button>
              <Button
                onPress={handleShareOnX}
                className="bg-[#FCD845] text-black h-9 sm:h-10 text-sm sm:text-base min-w-[140px]"
                isDisabled={loading || !!error}
                aria-label={t('accessibility.shareButton')}
              >
                <IoIosShareAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('shareX')}
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div
            className="flex-1 p-4 sm:p-6 bg-[#332231] rounded-lg text-center border-2 border-black"
            role="region"
            aria-label={t('accessibility.referralsCard')}
          >
            <p className="text-xs sm:text-sm text-[#857A83]">{t('totalReferrals')}</p>
            <p className="text-3xl sm:text-5xl mt-2 sm:mt-4 font-bold">
              {loading ? '...' : referrals}
            </p>
          </div>
          <div
            className="flex-1 p-4 sm:p-6 bg-[#332231] rounded-lg text-center border-2 border-black"
            role="region"
            aria-label={t('accessibility.volumeCard')}
          >
            <p className="text-xs sm:text-sm text-[#857A83]">{t('totalVolume')}</p>
            <div className="flex justify-center items-center gap-2 mt-2 sm:mt-4">
              <p className="text-3xl sm:text-5xl font-bold">
                {loading ? '...' : tradingVolume.toFixed(2)}
              </p>
              <Image
                src="/images/solana.svg"
                alt={tCommon('images.solIcon')}
                width={32}
                height={32}
                priority
                className="object-contain sm:w-10 sm:h-10"
                aria-label={t('accessibility.solIcon')}
                onError={(e) => (e.currentTarget.src = '/images/fallback.png')}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}