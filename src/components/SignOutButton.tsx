'use client';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import React from 'react';

const SignOutButton = () => {
  const t = useTranslations('SignOutButton');
  return (
    <button
      className=" cursor-pointer absolute z-50 top-12 lg:top-16 right-2 min-[2000px]:right-10 min-[2000px]:top-32 h-auto p-2 min-[2000px]:p-4"
      onClick={() => signOut()}
    >
      {t('text')}
    </button>
  );
};

export default SignOutButton;
