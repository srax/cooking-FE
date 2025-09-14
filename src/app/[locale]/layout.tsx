import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/Header';
import { Toaster } from 'react-hot-toast';
import { StrictMode } from 'react';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <div className='flex flex-col min-h-screen '>
      <NextIntlClientProvider messages={messages}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </NextIntlClientProvider>
      <Toaster />
    </div>
  );
}