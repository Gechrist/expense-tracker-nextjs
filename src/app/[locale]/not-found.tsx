'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const NotFound = () => {
  const t = useTranslations('NotFound');
  return (
    <div className="w-full h-[80%] flex flex-col space-y-8 items-center justify-center">
      <h2>{t('notFound')}</h2>
      <button>
        <Link href="/">{t('returnToHome')}</Link>
      </button>
    </div>
  );
};

export default NotFound;
