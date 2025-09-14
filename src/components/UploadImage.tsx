'use client';

import React, { useState, useRef } from 'react';
import { Button, addToast } from '@heroui/react';
import { IoMdAddCircle } from 'react-icons/io';
import { uploadImageToIPFS } from '@/api/upload';
import Image from "next/image";
import { motion } from 'framer-motion';
import { FaChevronRight } from 'react-icons/fa6';

interface FancyButtonProps {
  buttonText?: string;
  className?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const FancyButton: React.FC<FancyButtonProps> = ({
  buttonText = '',
  className = '',
  onClick,
  icon,
  endIcon
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.95, y: 2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      <div className="absolute top-0.5 left-0 w-full h-[28px] bg-[#A19900] rounded-sm z-10" />
      <motion.button
        whileHover={{
          boxShadow: '0 8px 20px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.2)',
        }}
        whileTap={{
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        onClick={() => {
          onClick?.();
        }}
        className={`relative w-full whitespace-nowrap px-2 h-[26px] bg-[#FCD845] text-black text-base font-semibold rounded-[3px] flex items-center justify-center z-20 border-b-2 border-black overflow-hidden`}
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#FFEA96]" />
        <div className="flex items-center">
          {icon && <span className="mr-1">{icon}</span>}
          {buttonText && <p className='uppercase'>{buttonText}</p>}
          {endIcon && <span className="ml-1">{endIcon}</span>}
        </div>
      </motion.button>
    </motion.div>
  );
};

interface UploadImageProps {
  defaultImage?: string;
  onUpload?: (uri: string) => void;
  className?: string;
  isProfile?: boolean;
  children?: React.ReactNode;
  useCustomButton?: boolean;
}

const UploadImage: React.FC<UploadImageProps> = ({
  defaultImage = '/images/default-avatar.png',
  onUpload,
  className = '',
  isProfile = false,
  children,
  useCustomButton = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(defaultImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // 清理旧的 blob URL
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    // 创建新的 blob URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);
    try {
      const ipfsUri = await uploadImageToIPFS(file);
      console.log(ipfsUri, 'ipfsUri');

      if (onUpload) { onUpload(ipfsUri) }
      addToast({
        title: 'Upload successful',
        description: 'The image has been successfully uploaded to IPFS',
        color: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload image to IPFS',
        color: 'danger',
      });
    } finally {
      setIsUploading(false);
    }

    event.target.value = '';
  };

  const buttonContent = children ? (
    children
  ) : isProfile ? (
    <Image src={'/images/assets/pencil.svg'} alt='' width={24} height={24} />
  ) : (
    <>
      <IoMdAddCircle className="h-3 w-3" />
      <span className="text-gray-400">{isUploading ? 'uploading...' : 'upload'}</span>
    </>
  );

  return (
    <>
      {useCustomButton ? (
        <FancyButton
          className={`${isProfile ? 'w-10 h-10 rounded-full' : 'w-full h-full'} flex items-center justify-center ${isProfile ? '' : 'gap-1'} ${className} `}
          buttonText={isUploading ? 'uploading...' : isProfile ? '' : 'upload'}
          endIcon={isProfile ? null : <FaChevronRight className="h-3 w-3" />}
          onClick={() => fileInputRef.current?.click()}
        />
      ) : (
        <Button
          className={`${className}`}
          isDisabled={isUploading}
          isLoading={isUploading}
        >
          <label
            htmlFor="upload-image"
            className={`cursor-pointer ${isProfile ? 'w-10 h-10 flex items-center rounded-full justify-center' : 'w-full h-full flex items-center justify-center gap-1'}`}
          >
            {buttonContent}
          </label>
        </Button>
      )}
      <input
        ref={fileInputRef}
        id="upload-image"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </>
  );
};

export default UploadImage;