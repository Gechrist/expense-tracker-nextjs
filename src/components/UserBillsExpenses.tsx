'use client';
import { useTranslations, useLocale } from 'next-intl';
import {
  NumericTextBoxComponent,
  FormValidator,
  FormValidatorModel,
  TextAreaComponent,
  TextBoxComponent,
} from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import {
  DatePickerComponent,
  DateTimePickerComponent,
} from '@syncfusion/ej2-react-calendars';
import {
  L10n,
  loadCldr,
  setCulture,
  setCurrencyCode,
} from '@syncfusion/ej2/base';
import {
  SkeletonComponent,
  ToastComponent,
} from '@syncfusion/ej2-react-notifications';
import {
  createSpinner,
  showSpinner,
  hideSpinner,
} from '@syncfusion/ej2-popups';
import { expenseFields, getRecords, sortOrder } from '@/utils/utils';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import numbers from '../../node_modules/cldr-data/main/el/numbers.json';
import timeZoneNames from '../../node_modules/cldr-data/main/el/timeZoneNames.json';
import caGregorian from '../../node_modules/cldr-data/main/el/ca-gregorian.json';
import currencies from '../../node_modules/cldr-data/main/el/currencies.json';
import numberingSystems from '../../node_modules/cldr-data/supplemental/numberingSystems.json';
import weekData from '../../node_modules/cldr-data/supplemental/weekData.json';
import useDarkMode from 'use-dark-mode';
import el from '../../messages/elLocalization.json';
import React from 'react';
import GridComponentFactory from './GridComponentFactory';
import Link from 'next/link';
import Image from 'next/image';
import '@/styles/SyncFusion.css';

let formObject: FormValidator;

export type Records = {
  result: any;
  count: number;
};

