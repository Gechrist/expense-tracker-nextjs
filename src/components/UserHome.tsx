'use client';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect, useRef } from 'react';
import {
  AccumulationChartComponent,
  AccumulationDataLabel,
  AccumulationDataLabelSettingsModel,
  AccumulationLegend,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  Inject,
  LegendSettingsModel,
} from '@syncfusion/ej2-react-charts';
import {
  loadCldr,
  setCulture,
  setCurrencyCode,
  L10n,
} from '@syncfusion/ej2-base';
import {
  SkeletonComponent,
  ToastComponent,
} from '@syncfusion/ej2-react-notifications';
import { getRecords } from '@/utils/utils';
import { Records } from './UserBillsExpenses';
import numbers from '../../node_modules/cldr-data/main/el/numbers.json';
import timeZoneNames from '../../node_modules/cldr-data/main/el/timeZoneNames.json';
import caGregorian from '../../node_modules/cldr-data/main/el/ca-gregorian.json';
import currencies from '../../node_modules/cldr-data/main/el/currencies.json';
import numberingSystems from '../../node_modules/cldr-data/supplemental/numberingSystems.json';
import el from '../../messages/elLocalization.json';
import useDarkMode from 'use-dark-mode';
import GridComponentFactory from './GridComponentFactory';
import '@/styles/SyncFusion.css';

const UserHome = () => {
  const t = useTranslations('UserHome');
  const te = useTranslations('UserBillsExpenses');
  const locale = useLocale();
  const { data: session } = useSession<boolean>();
  const [records, setRecords] = useState<
    Records & {
      accumulatedMonthExpensesPerCategory: any;
      recentBills: any;
      recentExpenses: any;
      monthExpenseAmount: any;
    }
  >(
    {} as Records & {
      accumulatedMonthExpensesPerCategory: any;
      recentBills: any;
      recentExpenses: any;
      monthExpenseAmount: any;
    }
  );

  if (locale.includes('el')) {
    L10n.load(el);
    loadCldr(caGregorian, currencies, numbers, timeZoneNames, numberingSystems);
    setCulture('el');
    setCurrencyCode('EUR');
  }

  const darkMode = useDarkMode(false);

  // toast notification
  const toastInstance = useRef<ToastComponent>(null);

  //accumulation chart

  const billsCols: { field: string; header: string }[] = [
    { field: 'billIssuerOrExpenseType', header: t('billsTableHeaderIssuer') },
    { field: 'type', header: 'type' },
    { field: 'amount', header: t('tableHeaderAmount') },
    { field: 'dueDate', header: t('billsTableHeaderDate') },
  ];

  const expensesCols: { field: string; header: string }[] = [
    {
      field: 'billIssuerOrExpenseType',
      header: t('expensesTableHeaderCategory'),
    },
    { field: 'type', header: 'type' },
    { field: 'amount', header: t('tableHeaderAmount') },
    { field: 'paymentDate', header: t('expensesTableHeaderDate') },
  ];

  const dataLabel: AccumulationDataLabelSettingsModel = {
    visible: true,
    name: 'text',
    position: 'Outside',
    textWrap: 'Wrap',
    font: { fontFamily: 'comfortaa' },
  };

  const legendSettings: LegendSettingsModel = {
    visible: true,
    position: 'Bottom',
    textStyle: {
      fontFamily: 'comfortaa',
      color: darkMode.value ? 'white' : 'black',
    },
  };

  const colorPalette = [
    '#7C00FE',

    '#F9E400',

    '#FFAF00',

    '#F5004F',

    '#36BA98',

    '#CEDF9F',

    '#AAB396',

    '#0A6847',

    '#C6A969',
    '#6CBEC7',
  ];

  const getData = async () => {
    let data = await getRecords(
      session?.user?.email as string,
      locale.includes('en') ? 'Bills' : 'Λογαριασμοί',
      'true',
      'false',
      'false',
      'false',
      'false',
      'false',
      'false',
      'false'
    );
    if (data && typeof data !== 'string' && !data.error) {
      setRecords((prevState: any) => {
        return { ...prevState, ...data };
      });
    } else if (typeof data === 'string' || data.error) {
      toastInstance?.current?.show({
        title: te('toastError'),
        content: te('errorRetrieving'),
        cssClass: 'e-toast-warning',
      });
    }
  };

  const abortController = new AbortController();
  useEffect(() => {
    getData();

    return () => abortController.abort();
  }, []);

  return (
    <section className="dark:bg-neutral-700 bg-white rounded w-11/12 px-2 pt-4 pb-6 flex justify-around gap-4 items-center flex-col ">
      <ToastComponent
        ref={toastInstance}
        position={{ X: 'Center', Y: 'Top' }}
      />
      <h1>{t('title')}</h1>
      <div
        className={`w-full flex justify-around items-start gap-4 flex-wrap ${
          darkMode.value ? 'e-dark-mode' : ''
        }`}
      >
        <div className="w-full lg:w-[47%] flex flex-col justify-center items-center space-y-4">
          <h2>{t('billsText')}</h2>
          <div className="w-full">
            {records.recentBills ? (
              <GridComponentFactory
                data={{
                  result: records.recentBills,
                  count: records.recentBills ? records.recentBills.length : 0,
                }}
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
              />
            ) : (
              <SkeletonComponent shape="rectangle" width="100%" height={100} />
            )}
          </div>
        </div>
        <div className="w-full lg:w-[47%] flex flex-col justify-center items-center space-y-4">
          <h2 className="dark:text-white">{t('expensesText')}</h2>
          <div className="w-full">
            {records.recentExpenses ? (
              <GridComponentFactory
                data={{
                  result: records.recentExpenses,
                  count: records.recentExpenses
                    ? records.recentExpenses.length
                    : 0,
                }}
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
              />
            ) : (
              <SkeletonComponent width="100%" height={100} />
            )}
          </div>
        </div>
        {records?.accumulatedMonthExpensesPerCategory?.length > 0 ? (
          <div className="w-full m-auto">
            <AccumulationChartComponent
              id="charts"
              legendSettings={legendSettings}
              centerLabel={{
                text: t(
                  'expensesSoFarPill',
                  {
                    amount: Number.isNaN(records.monthExpenseAmount)
                      ? 0
                      : records.monthExpenseAmount,
                  },
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
                  fontFamily: 'comfortaa',
                },
              }}
            >
              <Inject services={[AccumulationDataLabel, AccumulationLegend]} />
              <AccumulationSeriesCollectionDirective>
                <AccumulationSeriesDirective
                  dataSource={records.accumulatedMonthExpensesPerCategory}
                  pointColorMapping="fill"
                  palettes={colorPalette}
                  xName="billIssuerOrExpenseType"
                  yName="amount"
                  innerRadius="58%"
                  dataLabel={dataLabel}
                  height="100%"
                  width="100%"
                ></AccumulationSeriesDirective>
              </AccumulationSeriesCollectionDirective>
            </AccumulationChartComponent>
          </div>
        ) : (
          <div className="w-full flex flex-row justify-center text-lg mt-28">
            {t(
              'expensesSoFarPill',
              { amount: 0 },
              {
                number: {
                  currency: {
                    style: 'currency',
                    currency: `${locale.includes('el') ? 'EUR' : 'USD'}`,
                  },
                },
              }
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default UserHome;
