'use client';
import { useTranslations, useLocale } from 'next-intl';
import {
  NumericTextBoxComponent,
  FormValidator,
  FormValidatorModel,
  TextAreaComponent,
} from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';
import {
  L10n,
  loadCldr,
  setCulture,
  setCurrencyCode,
} from '@syncfusion/ej2/base';
import { expenseFields, minDate, sortOrder } from '@/styles/utils/utils';
import numbers from '../../node_modules/cldr-data/main/el/numbers.json';
import timeZoneNames from '../../node_modules/cldr-data/main/el/timeZoneNames.json';
import caGregorian from '../../node_modules/cldr-data/main/el/ca-gregorian.json';
import currencies from '../../node_modules/cldr-data/main/el/currencies.json';
import numberingSystems from '../../node_modules/cldr-data/supplemental/numberingSystems.json';
import weekData from '../../node_modules/cldr-data/supplemental/weekData.json';
import useDarkMode from 'use-dark-mode';
import el from './elLocalization.json';
import React from 'react';
import GridComponentFactory from './GridComponentFactory';
import Link from 'next/link';
import Image from 'next/image';
import '@/styles/SyncFusion.css';

const UserExpenses = () => {
  const t = useTranslations('UserBillsExpenses');
  const te = useTranslations('UserBillsExpenses.Expenses');
  const th = useTranslations('UserHome');
  const locale = useLocale();

  if (locale.includes('el')) {
    loadCldr(
      caGregorian,
      currencies,
      numbers,
      timeZoneNames,
      numberingSystems,
      weekData
    );
    L10n.load(el);
    setCulture('el');
    setCurrencyCode('EUR');
  } else {
    L10n.load({
      'en-US': {
        grid: {
          ConfirmDelete:
            'Are you certain that you want to delete the record(s)?',
        },
      },
    });
  }

  // check for dark mode
  const darkMode = useDarkMode(false);

  // value and item template for dropdownlist

  const dropdownIconTemplate = (props: any) => {
    return (
      <div className="flex flex-row gap-3 items-center ml-2">
        <Image
          src={
            props.Id === 'misc'
              ? '/miscellaneous-icon.svg'
              : props.Id === 'taxes'
              ? '/tax-icon.svg'
              : props.Id === 'transportation'
              ? '/transportation-icon.svg'
              : props.Id === 'medical'
              ? '/medical-icon.svg'
              : props.Id === 'utilities'
              ? '/utilities-icon.svg'
              : props.Id === 'leisure'
              ? '/utilities-icon.svg'
              : props.Id === 'foodstuff'
              ? '/foodstuff-icon.svg'
              : props.Id === 'electronics'
              ? '/electronics-icon.svg'
              : props.Id === 'telecoms'
              ? '/telecoms-icon.svg'
              : props.Id === 'rent'
              ? '/rent-icon.svg'
              : '/loans-icon.svg'
          }
          alt="expense type icon"
          width={22}
          height={22}
        />
        <div>{props.Type}</div>
      </div>
    );
  };

  const expenseTypes: { Type: string; Id: string }[] = [
    { Type: te('taxes'), Id: 'taxes' },
    {
      Type: te('transportation'),

      Id: 'transportation',
    },
    { Type: te('misc'), Id: 'misc' },
    { Type: te('medical'), Id: 'medical' },
    { Type: te('utilities'), Id: 'utilities' },
    { Type: te('leisure'), Id: 'leisure' },
    { Type: te('foodstuff'), Id: 'foodstuff' },
    { Type: te('electronics'), Id: 'electronics' },
    { Type: te('telecoms'), Id: 'telecoms' },
    { Type: te('rent'), Id: 'rent' },
    { Type: te('loans'), Id: 'loans' },
  ] as const;

  const expensesPlaceholder = [
    {
      id: 'sds',
      category: 'misc',
      amount: '100',
      date: new Date('2022-12-17T03:24:00'),
      comments: 'asdasdasd',
    },
  ];

  const expensesCols: { field: string; header: string }[] = [
    { field: 'id', header: 'id' },
    { field: 'category', header: th('expensesTableHeaderCategory') },
    { field: 'amount', header: th('tableHeaderAmount') },
    { field: 'comments', header: t('comments') },
    { field: 'date', header: th('expensesTableHeaderDate') },
  ];

  return (
    <section
      className={`dark:bg-neutral-700 bg-white rounded w-11/12 px-2 pt-4 pb-6 flex justify-around gap-4 items-center flex-col ${
        darkMode.value ? 'e-dark-mode' : ''
      }`}
    >
      <div className="w-full grid grid-cols-3 mx-auto my-0 items-center">
        <Link href="/user" className="flex flex-row gap-2">
          <Image
            src="/left-arrow.svg"
            alt="return to user home"
            className="dark:invert w-[18px] min-[2000px]:w-[40px]"
            width={40}
            height={40}
          />
          <p className="hover:border-b-2 border-black dark:border-white">
            {t('returnToHome')}
          </p>
        </Link>
        <h1 className="text-center">{t('newExpense')}</h1>
      </div>
      <div className="w-full flex justify-center items-center gap-4 flex-wrap">
        <div className="w-full lg:w-1/4">
          <DropDownListComponent
            id="ddlelement"
            dataSource={expenseTypes}
            sortOrder={sortOrder}
            valueTemplate={dropdownIconTemplate}
            itemTemplate={dropdownIconTemplate}
            fields={expenseFields}
            placeholder={t('expenseTypePlaceholder')}
          />
        </div>
        <div className="w-full lg:w-1/4">
          <NumericTextBoxComponent
            value={0}
            min={0}
            format="c2"
            validateDecimalOnType={true}
            decimals={2}
          />
        </div>
        <div className="w-full lg:w-1/4">
          <DatePickerComponent
            id="datepicker"
            placeholder={th('expensesTableHeaderDate')}
            min={minDate}
          />
        </div>
        <div className="w-full lg:w-1/4">
          <TextAreaComponent
            id="default"
            placeholder={t('comments')}
            maxLength={200}
          ></TextAreaComponent>
        </div>
      </div>
      <div>
        <button>{t('saveExpense')}</button>
      </div>
      <div className="w-full">
        <h2 className='mb-2'>{t('expenses')}</h2>
        <GridComponentFactory
          data={expensesPlaceholder}
          cols={expensesCols}
          allowSorting={true}
          allowPaging={true}
          allowResizing={true}
          allowFiltering={true}
          allowReordering={true}
          allowGrouping={true}
          allowAdding={false}
          allowDeleting={true}
          allowEditing={true}
          categoryAsDropdown={true}
        />
      </div>
    </section>
  );
};

export default UserExpenses;
