'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Avatar,
  addToast,
  Spinner,
  Button,
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { FaXTwitter } from 'react-icons/fa6';
import { fetchUserInfoByAddress } from '@/api/user';
import TokenTable from '@/components/TokenTable';
import { FaTelegramPlane } from 'react-icons/fa';

export interface ProfileData {
  avatar: string;
  name: string;
  bio: string;
  twitter_screen_name?: string;
  telegram_username?: string;
}



export default function OthersProfileCard() {
  const t = useTranslations('Assets');
  const tCommon = useTranslations('Common');
  const params = useParams();
  const address = params.address as string;
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    avatar: '/images/logo/logo.png',
    name: '',
    bio: '',
  });
  const [totalTokens, setTotalTokens] = useState(0);

  const getUserInfo = useCallback(async () => {
    if (typeof window === 'undefined' || !address) {
      setLoading(false);
      return;
    }

    try {
      const data = await fetchUserInfoByAddress(address);
      if (!data) {
        throw new Error(tCommon('toasts.error.fetchUserError'));
      }

      const updatedProfile: ProfileData = {
        avatar: data.profile.avatar_url || '/images/logo/logo.png',
        name: data.profile.nick_name || `${data.profile.address.slice(0, 6)}...${data.profile.address.slice(-6)}`,
        bio: data.profile.bio || '',
        twitter_screen_name: data.profile.twitter_screen_name || '',
        telegram_username: data.profile.telegram_username || '',
      };
      setProfileData(updatedProfile);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      addToast({
        title: tCommon('toasts.error.fetchUserError'),
        description: error instanceof Error ? error.message : tCommon('toasts.error.genericError'),
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }, [address, tCommon]);

  const handleTotalChange = (total: number) => {
    setTotalTokens(total);
  };

  useEffect(() => {
    getUserInfo();
  }, [getUserInfo]);

  const handleTwitterClick = useCallback(() => {
    if (profileData.twitter_screen_name) {
      window.open(`https://x.com/${profileData.twitter_screen_name}`, '_blank');
    }
  }, [profileData.twitter_screen_name]);

  const handleTelegramClick = useCallback(() => {
    if (profileData.telegram_username) {
      window.open(`https://t.me/${profileData.telegram_username}`, '_blank');
    }
  }, [profileData.telegram_username]);

  return (

    <div
      className="w-full max-w-7xl  mx-auto pt-16 sm:pt-[90px] pb-8 sm:pb-[50px] space-y-4 sm:space-y-2.5 px-4 sm:px-0"
      role="main"
      aria-label={t('accessibility.page')}
    >
      <div
        className="bg-[#332231] h-auto min-h-[160px] sm:h-[180px] border-2 border-black rounded-lg flex flex-col sm:flex-row items-center px-6 sm:px-[45px] py-4 sm:py-0 gap-4 sm:gap-6"
        role="region"
        aria-label={t('accessibility.othersProfileCard')}
      >
        <Avatar
          src={profileData.avatar}
          className="w-16 h-16 sm:w-[90px] sm:h-[90px] border-1 flex-shrink-0"
          fallback={profileData.name ? profileData.name[0] : 'A'}
          aria-label={t('accessibility.avatar', { name: profileData.name || t('profile.noAddress') })}
        />
        {loading ? (
          <div className="flex justify-center items-center w-full h-full">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="text-lg sm:text-2xl flex gap-2 items-center">
                {profileData.name ? (
                  <span className="truncate max-w-[200px] sm:max-w-[300px]">{profileData.name}</span>
                ) : (
                  <span>{t('profile.noAddress')}</span>
                )}
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-400 break-words">
                  {profileData.bio || t('profile.noBio')}
                </span>
              </div>
              <div className="pt-2 sm:pt-[27px] flex gap-2 sm:gap-4 items-center">
                <span className="text-xs sm:text-sm text-gray-400">{t('profile.tokenOwned')}</span>
                <span className="text-lg sm:text-xl text-[#FCD845]">{totalTokens}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {profileData.twitter_screen_name && (
                <Button
                  onClick={handleTwitterClick}
                  className="bg-[#4c3949] h-8 text-xs sm:text-sm"
                  size="sm"
                  aria-label={t('accessibility.viewTwitter')}
                >
                  <FaXTwitter />
                  @{profileData.twitter_screen_name}
                </Button>
              )}
              {profileData.telegram_username && (
                <Button
                  onClick={handleTelegramClick}
                  className="bg-[#4c3949] h-8 text-xs sm:text-sm"
                  size="sm"
                  aria-label={t('accessibility.viewTelegram')}
                >
                  <FaTelegramPlane />
                  @{profileData.telegram_username}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      <TokenTable onTotalChange={handleTotalChange} address={address} />
    </div>

  );
}