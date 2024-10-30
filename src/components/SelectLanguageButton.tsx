'use client';
import { useLocale } from 'next-intl';
import { ChangeEvent } from 'react';
import { useRouter, usePathname } from '@/navigation';
import {
  loadCldr,
  setCulture,
  setCurrencyCode,
  L10n,
} from '@syncfusion/ej2-base';
import numbers from '../../node_modules/cldr-data/main/el/numbers.json';
import timeZoneNames from '../../node_modules/cldr-data/main/el/timeZoneNames.json';
import caGregorian from '../../node_modules/cldr-data/main/el/ca-gregorian.json';
import currencies from '../../node_modules/cldr-data/main/el/currencies.json';
import numberingSystems from '../../node_modules/cldr-data/supplemental/numberingSystems.json';
import el from './elLocalization.json';

const SelectLanguageButton = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathName = usePathname();

  const changeLocaleFunction = (e: ChangeEvent<HTMLSelectElement>) => {
    router.replace(pathName, { locale: e.target.value });
    if (e.target.value === 'el') {
      L10n.load(el);
      loadCldr(
        caGregorian,
        currencies,
        numbers,
        timeZoneNames,
        numberingSystems
      );
      setCulture('el');
      setCurrencyCode('EUR');
    } else {
      setCulture('en');
      setCurrencyCode('USD');
    }
  };

  return (
    <select
      className="py-2 px-1 min-[2000px]:p-4"
      defaultValue={locale}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => {
        changeLocaleFunction(e);
      }}
    >
      <option value="el">ᴇʟ Ελληνικά</option>
      <option value="en">ᴇɴ English</option>
    </select>
  );
};

export default SelectLanguageButton;
