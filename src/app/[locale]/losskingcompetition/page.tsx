'use client';

import { useState, useEffect } from 'react';
import { addToast, Button } from '@heroui/react';
import Image from 'next/image';
import { RiShareCircleLine } from 'react-icons/ri';
import { IoIosArrowForward } from 'react-icons/io';
import { useTranslations } from 'next-intl';
import { InviteesResponse, fetchInvitees, InvitationCodeResponse, fetchInvitationCode } from '@/api/referral';

export const dynamic = 'force-static';

export default function LosskingCompetition() {
  const t = useTranslations('LosskingCompetition');
  const tCommon = useTranslations('Common');
  const [referrals, setReferrals] = useState<number>(0);
  const [tradingVolume, setTradingVolume] = useState<number>(0);
  const [referralCode, setReferralCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [netLoss, setNetLoss] = useState<number>(-352637);
  const [wallets, setWallets] = useState<{ name: string; address: string; loss: number }[]>([
    { name: t('wallets.mainWallet'), address: 'F921...5F9Q', loss: -352637 },
    { name: t('wallets.gmnBot'), address: 'F921...5F9Q', loss: -323637 },
    { name: t('wallets.bullxBot'), address: t('wallets.notConnected'), loss: 0 },
  ]);

  // 数字格式化
  const formatter = new Intl.NumberFormat(t('locale') === 'zh' ? 'zh-CN' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

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
          setNetLoss( -352637);
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
            description: tCommon(`toasts.error.${err instanceof Error ? err.message.includes('referral info') ? 'fetchReferralInfoDesc' : 'fetchReferralCodeDesc' : 'networkErrorDesc'}`), 
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
  }, [tCommon, t]);

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}`;
    }
    return '';
  };

  const handleShareOnX = () => {
    if (!referralCode) {
      addToast({
        title: tCommon('toasts.error.genericError'),
        color: 'danger',
        description: tCommon('toasts.error.codeNotLoadedDesc'), 
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
      className="flex flex-col mt-16 sm:mt-20 min-h-screen text-white bg-[#1E1A22] px-4 sm:px-0"
      role="main"
      aria-label={t('accessibility.page')}
    >
      <div className="max-w-7xl mx-auto w-full">
        <section
          className="mt-6 sm:mt-8 h-auto sm:h-[500px] relative overflow-hidden bg-[#332231] rounded-lg border-2 border-black flex flex-col sm:flex-row"
          role="region"
          aria-label={t('accessibility.hero')}
        >
          <div className="absolute top-1/2 left-1/2 w-[1500px] sm:w-[2440px] h-[1500px] sm:h-[2440px] sunburst animate-spin opacity-50" />
          <div className="relative z-20 flex flex-col sm:flex-row justify-center items-center w-full p-4 sm:p-6 gap-4 sm:gap-7">
            <div className="flex justify-center items-center">
              <Image
                src="/images/losskingcompetition.png"
                alt={tCommon('images.lossKing')}
                width={180}
                height={475}
                priority
                className="object-contain sm:w-[215px] sm:h-[569px]"
                aria-label={t('accessibility.competitionImage')}
                onError={(e) => (e.currentTarget.src = '/images/fallback.png')}
              />
            </div>
            <div className="flex flex-col justify-center items-start max-w-full sm:max-w-[400px]">
              <div className="flex items-start gap-1 text-shadow-lg">
                <p className="text-4xl sm:text-6xl lg:text-7xl font-montserrat whitespace-nowrap font-bold text-white">
                  {t('title')}
                </p>
                <span className="text-white text-base sm:text-lg">✨</span>
              </div>
              <p className="text-lg sm:text-2xl lg:text-3xl mt-2 sm:mt-4 whitespace-nowrap text-white">
                {t('subtitle')}
              </p>
              <div
                className="mt-3 sm:mt-4 bg-[#1E131D] w-full sm:w-80 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-left"
                role="region"
                aria-label={t('accessibility.netProfitLoss')}
              >
                <p className="text-xs sm:text-sm text-[#857A83]">{t('netProfitLoss')}</p>
                <p className="text-xl sm:text-3xl mt-1 sm:mt-2 text-[#FF8DF7] font-bold">
                  {formatter.format(netLoss)} SOL
                </p>
              </div>
              <Button
                onPress={handleShareOnX}
                variant="bordered"
                className="mt-2 sm:mt-3 border-none text-gray-500 flex items-center gap-1 bg-transparent text-sm sm:text-base"
                aria-label={t('accessibility.shareButton')}
              >
                <RiShareCircleLine className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('share')}
                <IoIosArrowForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </section>

        <section
          className="mt-4 sm:mt-6 p-4 sm:p-6 bg-[#332231] rounded-lg border-2 border-black"
          role="region"
          aria-label={t('accessibility.walletList')}
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{t('wallet')}</h2>
          <div className="space-y-3 sm:space-y-4">
            {wallets.map((wallet, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-lg hover:bg-white/[0.08] transition-colors"
                role="row"
                aria-label={t('accessibility.walletItem', {
                  name: wallet.name,
                  address: wallet.address,
                  loss: formatter.format(wallet.loss), // 格式化 loss
                })}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <p className="font-medium font-montserrat text-sm sm:text-base">
                    {index + 1}. {wallet.name}
                  </p>
                  {wallet.address !== t('wallets.notConnected') && (
                    <p className="text-xs sm:text-sm text-gray-400">{wallet.address}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#FCD845] text-sm sm:text-base font-bold">
                    {formatter.format(wallet.loss)} SOL
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}