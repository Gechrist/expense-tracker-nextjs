import {
  IDataOptions,
  PivotViewComponent,
  Inject,
  DisplayOption,
  PivotChart,
  PDFExport,
  FieldList,
} from '@syncfusion/ej2-react-pivotview';
import {
  createSpinner,
  showSpinner,
  hideSpinner,
} from '@syncfusion/ej2-popups';
import { L10n, loadCldr, setCulture } from '@syncfusion/ej2/base';
import { redirect } from 'next/navigation';
import {
  DropDownListComponent,
  VirtualScroll,
} from '@syncfusion/ej2-react-dropdowns';
import { DateRangePickerComponent } from '@syncfusion/ej2-react-calendars';
import { ChartSettings } from '@syncfusion/ej2-pivotview/src/pivotview/model/chartsettings';
import { useTranslations, useLocale } from 'next-intl';
import { getRecords, sortOrder } from '@/utils/utils';
import { useState, useEffect, useRef } from 'react';
import {
  SkeletonComponent,
  ToastComponent,
} from '@syncfusion/ej2-react-notifications';
import { useDarkMode } from 'usehooks-ts';
import numbers from '../../node_modules/cldr-data/main/el/numbers.json';
import timeZoneNames from '../../node_modules/cldr-data/main/el/timeZoneNames.json';
import caGregorian from '../../node_modules/cldr-data/main/el/ca-gregorian.json';
import currencies from '../../node_modules/cldr-data/main/el/currencies.json';
import numberingSystems from '../../node_modules/cldr-data/supplemental/numberingSystems.json';
import weekData from '../../node_modules/cldr-data/supplemental/weekData.json';
import el from '../../messages/elLocalization.json';
import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import '@/styles/SyncFusion.css';

