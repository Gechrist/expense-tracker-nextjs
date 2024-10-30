import {
  IDataOptions,
  IDataSet,
  PivotViewComponent,
  Inject,
  DisplayOption,
  PivotChart,
  PDFExport,
} from '@syncfusion/ej2-react-pivotview';
import { L10n, loadCldr, setCulture } from '@syncfusion/ej2/base';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { DateRangePickerComponent } from '@syncfusion/ej2-react-calendars';
import { ChartSettings } from '@syncfusion/ej2-pivotview/src/pivotview/model/chartsettings';
import { useTranslations, useLocale } from 'next-intl';
import numbers from '../../node_modules/cldr-data/main/el/numbers.json';
import timeZoneNames from '../../node_modules/cldr-data/main/el/timeZoneNames.json';
import caGregorian from '../../node_modules/cldr-data/main/el/ca-gregorian.json';
import currencies from '../../node_modules/cldr-data/main/el/currencies.json';
import numberingSystems from '../../node_modules/cldr-data/supplemental/numberingSystems.json';
import weekData from '../../node_modules/cldr-data/supplemental/weekData.json';
import useDarkMode from 'use-dark-mode';
import el from './elLocalization.json';
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import '@/styles/SyncFusion.css';

function UserCharts(this: React.ReactNode) {
  const locale = useLocale();
  const t = useTranslations('UserCharts');

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
  }

  // check for dark mode
  const darkMode = useDarkMode(false);

  // table & charts settings

  let displayOption: DisplayOption = {
    view: 'Both',
    primary: 'Table',
  } as DisplayOption;

  let chartSettings: ChartSettings = {
    chartSeries: { type: 'Bar' },
    primaryXAxis: { title: t('year') },
    primaryYAxis: { title: t('amount') },
    zoomSettings: {
      enableMouseWheelZooming: true,
      enablePinchZooming: true,
    },
    palettes: [
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
      '#DCA47C',
    ],
  } as ChartSettings;

  let testData: IDataSet[] = [
    {
      Type: 'expense',
      Amount: 383,
      Category: 'misc',
      Day: 'Monday',
      Year: '2015',
      Month: 'January',
    },
    {
      Type: 'Bill',
      Amount: 183,
      Category: 'dei',
      Day: 'Monday',
      Year: '2017',
      Month: 'May',
    },
    {
      Type: 'Bill',
      Amount: 83,
      Category: 'nero',
      Day: 'Monday',
      Year: '2015',
      Month: 'January',
    },
    {
      Type: 'Bill',
      Amount: 231,
      Category: 'zenith',
      Day: 'Tuesday',
      Year: '2016',
      Month: 'January',
    },
    {
      Type: 'Bill',
      Amount: 45,
      Category: 'dei',
      Day: 'Monday',
      Year: '2016',
      Month: 'November',
    },
    {
      Type: 'expense',
      Amount: 2233,
      Category: 'foodstuff',
      Day: 'Tuesday',
      Year: '2015',
      Month: 'January',
    },
    {
      Type: 'expense',
      Amount: 232,
      Category: 'misc',
      Day: 'Sunday',
      Year: '2015',
      Month: 'January',
    },
    {
      Type: 'expense',
      Amount: 177,
      Category: 'leisure',
      Day: 'Saturday',
      Year: '2015',
      Month: 'March',
    },
    {
      Type: 'expense',
      Amount: 972,
      Category: 'leisure',
      Day: 'Tuesday',
      Year: '2015',
      Month: 'March',
    },
    {
      Type: 'expense',
      Amount: 897,
      Category: 'foodstuff',
      Day: 'Monday',
      Year: '2015',
      Month: 'Apr',
    },
    {
      Type: 'expense',
      Amount: 92,
      Category: 'loans',
      Day: 'Wednesday',
      Year: '2015',
      Month: 'Apr',
    },
    {
      Type: 'expense',
      Amount: 123,
      Category: 'taxes',
      Day: 'Friday',
      Year: '2016',
      Month: 'Apr',
    },
    {
      Type: 'expense',
      Amount: 383,
      Category: 'transport',
      Day: 'Monday',
      Year: '2016',
      Month: 'December',
    },
  ];

  let dataSourceSettings: IDataOptions = {
    columns: [{ name: 'Type', caption: 'Type' }, { name: 'Category' }],
    dataSource: testData,
    expandAll: false,
    filters: [],
    formatSettings: [{ name: 'Amount', format: 'C0', currency: 'EUR' }],
    rows: [
      { name: 'Year', caption: 'Year' },
      { name: 'Month', caption: 'Month' },
      { name: 'Day', caption: 'Ημέρα' },
    ],
    values: [{ name: 'Amount' }],
    showRowSubTotals: false,
  };

  let gridSettings = {
    allowTextWrap: true,
  };

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

  let fields: object = { text: 'text', value: 'value' };

  let pivotObj: PivotViewComponent | undefined;

  let pdfExportProperties = {
    fileName: 'ExpenseTrackerExport.pdf',
  };

  function changeChartType(args: any): void {
    pivotObj!.chartSettings.chartSeries!.type = args.value;
  }

  function exportOnClick(): void {
    pivotObj!.pdfExport(pdfExportProperties, false, undefined, false, true);
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
        <h2>{t('title')}</h2>
      </div>
      <div className="container w-full flex flex-col justify-center gap-2">
        <div className="flex flex-row gap-2 grow flex-wrap md:flex-nowrap">
          <DropDownListComponent
            floatLabelType={'Auto'}
            fields={fields}
            change={changeChartType.bind(this)}
            id="chartTypes"
            index={0}
            enabled={true}
            dataSource={chartTypes}
            width="100%"
          />
          <DateRangePickerComponent
            // id="daterangepicker"
            placeholder={t('chartsPlaceholder')}
            start="Year"
            format="MM/yyyy"
            depth="Year"
          />
        </div>
        <PivotViewComponent
          ref={(d: PivotViewComponent) => {
            pivotObj = d;
          }}
          width="auto"
          id="PivotView"
          gridSettings={gridSettings}
          chartSettings={chartSettings}
          displayOption={displayOption}
          dataSourceSettings={dataSourceSettings}
          allowPdfExport={true}
        >
          <Inject services={[PivotChart, PDFExport]} />
        </PivotViewComponent>
      </div>
      <div className="flex justify-center">
        <button className="w-auto" onClick={exportOnClick.bind(this)}>
          {t('export')}
        </button>
      </div>
    </section>
  );
}

export default UserCharts;
