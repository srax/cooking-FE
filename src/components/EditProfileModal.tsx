'use client';

import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Avatar,
  addToast,
} from '@heroui/react';
import { updateUserProfile, UpdateProfileParams } from '@/api/user';
import { ProfileData } from './ProfileCard';
import { useTranslations } from 'next-intl';
import UploadImage from './UploadImage';
import FancyButton from './FancyButton';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProfileData) => void;
  initialData: ProfileData;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const t = useTranslations('Assets');
  const tCommon = useTranslations('Common');
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (newImageUrl: string) => {
    setPreviewUrl(newImageUrl);
    setFormData((prev) => ({
      ...prev,
      avatar: newImageUrl, 
    }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      addToast({
        title: tCommon('toasts.error.genericError'),
        description: tCommon('toasts.warning.pleaseConnect'),
        color: 'danger',
      });
      return;
    }

    setLoading(true);
    try {
      const updateParams: UpdateProfileParams = {
        avatar_url: formData.avatar,
        bio: formData.bio.trim(),
        nick_name: formData.name.trim(),
      };

      const response = await updateUserProfile(token, updateParams);
      if (response.code === 200 && response.profile) {
        const updatedProfile = {
          avatar: response.profile.avatar_url || initialData.avatar,
          name: response.profile.nick_name || initialData.name,
          bio: response.profile.bio || initialData.bio,
        };
        onSubmit(updatedProfile);
        addToast({
          title: tCommon('toasts.success.updateSuccess'),
          description: tCommon('toasts.success.updateSuccess'),
          color: 'success',
        });
        onClose();
      } else {
        throw new Error(response.message || tCommon('toasts.error.updateError'));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      addToast({
        title: tCommon('toasts.error.genericError'),
        description: error instanceof Error ? error.message : tCommon('toasts.error.updateError'),
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData); 
      setPreviewUrl(initialData.avatar);
    }
  }, [isOpen, initialData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdrop="blur"
      classNames={{
        base: 'bg-[#150714] border border-[#332231] max-w-[90vw] sm:max-w-md rounded-2xl',
        header: ['p-4 sm:p-5', 'pb-0'],
        body: 'p-4 sm:p-5',
        footer: 'p-4 sm:p-5 pt-0',
        closeButton: [
          'hover:bg-[#FCD845]',
          'hover:text-black',
          'active:text-black',
          'top-4',
          'right-4',
          'z-10',
          'rounded-sm',
          'bg-[#FCD845]',
          'text-[#000]',
          'w-[18px]',
          'h-[18px]',
          'p-0',
        ],
        backdrop: 'bg-black/50 backdrop-blur-sm',
      }}
      role="dialog"
      aria-label="editProfileModal"
    >
      <ModalContent>
        <ModalHeader>
          <h2 className="text-white   text-base sm:text-lg uppercase font-medium">
            Edit personal profile
          </h2>
        </ModalHeader>
        <ModalBody className='flex justify-center items-center'>
          <div className="flex w-40 h-40  flex-col items-center mb-4 sm:mb-6 relative">
            <Avatar
              src={previewUrl || formData.avatar}
              className="w-40 h-40"
              fallback={formData.name ? formData.name[0] : 'U'}
              aria-label="avatar"
            />
            <UploadImage
              defaultImage={initialData.avatar}
              onUpload={handleImageChange}
              className="!w-10 min-w-10 h-10 flex items-center rounded-full bg-[#FCD845] p-0 absolute bottom-0 right-0"
              aria-label="uploadImage"
              isProfile={true}

            />
          </div>
          <div className="mb-3 sm:mb-4 w-full">
            <p className='text-sm  font-cofo text-white mb-2'>Name</p>
            <Input
              variant='bordered'
              classNames={{
                inputWrapper: [
                  'bg-transparent',
                  'group-data-[focus=true]:bg-[#241822]/50',
                  '!cursor-text',
                  'h-10 sm:h-12',
                  'border',
                  'border-[#3F2C3E]',

                ],
                input: 'text-sm sm:text-base',
              }}
              placeholder={t('profile.name')}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              aria-label="nameInput"
            />
          </div>
          <FancyButton
            onClick={handleSubmit}
            className="bg-[#FCD845] uppercase w-full text-black"
            buttonText='CONFIRM'
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditProfileModal;