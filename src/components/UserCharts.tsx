import {
  IDataOptions,
  IDataSet,
  PivotViewComponent,
  Inject,
  DisplayOption,
  PivotChart,
} from '@syncfusion/ej2-react-pivotview';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { ChartSettings } from '@syncfusion/ej2-pivotview/src/pivotview/model/chartsettings';
import { useTranslations } from 'next-intl';
import useDarkMode from 'use-dark-mode';
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import '@/styles/SyncFusion.css';
import {
  DatePicker,
  DateRangePickerComponent,
} from '@syncfusion/ej2-react-calendars';

function UserCharts(this: React.ReactNode) {
  let displayOption: DisplayOption = {
    view: 'Chart',
  } as DisplayOption;

  let chartSettings: ChartSettings = {
    chartSeries: { type: 'Bar' },
  } as ChartSettings;

  // check for dark mode
  const darkMode = useDarkMode(false);
  // i18n hooks
  const t = useTranslations('UserBillsExpenses');

  const billsPlaceholder = [
    {
      id: 'sd',
      issuer: 'dei',
      amount: 100,
      date: new Date('1995-12-17T03:24:00'),
      quarter: 'Q2',
      year: '2000',
    },
    {
      id: 'sd',
      issuer: 'dei',
      amount: 110,
      date: new Date('2002-12-17T03:24:00'),
      paidBill: true,
      calendarAlert: true,
      calendarDate: new Date('1995-12-17T03:24:00'),
      comments: 'sdsdsdsds',
      quarter: 'Q1',
      year: '2000',
    },
    {
      id: 'sd',
      issuer: 'dei',
      amount: 100,
      date: new Date('1995-12-17T03:24:00'),
      quarter: 'Q1',
      year: '2003',
    },
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

  let dataSourceSettings: IDataOptions = {
    columns: [{ name: 'Year', caption: 'Production Year' }],
    dataSource: billsPlaceholder as unknown as IDataSet[],
    expandAll: false,
    filters: [],
    formatSettings: [{ name: 'Amount', format: 'C0' }],
    rows: [{ name: 'Quarter' }],
    values: [{ name: 'Amount', caption: 'Sold Amount' }],
  };

  let fields: object = { text: 'text', value: 'value' };

  let chartSources = [
    { value: 'bills', text: 'Bills' },
    { value: 'expenses', text: 'Expenses' },
  ];

  let chartTypes = [
    { value: 'Pie', text: 'Pie' },
    { value: 'Doughnut', text: 'Doughnut' },
    { value: 'Funnel', text: 'Funnel' },
    { value: 'Line', text: 'Line' },
    { value: 'Column', text: 'Column' },
    { value: 'Area', text: 'Area' },
    { value: 'Bar', text: 'Bar' },
    { value: 'StepArea', text: 'StepArea' },
    { value: 'StackingLine', text: 'StackingLine' },
    { value: 'StackingColumn', text: 'StackingColumn' },
    { value: 'StackingArea', text: 'StackingArea' },
    { value: 'StackingBar', text: 'StackingBar' },
    { value: 'StepLine', text: 'StepLine' },
    { value: 'Pareto', text: 'Pareto' },
    { value: 'Scatter', text: 'Scatter' },
    { value: 'Bubble', text: 'Bubble' },
    { value: 'Spline', text: 'Spline' },
    { value: 'SplineArea', text: 'SplineArea' },
    { value: 'StackingLine100', text: 'StackingLine100' },
    { value: 'StackingColumn100', text: 'StackingColumn100' },
    { value: 'StackingBar100', text: 'StackingBar100' },
    { value: 'StackingArea100', text: 'StackingArea100' },
    { value: 'Polar', text: 'Polar' },
    { value: 'Radar', text: 'Radar' },
  ];

  let pivotObj: PivotViewComponent | undefined;
  function ddlOnChange(args: any) {
    pivotObj!.chartSettings.chartSeries!.type = args.value;
  }

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
        <div className="dropdown-control flex flex-col gap-4">
          <h2>Chart:</h2>
          <div className="flex flex-row gap-2">
            <DropDownListComponent
              floatLabelType={'Auto'}
              fields={fields}
              change={ddlOnChange.bind(this)}
              id="charttypes"
              index={0}
              enabled={true}
              dataSource={chartTypes}
            />
            <DropDownListComponent
              floatLabelType={'Auto'}
              fields={fields}
              change={ddlOnChange.bind(this)}
              id="charttypes"
              index={0}
              enabled={true}
              dataSource={chartSources}
            />
            <DateRangePickerComponent
              id="daterangepicker"
              placeholder="Select a range"
            />
          </div>
        </div>
      </div>
      <div className="container w-full flex justify-center">
        <div>
          <PivotViewComponent
            height={350}
            ref={(d: PivotViewComponent) =>
              (pivotObj = d) as unknown as undefined
            }
            id="PivotView"
            chartSettings={chartSettings}
            displayOption={displayOption}
            dataSourceSettings={dataSourceSettings}
          >
            <Inject services={[PivotChart]} />
          </PivotViewComponent>
        </div>
      </div>
    </section>
  );
}

export default UserCharts;
