import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import SignInButton from '@/components/SignInButton';

export default async function Home() {
  const t = await getTranslations('Home');
  const features = ['Bills', 'Charts', 'Expenses'] as const;

  return (
    <main className="relative w-full h-4/5 flex space-y-4 lg:space-y-12 flex-col justify-center items-center ">
      <section className="flex flex-col divide-y-2 md:flex-row w-5/6 md:w-2/3 md:divide-y-0 md:divide-x-2 divide-[#1D1D1B] dark:divide-sky-50 h-auto justify-around rounded">
        {features.map((feature) => (
          <div
            key={`${feature}.name`}
            className="flex flex-col space-y-3 items-center p-2"
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
              className="w-[45px] min-[2000px]:w-[130px]"
              width={80}
              height={80}
            />
            <p className="font-bold underline decoration-[#1D1D1B] dark:decoration-sky-50 underline-offset-2">
              {t(`${feature}.name`)}
            </p>
            <p className="text-center">{t(`${feature}.desc`)}</p>
          </div>
        ))}
      </section>
      <SignInButton />
    </main>
  );
}
