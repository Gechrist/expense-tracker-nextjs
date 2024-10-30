'use client';
import { useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import React from 'react';
import { Session } from 'next-auth';

const SignOutButton = dynamic(() => import('./SignOutButton'));

const AccountIcon = ({
  session,
  status,
}: {
  session: Session | null;
  status: string;
}) => {
  const t = useTranslations('SignInButton');
  const [showSignOutButton, setShowSignOutButton] = useState<boolean>(false);

  return (
    <div>
      {status == 'authenticated' ? (
        <section
          className="flex flex-col items-center space-y-2"
          onClick={() => setShowSignOutButton((prevState) => !prevState)}
        >
          <Image
            className="rounded-full cursor-pointer w-[30px] min-[2000px]:w-[70px]"
            src={session?.user?.image as string}
            alt="user image"
            width={100}
            height={100}
          />
          {showSignOutButton && <SignOutButton />}
        </section>
      ) : (
        <Image
          className="w-[35px] min-[2000px]:w-[70px] cursor-pointer"
          src="/account-icon.svg"
          alt="account icon"
          width={100}
          height={100}
          onClick={() => signIn('google', { callbackUrl: '/user' })}
        />
      )}
    </div>
  );
};

export default AccountIcon;
