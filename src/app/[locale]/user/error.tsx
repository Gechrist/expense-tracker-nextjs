'use client';
import { useTranslations } from 'next-intl';
import React from 'react';

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  const t = useTranslations('Error');

  return (
    <div className="w-full h-1/2 flex justify-center gap-4 items-center flex-col ">
      <h2>{t('message')}</h2>
      <button onClick={() => reset()}>{t('tryAgain')}</button>
    </div>
  );
};

export default Error;
