'use client';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import {
  AccumulationChartComponent,
  AccumulationDataLabel,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  Inject,
} from '@syncfusion/ej2-react-charts';
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
import React from 'react';
import useDarkMode from 'use-dark-mode';
import GridComponentFactory from './GridComponentFactory';
import '@/styles/SyncFusion.css';

const UserHome = () => {
  const t = useTranslations('UserHome');
  const te = useTranslations('UserBillsExpenses.Expenses');
  const locale = useLocale();

  if (locale.includes('el')) {
    L10n.load(el);
    loadCldr(caGregorian, currencies, numbers, timeZoneNames, numberingSystems);
    setCulture('el');
    setCurrencyCode('EUR');
  }

  const darkMode = useDarkMode(false);
  const billsPlaceholder = [
    {
      id: 'sd',
      issuer: 'dei',
      amount: 100,
      date: new Date('1995-12-17T03:24:00'),
    },
    {
      id: 'sd',
      issuer: 'dei',
      amount: 1002,
      date: new Date('1995-12-17T03:24:00'),
    },
    { id: 'sd', issuer: 'dei', amount: 100, date: '23-10-2023' },
    { id: 'sd', issuer: 'dei', amount: 100, date: '23-10-2023' },
  ];

  const expensesPlaceholder = [
    {
      id: 'sds',
      category: 'misc',
      amount: '100',
      date: new Date('2022-12-17T03:24:00'),
      comments: 'asdasdasd',
    },
  ];

  const accData = [
    { x: 'transportation', y: 3 },
    { x: 'foodstuff', y: 3.5 },
    { x: 'utilities', y: 7 },
    { x: 'taxes', y: 13.5 },
    { x: 'loans', y: 19 },
    { x: 'leisure', y: 19 },
    { x: 'misc', y: 19 },
    { x: 'medical', y: 3 },
    { x: 'electronics', y: 19 },
    { x: 'telecoms', y: 19 },
  ];

  accData.map(
    (
      entry: { x: string; y: number; text?: string; fill?: string },
      index: number
    ) => {
      entry.text = `${te(entry.x)}: ${entry.y}`;
      entry.fill =
        index === 0
          ? '#7C00FE'
          : index === 1
          ? '#F9E400'
          : index === 2
          ? '#FFAF00'
          : index === 3
          ? '#F5004F'
          : index === 4
          ? '#36BA98'
          : index === 5
          ? '#CEDF9F'
          : index === 6
          ? '#AAB396'
          : index === 7
          ? '#0A6847'
          : index === 8
          ? '#C6A969'
          : '#6CBEC7';
    }
  );

  const billsCols: { field: string; header: string }[] = [
    { field: 'issuer', header: t('billsTableHeaderIssuer') },
    { field: 'amount', header: t('tableHeaderAmount') },
    { field: 'date', header: t('billsTableHeaderDate') },
  ];

  const expensesCols: { field: string; header: string }[] = [
    { field: 'category', header: t('expensesTableHeaderCategory') },
    { field: 'amount', header: t('tableHeaderAmount') },
    { field: 'date', header: t('expensesTableHeaderDate') },
  ];

  const dataLabel = {
    visible: true,
    name: 'text',
    position: 'Outside',
    textWrap: 'Wrap',
  };

  return (
    <section className="dark:bg-neutral-700 bg-white rounded w-11/12 px-2 pt-4 pb-6 flex justify-around gap-4 items-center flex-col ">
      <h1>{t('title')}</h1>
      <div
        className={`w-full flex justify-around items-center gap-4 flex-wrap ${
          darkMode.value ? 'e-dark-mode' : ''
        }`}
      >
        <div className="w-full lg:w-[47%] flex flex-col justify-center items-center space-y-4">
          <h2>{t('billsText')}</h2>
          <div className="w-full">
            <GridComponentFactory
              data={billsPlaceholder}
              cols={billsCols}
              allowSorting={false}
              allowPaging={false}
              allowResizing={false}
              allowFiltering={false}
              allowReordering={false}
              allowGrouping={false}
              allowAdding={false}
              allowDeleting={false}
              allowEditing={false}
              limitResults={true}
            />
          </div>
        </div>
        <div className="w-full lg:w-[47%] flex flex-col justify-center items-center space-y-4">
          <h2 className="dark:text-white">{t('expensesText')}</h2>
          <div className="w-full">
            <GridComponentFactory
              data={expensesPlaceholder}
              cols={expensesCols}
              allowSorting={false}
              allowPaging={false}
              allowResizing={false}
              allowFiltering={false}
              allowReordering={false}
              allowGrouping={false}
              allowAdding={false}
              allowDeleting={false}
              allowEditing={false}
              limitResults={true}
            />
          </div>
        </div>
        <div className="w-full h-[200px] md:h-[500px] min-[2000px]:h-[900px] m-auto lg:w-1/2">
          <AccumulationChartComponent
            id="charts"
            centerLabel={{
              text: t(
                'expensesSoFarPill',
                { amount: 20000 },
                {
                  number: {
                    currency: {
                      style: 'currency',
                      currency: `${locale.includes('el') ? 'EUR' : 'USD'}`,
                    },
                  },
                }
              ),
              textStyle: {
                fontWeight: '900',
                size: '100%',
                color: darkMode.value ? 'white' : 'black',
                fontFamily: 'Comfortaa',
              },
            }}
          >
            <Inject services={[AccumulationDataLabel]} />
            <AccumulationSeriesCollectionDirective>
              <AccumulationSeriesDirective
                dataSource={accData}
                pointColorMapping="fill"
                xName="x"
                yName="y"
                innerRadius="40%"
                dataLabel={dataLabel}
                height="100%"
                width="100%"
              ></AccumulationSeriesDirective>
            </AccumulationSeriesCollectionDirective>
          </AccumulationChartComponent>
        </div>
      </div>
    </section>
  );
};

export default UserHome;
