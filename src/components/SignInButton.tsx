'use client';
import { signIn, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

const SignInButton = () => {
  const t = useTranslations('SignInButton');
  const { status } = useSession<boolean>();
  const router = useRouter();

  return (
    <div>
      <button
        onClick={() => {
          if (status === 'authenticated') {
            router.push('/user');
          } else {
            signIn('google', { callbackUrl: '/user' });
          }
        }}
      >
        {t('text')}
      </button>
    </div>
  );
};

export default SignInButton;
