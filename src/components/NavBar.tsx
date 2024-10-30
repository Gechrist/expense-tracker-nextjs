'use client';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import React from 'react';
import SelectLanguageButton from './SelectLanguageButton';
import Image from 'next/image';
import Menu from './Menu';
import AccountIcon from './AccountIcon';
import Link from 'next/link';

const NavBar = () => {
  const { data: session, status } = useSession<boolean>();
  const pathName = usePathname();
  return (
    <nav
      className="w-full px-2 min-[2000px]:px-12 md:pt-2 lg:pt-8 h-[60px] min-[2000px]:h-[140px] flex flex-row justify-between
     items-center"
    >
      <Link
        href="/"
        className="w-[10%] md:w-[4%] lg:w-[3%] filter invert dark:invert-0 cursor-pointer"
      >
        <Image
          src="/expensetracker-icon.svg"
          alt="app icon"
          width={80}
          height={80}
          priority={true}
        />
      </Link>
      {pathName.includes('user') && <Menu />}
      <section className="flex flex-row space-x-1 md:space-x-2 min-[2000px]:space-x-4 items-center justify-around h-full">
        <SelectLanguageButton />
        <AccountIcon status={status} session={session} />
      </section>
    </nav>
  );
};

export default NavBar;