const UserBillsExpenses = ({ pathName }: { pathName: string }) => {
  const t = useTranslations('UserBillsExpenses');
  const te = useTranslations('UserBillsExpenses.Expenses');
  const th = useTranslations('UserHome');
  const locale = useLocale();
  const { data: session } = useSession<boolean>();

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
          ConfirmDelete: 'Are you certain that you want to delete this record?',
        },
      },
    });
  }

  // check for dark mode
  const darkMode = useDarkMode(false);

  //useRef to pass to child grid component
  const childRef = useRef(null);

  //spinner
  const formRef = useRef<HTMLFormElement>(null);

  //toast
  const toastInstance = useRef<ToastComponent>(null);
  let toasts = [
    {
      title: t('toastSuccess'),
      content: t('successCreate'),
      cssClass: 'e-toast-success',
    },
    {
      title: t('toastError'),
      content: t('failedCreate'),
      cssClass: 'e-toast-warning',
    },
  ];

  // state and dispatch for form inputs
  const [state, dispatch] = useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case 'update':
          return { ...state, [action.field]: action.value };
        default:
          return state;
      }
    },
    {
      billIssuerOrExpenseType: '',
      amount: 0,
      dueDate: '',
      paymentDate: '',
      googleCalendarDate: '',
      comments: '',
    }
  );

  //update form values function
  const update = (field: any) => (event: any) => {
    dispatch({ type: 'update', field, value: event.value });
  };

  // form validation
  let formValidatorRules: FormValidatorModel;
  formValidatorRules = {
    rules: {
      ...(pathName.includes('bills') && {
        dueDate: {
          required: [true, t('errorRequiredMessage')],
          regex: [
            locale?.includes('el')
              ? new RegExp(
                  '^([1-9]|1[0-9]|2[0-9]|3[0-1])\\/([1-9]|1[0-2])\\/(19|20)\\d{2}(\\s([0-9]|1[0-2]):[0-5]\\d\\s[πμ].μ.)?$'
                )
              : new RegExp(
                  '^([1-9]|1[0-2])\\/([1-9]|1[0-9]|2[0-9]|3[0-1])\\/(19|20)\\d{2}(\\s([0-9]|1[0-2]):[0-5]\\d\\s[AP]M)?$'
                ),
            t('errorDateMessage'),
          ],
        },
      }),
      ...(pathName.includes('bills') && {
        googleCalendarDate: {
          regex: [
            locale?.includes('el')
              ? new RegExp(
                  '^([1-9]|1[0-9]|2[0-9]|3[0-1])\\/([1-9]|1[0-2])\\/(19|20)\\d{2}(\\s([0-9]|1[0-2]):[0-5]\\d\\s[πμ].μ.)?$'
                )
              : new RegExp(
                  '^([1-9]|1[0-2])\\/([1-9]|1[0-9]|2[0-9]|3[0-1])\\/(19|20)\\d{2}(\\s([0-9]|1[0-2]):[0-5]\\d\\s[AP]M)?$'
                ),
            t('errorDateMessage'),
          ],
        },
      }),
      billIssuerOrExpenseType: { required: [true, t('errorRequiredMessage')] },
      amount: { required: [true, t('errorRequiredMessage')] },
      comments: { required: false },
      paymentDate: {
        required: [pathName!.includes('expenses'), t('errorRequiredMessage')],
        regex: [
          locale?.includes('el')
            ? new RegExp(
                '^$|([1-9]|1[0-9]|2[0-9]|3[0-1])\\/([1-9]|1[0-2])\\/(19|20)\\d{2}(\\s([0-9]|1[0-2]):[0-5]\\d\\s[πμ].μ.)?$'
              )
            : new RegExp(
                '^$|([1-9]|1[0-2])\\/([1-9]|1[0-9]|2[0-9]|3[0-1])\\/(19|20)\\d{2}(\\s([0-9]|1[0-2]):[0-5]\\d\\s[AP]M)?$'
              ),
          t('errorDateMessage'),
        ],
      },
    },
  };

  const abortController = new AbortController();
  useEffect(() => {
    createSpinner({ target: formRef.current as HTMLFormElement });
    getData();

    return () => abortController.abort();
  }, []);

  useEffect(() => {
    formObject = new FormValidator('#form', formValidatorRules);
  }, [formValidatorRules]);

  const [records, setRecords] = useState<Records>({} as Records);
  const getData = async (skip?: string, sort?: string, filter?: string) => {
    let data = await getRecords(
      session?.user?.email as string,
      pathName.includes('bills') && locale.includes('en')
        ? 'Bills'
        : !pathName.includes('bills') && locale.includes('en')
        ? 'Expenses'
        : pathName.includes('bills') && locale.includes('el')
        ? 'Λογαριασμοί'
        : 'Δαπάνες',
      'false',
      'true',
      'false',
      'false',
      'false',
      skip ? skip : 'false',
      sort ? sort : 'false',
      filter ? filter : 'false'
    );
    if (data && typeof data !== 'string' && !data.error) {
      setRecords((prevState: any) => {
        return { ...prevState, ...data };
      });
    } else if (typeof data === 'string' || data.error) {
      toastInstance?.current?.show({
        title: t('toastError'),
        content: t('errorRetrieving'),
        cssClass: 'e-toast-warning',
      });
    }
  };

  const saveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    showSpinner(formRef.current as HTMLFormElement);
    if (!formObject.validate()) {
      hideSpinner(formRef.current as HTMLFormElement);
      return;
    }
    let formData: FormData = new FormData(e.target as HTMLFormElement);
    formData.append('createdBy', `${session!.user!.email}`);
    formData.append(
      'type',
      `${
        pathName.includes('bills') && locale.includes('en')
          ? 'Bills'
          : !pathName.includes('bills') && locale.includes('en')
          ? 'Expenses'
          : pathName.includes('bills') && locale.includes('el')
          ? 'Λογαριασμοί'
          : 'Δαπάνες'
      }`
    );
    try {
      const response = await fetch('/api/saveRecords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(7000),
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const json = await response.json();
      hideSpinner(formRef.current as HTMLFormElement);
      if (json.error || typeof json == 'string') {
        toastInstance.current?.show(toasts[1]);
      } else {
        toastInstance.current?.show(toasts[0]);
      }
      getData();
    } catch (err: any) {
      hideSpinner(formRef.current as HTMLFormElement);
      console.error('Error:', err.message);
      toastInstance.current?.show(toasts[1]);
    }
  };

  // value and item template for dropdownlist

  const selectedDropdownIconTemplate = (props: any) => {
    return (
      <div className="flex flex-row gap-3 items-center ml-2">
        <Image
          src={
            props.Id === 'Miscellaneous' || props.Id === 'Διάφορα'
              ? '/miscellaneous-icon.svg'
              : props.Id === 'Taxes' || props.Id === 'Φόροι'
              ? '/tax-icon.svg'
              : props.Id === 'Transportation' || props.Id === 'Μεταφορικά'
              ? '/transportation-icon.svg'
              : props.Id === 'Medical' || props.Id === 'Ιατρικά'
              ? '/medical-icon.svg'
              : props.Id === 'Utilities' || props.Id === 'Κοινής Ωφέλειας'
              ? '/utilities-icon.svg'
              : props.Id === 'Leisure' || props.Id === 'Αναψυχή/Διασκέδαση'
              ? '/leisure-icon.svg'
              : props.Id === 'Foodstuffs' || props.Id === 'Τρόφιμα'
              ? '/foodstuff-icon.svg'
              : props.Id === 'Electronics/Appliances' ||
                props.Id === 'Ηλεκτρ. είδη/Ηλεκτρ. συσκευές'
              ? '/electronics-icon.svg'
              : props.Id === 'Telecommunications' ||
                props.Id === 'Τηλεπικοινωνίες'
              ? '/telecoms-icon.svg'
              : props.Id === 'Rent/Leasing' || props.Id === 'Ενοίκια/Μισθώσεις'
              ? '/rent-icon.svg'
              : props.Id === 'Loans' || props.Id === 'Δάνεια'
              ? '/loans-icon.svg'
              : '/no-category-icon.svg'
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
    { Type: te('taxes'), Id: te('taxes') },
    {
      Type: te('transportation'),

      Id: te('transportation'),
    },
    { Type: te('misc'), Id: te('misc') },
    { Type: te('medical'), Id: te('medical') },
    { Type: te('utilities'), Id: te('utilities') },
    { Type: te('leisure'), Id: te('leisure') },
    { Type: te('foodstuff'), Id: te('foodstuff') },
    { Type: te('electronics'), Id: te('electronics') },
    { Type: te('telecoms'), Id: te('telecoms') },
    { Type: te('rent'), Id: te('rent') },
    { Type: te('loans'), Id: te('loans') },
  ] as const;

  const billsCols: { field: string; header: string }[] = [
    { field: 'id', header: 'id' },
    { field: 'type', header: 'type' },
    { field: 'billIssuerOrExpenseType', header: th('billsTableHeaderIssuer') },
    { field: 'amount', header: th('tableHeaderAmount') },
    { field: 'comments', header: t('comments') },
    { field: 'dueDate', header: t('billDueDate') },
    { field: 'paymentDate', header: t('billPaymentDate') },
    { field: 'googleCalendarDate', header: t('googleCalendarDate') },
  ];

  const expensesCols: { field: string; header: string }[] = [
    { field: 'id', header: 'id' },
    { field: 'type', header: 'type' },
    {
      field: 'billIssuerOrExpenseType',
      header: th('expensesTableHeaderCategory'),
    },
    { field: 'amount', header: th('tableHeaderAmount') },
    { field: 'comments', header: t('comments') },
    { field: 'paymentDate', header: th('expensesTableHeaderDate') },
  ];

  return (
    <section
      className={`dark:bg-neutral-700 bg-white rounded w-11/12 px-2 pt-4 pb-6 flex justify-around gap-4 items-center flex-col ${
        darkMode.value ? 'e-dark-mode' : ''
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
        <h1 className="text-center">{`${
          pathName!.includes('bills') ? t('newBill') : t('newExpense')
        }`}</h1>
      </div>
      {pathName!.includes('bills') ? (
        <div>
          <form
            ref={formRef}
            id="form"
            className="flex flex-col justify-center gap-3"
            method="POST"
            onSubmit={(e) => saveRecord(e)}
          >
            <div className="w-full flex justify-center items-center gap-6 flex-wrap">
              <div className="w-full lg:w-1/4">
                <TextBoxComponent
                  type="text"
                  name="billIssuerOrExpenseType"
                  value={state.billIssuerOrExpenseType}
                  change={update('billIssuerOrExpenseType')}
                  placeholder={t('billIssuer')}
                  floatLabelType="Auto"
                  data-msg-containerid="errorForBillIssuerOrExpenseType"
                />
                <div id="errorForBillIssuerOrExpenseType" />
              </div>
              <div className="w-full lg:w-1/4">
                <NumericTextBoxComponent
                  min={0}
                  format="c2"
                  name="amount"
                  value={state.amount}
                  change={update('amount')}
                  validateDecimalOnType={true}
                  decimals={2}
                  floatLabelType="Auto"
                  data-msg-containerid="errorForAmount"
                />
                <div id="errorForAmount" />
              </div>
              <div className="w-full lg:w-1/4">
                <DatePickerComponent
                  id="datepicker"
                  name="dueDate"
                  value={state.dueDate}
                  change={update('dueDate')}
                  placeholder={t('billDueDate')}
                  floatLabelType="Auto"
                  data-msg-containerid="errorForDueDate"
                />
                <div id="errorForDueDate" />
              </div>
              <div className="w-full lg:w-1/4">
                <DatePickerComponent
                  id="datepicker"
                  placeholder={t('billPaymentDate')}
                  name="paymentDate"
                  value={state.paymentDate}
                  change={update('paymentDate')}
                  floatLabelType="Auto"
                  data-msg-containerid="errorForPaymentDate"
                />
                <div id="errorForPaymentDate" />
              </div>
              <div className="w-full lg:w-1/4">
                <DateTimePickerComponent
                  id="datetimepicker"
                  placeholder={t('setTimeAndDateForAlertPlaceholder')}
                  name="googleCalendarDate"
                  value={state.googleCalendarDate}
                  change={update('googleCalendarDate')}
                  step={60}
                  floatLabelType="Auto"
                  data-msg-containerid="errorForGoogleCalenderDate"
                />
                <div id="errorForGoogleCalenderDate" />
              </div>
              <div className="w-full lg:w-1/4">
                <TextAreaComponent
                  id="default"
                  placeholder={t('comments')}
                  name="comments"
                  value={state.comments}
                  change={update('comments')}
                  maxLength={200}
                  floatLabelType="Auto"
                  data-msg-containerid="errorForComments"
                ></TextAreaComponent>
                <div id="errorForComments" />
              </div>
            </div>
            <div className="w-full flex justify-center">
              <button type="submit">{`${t('saveBill')}`}</button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <form
            className="flex flex-col justify-center gap-3"
            ref={formRef}
            id="form"
            method="POST"
            onSubmit={(e) => saveRecord(e)}
          >
            <div className="w-full flex justify-center items-center gap-6 flex-wrap">
              <div className="w-full lg:w-1/3 flex-grow">
                <DropDownListComponent
                  id="ddlelement"
                  dataSource={expenseTypes}
                  sortOrder={sortOrder}
                  itemTemplate={selectedDropdownIconTemplate}
                  valueTemplate={selectedDropdownIconTemplate}
                  name="billIssuerOrExpenseType"
                  value={state.billIssuerOrExpenseType}
                  change={update('billIssuerOrExpenseType')}
                  fields={expenseFields}
                  placeholder={t('expenseTypePlaceholder')}
                  floatLabelType="Auto"
                  data-msg-containerid="errorForBillIssuerOrExpenseType"
                />
                <div id="errorForBillIssuerOrExpenseType" />
              </div>

              <div className="w-full lg:w-1/3 flex-grow">
                <NumericTextBoxComponent
                  min={0}
                  name="amount"
                  value={state.amount}
                  change={update('amount')}
                  format="c2"
                  validateDecimalOnType={true}
                  decimals={2}
                  floatLabelType="Auto"
                  data-msg-containerid="errorForAmount"
                />
                <div id="errorForAmount" />
              </div>
              <div className="w-full lg:w-1/3 flex-grow">
                <DatePickerComponent
                  id="datepicker"
                  placeholder={th('expensesTableHeaderDate')}
                  name="paymentDate"
                  value={state.paymentDate}
                  change={update('paymentDate')}
                  floatLabelType="Auto"
                  data-msg-containerid="errorForPaymentDate"
                />
                <div id="errorForPaymentDate" />
              </div>

              <div className="w-full lg:w-1/3 flex-grow">
                <TextAreaComponent
                  id="default"
                  placeholder={t('comments')}
                  name="comments"
                  value={state.comments}
                  change={update('comments')}
                  maxLength={200}
                  floatLabelType="Auto"
                  data-msg-containerid="errorForComments"
                ></TextAreaComponent>
                <div id="errorForComments" />
              </div>
            </div>
            <div className="w-full flex justify-center">
              <button type="submit">{`${t('saveExpense')}`}</button>
            </div>
          </form>
        </div>
      )}
      {pathName!.includes('bills') ? (
        <div className="w-full">
          <h2 className="mb-2">{t('bills')}</h2>
          {records.result ? (
            <GridComponentFactory
              ref={childRef}
              data={records}
              cols={billsCols}
              allowSorting={true}
              allowPaging={true}
              allowResizing={true}
              allowFiltering={true}
              allowReordering={true}
              allowGrouping={false}
              allowAdding={false}
              allowDeleting={true}
              allowEditing={true}
              useToolbar={true}
              locale={locale}
              updateRecords={getData}
            />
          ) : (
            <SkeletonComponent height={100} width="100%" />
          )}
        </div>
      ) : (
        <div className="w-full">
          <h2 className="mb-2">{t('expenses')}</h2>
          {records.result ? (
            <GridComponentFactory
              ref={childRef}
              data={records}
              cols={expensesCols}
              allowSorting={true}
              allowPaging={true}
              allowResizing={true}
              allowFiltering={true}
              allowReordering={true}
              allowGrouping={false}
              allowAdding={false}
              allowDeleting={true}
              allowEditing={true}
              billIssuerOrExpenseTypeAsDropdown={true}
              useToolbar={true}
              locale={locale}
              updateRecords={getData}
            />
          ) : (
            <SkeletonComponent height={100} width="100%" />
          )}
        </div>
      )}
    </section>
  );
};

export default UserBillsExpenses;
