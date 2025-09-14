'use client'

import { useLocale } from 'next-intl'
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { IoLanguageOutline } from "react-icons/io5";
import { useRouter, usePathname } from 'next/navigation';
export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' }
  ]

  const handleLanguageChange = (code: string) => {
    const newPath = pathname.replace(/^\/[a-z]{2}/, `/${code}`);
    router.push(newPath);
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          className="h-[28px] min-w-0 px-2 bg-transparent text-white border border-[#2c2c3a] rounded hover:bg-[#1c1c28]"
          startContent={<IoLanguageOutline className="w-4 h-4" />}
        >
          {languages.find(lang => lang.code === locale)?.label}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Language options"
        className="bg-[#1c1c28]/80 backdrop-blur-sm border border-[#2c2c3a] min-w-[120px]"
      >
        {languages.map((lang) => (
          <DropdownItem
            key={lang.code}
            className={`text-sm py-2 ${locale === lang.code ? 'text-[#ffd84c]' : 'text-gray-400 hover:text-white'}`}
            onPress={() => handleLanguageChange(lang.code)}
          >
            {lang.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
} 