const UserCharts = (): React.ReactNode => {
  const locale = useLocale();
  const t = useTranslations('UserCharts');
  const te = useTranslations('UserBillsExpenses');
  const [records, setRecords] = useState<any>({});
  const sectionRef = useRef<HTMLElement>(null);
  const pivotObj = useRef<PivotViewComponent>(null);

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

  //toast notification
  const toastInstance = useRef<ToastComponent>(null);

  // check for dark mode
  const { isDarkMode } = useDarkMode();

  // table & charts settings

  let displayOption: DisplayOption = {
    view: 'Both',
    primary: 'Table',
  } as DisplayOption;

  let chartSettings: ChartSettings = {
    chartSeries: {
      type: 'Bar',
      dataLabel: {
        position: 'Inside',
        font: {
          fontFamily: 'comfortaa',
          color: isDarkMode ? '#d3d3d3' : 'black',
        },
      },
    },
    primaryXAxis: {
      title: t('billsAndExpenses'),
      titleStyle: {
        fontWeight: 'Bold',
        textOverflow: 'None',
        fontFamily: 'comfortaa',
        color: isDarkMode ? '#d3d3d3' : 'black',
      },
      labelStyle: {
        fontWeight: 'Bold',
        fontFamily: 'comfortaa',
        color: isDarkMode ? '#d3d3d3' : 'black',
      },
    },
    primaryYAxis: {
      title: t('amount'),
      titleStyle: {
        fontWeight: 'Bold',
        fontFamily: 'comfortaa',
        color: isDarkMode ? '#d3d3d3' : 'black',
      },
      labelStyle: {
        fontWeight: 'Bold',
        fontFamily: 'comfortaa',
        color: isDarkMode ? '#d3d3d3' : 'black',
      },
    },
    legendSettings: {
      textStyle: {
        fontFamily: 'comfortaa',
        color: isDarkMode ? '#d3d3d3' : 'black',
      },
    },
    zoomSettings: {
      enableMouseWheelZooming: true,
      enablePinchZooming: true,
    },
    tooltip: {
      textStyle: {
        fontFamily: 'comfortaa',
        color: isDarkMode ? '#d3d3d3' : 'black',
      },
    },
    multiLevelLabelRender: function (args: any) {
      args.textStyle.fontFamily = 'comfortaa';
      args.textStyle.color = isDarkMode ? '#d3d3d3' : 'black';
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

  let dataSourceSettings: IDataOptions = {
    dataSource: records.result,
    rows: [
      { name: 'type', caption: t('type') },
      {
        name: 'billIssuerOrExpenseType',
        caption: t('billIssuerOrExpenseType'),
      },
    ],
    expandAll: false,
    filters: [],
    formatSettings: [
      {
        name: 'amount',
        format: 'C0',
        currency: `${locale === 'el' ? 'EUR' : 'USD'}`,
      },
    ],
    columns: [
      { name: 'year', caption: t('year') },
      { name: 'month', caption: t('month') },
      { name: 'day', caption: t('day') },
    ],
    values: [{ name: 'amount', caption: t('amount') }],
    showRowSubTotals: false,
  };

  let gridSettings = {
    allowTextWrap: false,
    allowAutoResizing: true,
  };

  let chartTypes = [
    { value: 'Pie', text: t('pie') },
    { value: 'Doughnut', text: t('doughnut') },
    { value: 'Funnel', text: t('funnel') },
    { value: 'Line', text: t('line') },
    { value: 'Column', text: t('column') },
    { value: 'Area', text: t('area') },
    { value: 'Bar', text: t('bar') },
    { value: 'StepArea', text: 'Step Area' },
    { value: 'StackingLine', text: 'Stacking Line' },
    { value: 'StackingColumn', text: 'Stacking Column' },
    { value: 'StackingArea', text: 'Stacking Area' },
    { value: 'StackingBar', text: 'Stacking Bar' },
    { value: 'StepLine', text: 'Step Line' },
    { value: 'Pareto', text: t('pareto') },
    { value: 'Scatter', text: t('scatter') },
    { value: 'Bubble', text: t('bubble') },
    { value: 'Spline', text: 'Spline' },
    { value: 'SplineArea', text: 'Spline Area' },
    { value: 'StackingLine100', text: 'Stacking Line 100' },
    { value: 'StackingColumn100', text: 'Stacking Column 100' },
    { value: 'StackingBar100', text: 'Stacking Bar 100' },
    { value: 'StackingArea100', text: 'Stacking Area 100' },
    { value: 'Polar', text: t('polar') },
    { value: 'Radar', text: 'Radar' },
  ];

  let fields: object = { text: 'text', value: 'value' };

  let pdfExportProperties = {
    fileName: 'ExpenseTrackerExport.pdf',
  };

  function changeChartType(args: any): void {
    pivotObj!.current!.chartSettings.chartSeries!.type = args.value;
  }

  async function setDateRange(args: any) {
    showSpinner(sectionRef!.current as unknown as HTMLFormElement);
    const data = await getRecords(
      locale === 'en' ? 'Bills' : 'Λογαριασμοί',
      'false',
      'false',
      'true',
      args.value ? args.value[0] : 'false',
      args.value ? args.value[1] : 'false',
      'false',
      'false',
      'false'
    );
    if (data?.status) {
      redirect('/');
    }
    if ((data && typeof data !== 'string') || !data.error) {
      setRecords((prevState: any) => {
        return { ...prevState, ...data };
      });
      dataSourceSettings.dataSource = records.result;
      hideSpinner(sectionRef.current as unknown as HTMLFormElement);
    } else if (typeof data === 'string' || data.error) {
      hideSpinner(sectionRef.current as unknown as HTMLFormElement);
      toastInstance?.current?.show({
        title: te('toastError'),
        content: te('errorRetrieving'),
        cssClass: 'e-toast-warning',
      });
    }
  }

  function exportOnClick(): void {
    pivotObj!.current!.chartExport('PDF', pdfExportProperties);
  }

  const getData = async () => {
    let data = await getRecords(
      locale === 'en' ? 'Bills' : 'Λογαριασμοί',
      'false',
      'false',
      'true',
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
      hideSpinner(sectionRef?.current as unknown as HTMLFormElement);
    } else if (typeof data === 'string' || data.error) {
      hideSpinner(sectionRef?.current as unknown as HTMLFormElement);
      toastInstance?.current?.show({
        title: te('toastError'),
        content: te('errorRetrieving'),
        cssClass: 'e-toast-warning',
      });
    }
  };

  const abortController = new AbortController();
  useEffect(() => {
    createSpinner({ target: sectionRef.current as unknown as HTMLFormElement });
    getData();

    return () => abortController.abort();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`dark:bg-neutral-700 bg-white rounded w-11/12 px-2 pt-4 pb-6 flex justify-around gap-4 items-center flex-col ${
        isDarkMode ? 'e-dark-mode' : ''
      }`}
    >
      <ToastComponent
        ref={toastInstance}
        position={{ X: 'Center', Y: 'Top' }}
      />
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
      <div className="w-full flex flex-col justify-center gap-3">
        <div className="flex flex-row gap-2 grow flex-wrap md:flex-nowrap">
          <DropDownListComponent
            floatLabelType={'Auto'}
            fields={fields}
            change={changeChartType.bind(this)}
            id="chartTypes"
            index={0}
            value="Bar"
            enabled={true}
            dataSource={chartTypes}
            sortOrder={sortOrder}
            width="100%"
          />
          <DateRangePickerComponent
            // @ts-ignore
            placeholder={t('chartsPlaceholder')}
            change={setDateRange.bind(this)}
            start="year"
            format="yyyy-MM-dd"
            depth="year"
          />
        </div>
        {records.result ? (
          <PivotViewComponent
            ref={pivotObj}
            width="auto"
            height="auto"
            id="PivotView"
            gridSettings={gridSettings}
            chartSettings={chartSettings}
            displayOption={displayOption}
            dataSourceSettings={dataSourceSettings}
            allowPdfExport={true}
            showFieldList={true}
            enableVirtualization={true}
          >
            <Inject
              services={[PivotChart, PDFExport, FieldList, VirtualScroll]}
            />
          </PivotViewComponent>
        ) : (
          <SkeletonComponent height={100} width="100%" />
        )}
      </div>
      <div className="flex justify-center">
        <button
          className="w-auto"
          disabled={!records.result?.length}
          onClick={exportOnClick.bind(this)}
        >
          {t('export')}
        </button>
      </div>
    </section>
  );
};

export default UserCharts;
