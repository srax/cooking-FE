'use client'

import { Button } from '@heroui/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#2E1C2C] relative overflow-hidden px-4">
      {/* 背景图 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-[990px] h-[300px] md:h-[600px] opacity-50">
        <Image
          src="/images/404/404.png"
          alt="404 background"
          width={990}
          height={600}
          priority
          className="w-full h-full object-contain"
        />
      </div>

      {/* 内容区域 */}
      <div className="relative z-10 w-full max-w-[335px] md:max-w-none">
        {/* 文本内容 */}
        <div className="text-center mt-6 md:mt-8">
          <h1 className="text-[32px] md:text-[48px] font-cofo text-white mb-2 md:mb-4">
            404 Not Found
          </h1>
          <p className="text-sm md:text-base text-[#999999] mb-4 md:mb-6 px-4 md:px-0">
            The page you are browsing cannot be displayed temporarily, please try again later.
          </p>
          <Button
            className="h-[40px] md:h-[56px] px-6 md:px-12 bg-[#FCD845] text-black rounded font-medium hover:bg-[#FCD845]/90 text-base"
            onPress={() => router.back()}
          >
            Back to homepage
          </Button>
        </div>
      </div>
    </div>
  )
}
