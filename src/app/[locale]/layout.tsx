import type { Metadata } from 'next';
import { Comfortaa } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import SessionWrapper from '@/components/SessionWrapper';
import NavBar from '@/components/NavBar';
import '../globals.css';

export const comfortaa = Comfortaa({
  subsets: ['latin', 'greek'],
  display: 'swap',
  variable: '--comfortaa-font',
});

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description:
    'Track your expenses, plan your financial future. Bills, charts, notifications and much more.',
  icons: { icon: '/expensetracker-icon.svg' },
};

const RootLayout = async ({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) => {
  const messages = await getMessages();

  return (
    <html lang={locale} className={` ${comfortaa.className}`}>
      <SessionWrapper>
        <NextIntlClientProvider messages={messages}>
          <body className="text-xs min-[1000px]:text-base min-[2000px]:text-3xl e-bigger">
            <NavBar />
            {children}
          </body>
        </NextIntlClientProvider>
      </SessionWrapper>
    </html>
  );
};

export default RootLayout;
