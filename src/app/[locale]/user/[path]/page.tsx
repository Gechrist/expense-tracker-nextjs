'use client';
import { registerLicense } from '@syncfusion/ej2-base';
import React from 'react';
import dynamic from 'next/dynamic';

const page = ({ params }: { params: { path: string } }) => {
  registerLicense(process.env.SYNCFUSION_LICENSE as string);

  const UserBillsExpenses = dynamic(
    () => import('@/components/UserBillsExpenses'),
    {
      ssr: false,
    }
  );
  const UserCharts = dynamic(() => import('@/components/UserCharts'), {
    ssr: false,
  });

  return (
    <div className=" h-auto w-full flex flex-col items-center justify-start mt-10 lg:mt-14 min-[2000px]:mt-20">
      {params.path === 'bills' ? (
        <UserBillsExpenses pathName={params.path} />
      ) : params.path === 'expenses' ? (
        <UserBillsExpenses pathName={params.path} />
      ) : (
        <UserCharts />
      )}
    </div>
  );
};

export default page;
