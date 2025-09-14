'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Avatar,
  addToast,
  Spinner,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/react';
import { FiEdit3 } from 'react-icons/fi';
import { fetchTelegramBindInfo } from '@/api/user';
import { useTranslations } from 'next-intl';
import EditProfileModal from './EditProfileModal';
import { FaArrowRight, FaXTwitter } from 'react-icons/fa6';
import { FaTelegramPlane } from "react-icons/fa";
import { useAuth } from '@/context/AuthContext'; // 引入 useAuth
import Image from "next/image";
import { shortenAddress } from '@/utils';
import { BiWallet } from 'react-icons/bi';

export interface ProfileData {
  avatar: string;
  name: string;
  bio: string;
  twitter_screen_name?: string;
  telegram_username?: string;
}

interface ProfileCardProps {
  tokenCount: number;
}

export default function ProfileCard({ tokenCount }: ProfileCardProps) {
  const t = useTranslations('Assets');
  const tCommon = useTranslations('Common');
  const { userInfo, checkLoginStatus, loading: authLoading,logout } = useAuth(); // 从 AuthContext 获取 userInfo 和 loading 状态
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isConnectTGModalOpen, setIsConnectTGModalOpen] = useState(false);
  const [isConnectTradingBotModalOpen, setIsConnectTradingBotModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    avatar: '/images/logo/logo.png',
    name: '',
    bio: '',
  });

  // 从 userInfo 更新 profileData
  useEffect(() => {
    if (userInfo) {
      const updatedProfile: ProfileData = {
        avatar: userInfo.profile.avatar_url || '',
        name: userInfo.profile.nick_name || `${userInfo.profile.address.slice(0, 6)}...${userInfo.profile.address.slice(-6)}`,
        bio: userInfo.profile.bio || '',
        twitter_screen_name: userInfo.profile.twitter_screen_name || '',
        telegram_username: userInfo.profile.telegram_username || '',
      };
      setProfileData(updatedProfile);
    } else {
      setProfileData({
        avatar: '/images/logo/logo.png',
        name: '',
        bio: '',
        twitter_screen_name: '',
        telegram_username: '',
      });
    }
  }, [userInfo]);

  const handleConnectX = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        addToast({ title: tCommon('toasts.warning.pleaseConnect'), color: 'danger' });
        return;
      }
      const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}`;
      const authUrl = `${process.env.API_BASE_URL}/twitter/bind?redirect_uri=${encodeURIComponent(redirectUri)}&token=${encodeURIComponent(token)}`;
      const authWindow = window.open(authUrl, 'TwitterAuth', 'width=600,height=600,scrollbars=yes');
      if (!authWindow) {
        throw new Error('Unable to open auth window');
      }

      const checkAuthStatus = setInterval(async () => {
        try {
          await checkLoginStatus(); // 使用 AuthContext 的 checkLoginStatus 更新 userInfo
          if (userInfo?.profile?.twitter_screen_name) {
            clearInterval(checkAuthStatus);
            authWindow.close();
            addToast({ title: tCommon('toasts.success.twitterAuthSuccess'), color: 'success' });
          }
        } catch (error) {
          console.error('Failed to check auth status:', error);
        }
      }, 2000);

      const checkWindowClosed = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkAuthStatus);
          clearInterval(checkWindowClosed);
        }
      }, 500);

      setTimeout(() => {
        clearInterval(checkAuthStatus);
        clearInterval(checkWindowClosed);
        if (!authWindow.closed) {
          authWindow.close();
          addToast({ title: tCommon('toasts.warning.authTimeout'), color: 'warning' });
        }
      }, 5 * 60 * 1000);
    } catch (error) {
      console.error('Twitter auth failed:', error);
      addToast({
        title: tCommon('toasts.error.twitterAuthError'),
        description: tCommon('toasts.error.genericError'),
        color: 'danger',
      });
    }
  }, [tCommon, checkLoginStatus, userInfo]);

  const handleTwitterClick = useCallback(() => {
    if (profileData.twitter_screen_name) {
      window.open(`https://x.com/${profileData.twitter_screen_name}`, '_blank');
    } else {
      handleConnectX();
    }
  }, [profileData.twitter_screen_name, handleConnectX]);

  const handleConnectTelegram = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        addToast({ title: tCommon('toasts.warning.pleaseConnect'), color: 'danger' });
        setIsConnectTGModalOpen(false);
        return;
      }

      if (profileData.telegram_username) {
        addToast({ title: tCommon('toasts.warning.telegramAlreadyBound'), color: 'warning' });
        setIsConnectTGModalOpen(false);
        return;
      }

      const bindData = await fetchTelegramBindInfo(token);
      if (!bindData) {
        throw new Error(tCommon('toasts.error.fetchTelegramBindError'));
      }

      const { bot, code } = bindData;

      const tgWindow = window.open(`https://t.me/${bot}`, 'TelegramAuth', 'width=600,height=600,scrollbars=yes');
      if (!tgWindow) {
        throw new Error('Unable to open Telegram window');
      }
      await navigator.clipboard.writeText(code);

      addToast({
        title: `${tCommon('toasts.success.telegramBindInstruction', { code: code })} `,
        color: 'warning',
      });

      setIsConnectTGModalOpen(false);

      // 轮询检查 Telegram 绑定状态
      const checkBindStatus = setInterval(async () => {
        try {
          await checkLoginStatus(); // 使用 AuthContext 的 checkLoginStatus 更新 userInfo
          if (userInfo?.profile?.telegram_username) {
            clearInterval(checkBindStatus);
            tgWindow.close();
            addToast({ title: tCommon('toasts.success.telegramBindSuccess'), color: 'success' });
          }
        } catch (error) {
          console.error('Failed to check Telegram bind status:', error);
        }
      }, 2000);

      const checkWindowClosed = setInterval(() => {
        if (tgWindow.closed) {
          clearInterval(checkBindStatus);
          clearInterval(checkWindowClosed);
        }
      }, 500);

      setTimeout(() => {
        clearInterval(checkBindStatus);
        clearInterval(checkWindowClosed);
        if (!tgWindow.closed) {
          tgWindow.close();
          addToast({ title: tCommon('toasts.warning.authTimeout'), color: 'warning' });
        }
      }, 5 * 60 * 1000);
    } catch (error) {
      console.error('Telegram binding failed:', error);
      addToast({
        title: tCommon('toasts.error.telegramBindError'),
        description: error instanceof Error ? error.message : tCommon('toasts.error.genericError'),
        color: 'danger',
      });
      setIsConnectTGModalOpen(false);
    }
  }, [tCommon, profileData.telegram_username, checkLoginStatus, userInfo]);

  const handleProfileUpdate = useCallback(async (data: ProfileData) => {
    setProfileData(data);
    await checkLoginStatus(); // 更新 AuthContext 中的 userInfo
  }, [checkLoginStatus]);

  return (
    <div
      className="w-[369px] max-sm:w-full relative flex-shrink-0 flex  flex-col items-center "
    >
      <Image
        src={'/images/assets/profileBg.png'}
        alt={'profileBg'}
        width={369}
        height={457}
        className='w-[369px] h-[457px] flex-shrink-0 absolute top-0 left-0'
      ></Image>
      <Avatar
        src={profileData.avatar}
        className="w-40 h-40 flex-shrink-0 mt-6"
        fallback={profileData.name ? profileData.name[0] : 'A'}
        aria-label="avatar"
      />

      <Button
        className={`!w-10 min-w-10 h-10 flex items-center rounded-full bg-[#FCD845] p-0 absolute  left-56 top-36`}
        onClick={() => setIsEditProfileOpen(true)}
      >
        {
          <div
            className="w-10 h-10 flex items-center rounded-full justify-center cursor-pointer"
          >
            <Image src={'/images/assets/pencil.svg'} alt='' width={24} height={24}></Image>
          </div>
        }
      </Button>

      <p className='text-[32px] mt-4 text-white relative '>{shortenAddress(userInfo?.profile.address || '')}</p>
      {profileData.twitter_screen_name ? <p className='text-[#857A83] text-base relative'>@{profileData.twitter_screen_name}</p> : ''}
      <div className='w-[260px] h-[69px] border-2 border-[#30212E] rounded relative text-center py-2 mt-5'>
        <p className='text-[24px] text-[#FF8DF7] leading-none'>{tokenCount}</p>
        <p className='text-sm text-[#857A83] mt-2 leading-none'>Token Owned</p>
      </div>
      {
        profileData.twitter_screen_name ? null :
          <Button
            variant='bordered'
            className='border-none relative text-[#FCD845] text-sm h-[20px] mt-5'
            endContent={<FaArrowRight />}
            startContent={<FaXTwitter />}
            onClick={handleConnectX}
          >Connect X</Button>
      }
      <Button
        variant='bordered'
        className={`border-none relative text-[#FCD845]/40 text-sm h-[20px] ${profileData.twitter_screen_name ? 'mt-5' : 'mt-2'}`}
        endContent={<FaArrowRight />}
        startContent={<BiWallet />}
        onClick={logout}
      >Connect Another Wallet</Button>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSubmit={handleProfileUpdate}
        initialData={profileData}
      />

    </div>
  );
}