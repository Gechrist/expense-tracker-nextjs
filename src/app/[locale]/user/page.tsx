'use client';
import { registerLicense } from '@syncfusion/ej2-base';
import React from 'react';
import dynamic from 'next/dynamic';

const page = () => {
  registerLicense(process.env.SYNCFUSION_LICENSE as string);

  const UserHome = dynamic(() => import('@/components/UserHome'), {
    ssr: false,
  });

  return (
    <div className=" h-auto w-full flex flex-col items-center justify-start mt-10 lg:mt-14 min-[2000px]:mt-20">
      <UserHome />
    </div>
  );
};

export default page;
