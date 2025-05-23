'use client';
import { useTranslations } from 'next-intl';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Menu = () => {
  const t = useTranslations('Home');
  const features = ['Bills', 'Charts', 'Expenses'];
  return (
    <section className="flex flex-row w-auto space-x-4 min-[2000px]:space-x-8 items-center">
      {features.map((feature) => (
        <div
          key={`${feature}.name`}
          className="w-full rounded h-full cursor-pointer dark:active:bg-white active:bg-black"
        >
          <Link
            href={`/user/${feature.toLowerCase()}`}
            className="flex flex-col items-center space-y-2 active:filter active:invert p-2"
          >
            <Image
              src={`${
                feature === 'Bills'
                  ? '/bills-icon.svg'
                  : feature === 'Charts'
                  ? '/charts-icon.svg'
                  : '/expenses-icon.svg'
              }`}
              alt="feature icon"
              className="w-[25px] min-[2000px]:w-[80px]"
              width={80}
              height={80}
            />
            <p className="hidden md:flex font-bold hover:border-b-2  border-black dark:border-white">
              {t(`${feature}.name`)}
            </p>
          </Link>
        </div>
      ))}
    </section>
  );
};

export default Menu;
