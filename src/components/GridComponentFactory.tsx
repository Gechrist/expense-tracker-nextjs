import { redirect } from 'next/navigation';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import {
  ColumnDirective,
  ColumnsDirective,
  Filter,
  GridComponent,
  Inject,
  Page,
  Reorder,
  Resize,
  Sort,
  Edit,
  EditSettingsModel,
  Toolbar,
  FilterSettingsModel,
  IEditCell,
} from '@syncfusion/ej2-react-grids';
import { ToastComponent } from '@syncfusion/ej2-react-notifications';
import { useTranslations } from 'next-intl';
import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars';
import { DataManager, Query } from '@syncfusion/ej2/data';
import { expenseFields, sortOrder } from '@/utils/utils';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import Image from 'next/image';

const GridComponentFactory = forwardRef(
  (
    {
      data,
      cols,
      allowSorting,
      allowPaging,
      allowResizing,
      allowFiltering,
      allowReordering,
      allowGrouping,
      allowEditing,
      allowAdding,
      allowDeleting,
      billIssuerOrExpenseTypeAsDropdown,
      useToolbar,
      locale,
      updateRecords,
    }: {
      data: any;
      cols: { field: string; header: string }[];
      allowSorting: boolean;
      allowPaging: boolean;
      allowResizing: boolean;
      allowFiltering: boolean;
      allowReordering: boolean;
      allowGrouping: boolean;
      allowDeleting: boolean | undefined;
      allowEditing: boolean | undefined;
      allowAdding: boolean | undefined;
      billIssuerOrExpenseTypeAsDropdown?: boolean;
      useToolbar?: boolean;
      locale?: string;
      updateRecords?: (
        skip?: string,
        sort?: string,
        filter?: string
      ) => Promise<any>;
    },
    ref
  ) => {
    const editOptions: EditSettingsModel = {
      allowEditing: allowEditing,
      allowAdding: allowAdding,
      allowDeleting: allowDeleting,
      mode: 'Normal',
      showDeleteConfirmDialog: true,
    };

    const t = useTranslations('UserBillsExpenses');
    const te = useTranslations('UserBillsExpenses.Expenses');

    //toast notifications
    const toastInstance = useRef<ToastComponent>(null);
    const gridInstance = useRef<GridComponent>(null);
    let toasts = [
      {
        title: t('toastSuccess'),
        content: t('successEdit'),
        cssClass: 'e-toast-success',
      },
      {
        title: t('toastSuccess'),
        content: t('successDelete'),
        cssClass: 'e-toast-success',
      },
      {
        title: t('toastError'),
        content: t('failedEdit'),
        cssClass: 'e-toast-warning',
      },
      {
        title: t('toastError'),
        content: t('failedDelete'),
        cssClass: 'e-toast-warning',
      },
    ];

    // google calendar alert
    const dateTime: { type: string; skeleton: string } = {
      type: 'dateTime',
      skeleton: 'short',
    };

    // filter settings
    const filterSettings: FilterSettingsModel = {
      type: 'FilterBar',
      showFilterBarStatus: false,
      showFilterBarOperator: true,
    };

    // item template for dropdownlist

    const dropdownIconTemplate = (props: any) => {
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
                : props.Id === 'Utilities' || props.Id === 'Κοινής ωφέλειας'
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
                : props.Id === 'Rent/Leasing' ||
                  props.Id === 'Ενοίκια/Μισθώσεις'
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

    //expenses dropdown categories

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

    // edit expense dropdown params
    const expenseDropdownParams: IEditCell = {
      params: {
        actionComplete: () => false,
        dataSource: new DataManager(expenseTypes),
        fields: { text: 'Type', value: 'Id' },
        query: new Query(),
      },
    };

    // cell templates
    const expensesDropDownTemplate = (props: any) => {
      return (
        <div>
          <DropDownListComponent
            value={props.billIssuerOrExpenseType}
            sortOrder={sortOrder}
            width="300"
            dataSource={expenseTypes}
            fields={expenseFields}
            popupHeight="150"
            popupWidth="300"
            itemTemplate={dropdownIconTemplate}
            valueTemplate={dropdownIconTemplate}
          ></DropDownListComponent>
        </div>
      );
    };

    const dateTimeTemplate = (props: any) => {
      return (
        <div>
          <DateTimePickerComponent
            id="datetimepicker"
            value={props.googleCalendarDate}
            step={60}
          />
        </div>
      );
    };

    // Expose parent function from parent component
    useImperativeHandle(ref, () => ({
      callParentGetRecordsFunction: dataSourceChanged,
      callParentPaginationSortingFilteringFunction: dataStateChange,
    }));

    //Pagination, sorting, and filtering
    let filterFields: string[] = [];
    let sortField: string = '';

    // filter operators
    const numberOperator = [
      { value: 'equal', text: t('equal') },
      { value: 'notequal', text: t('notEqual') },
      { value: 'greaterthan', text: t('greaterThan') },
      { value: 'lessthan', text: t('lessThan') },
      { value: 'greaterthanorequal', text: t('greaterThanOrEqual') },
      { value: 'lessthanorequal ', text: t('lessThanOrEqual') },
    ];

    const dateOperator = [
      { value: 'equal', text: t('equal') },
      { value: 'notequal', text: t('notEqual') },
      { value: 'greaterthan', text: t('laterThan') },
      { value: 'lessthan', text: t('earlierThan') },
      { value: 'greaterthanorequal', text: t('laterThanOrEqual') },
      { value: 'lessthanorequal', text: t('earlierThanOrEqual') },
      { value: 'isnull', text: t('null') },
      { value: 'isnotnull', text: t('notNull') },
    ];

    const stringOperator = [
      { value: 'equal', text: t('equal') },
      { value: 'notequal', text: t('notEqual') },
      { value: 'startsWith', text: t('startsWith') },
      { value: 'endsWith', text: t('endsWith') },
      { value: 'contains', text: t('contains') },
      { value: 'isempty', text: t('null') },
      { value: 'isnotempty', text: t('notNull') },
    ];

    // custom filters for grid
    let initialFlag = true;
    const dataBound = (args: any) => {
      if (initialFlag && allowFiltering) {
        initialFlag = false;
        gridInstance.current!.filterModule.customOperators.numberOperator =
          numberOperator;
        gridInstance.current!.filterModule!.customOperators.dateOperator =
          dateOperator;
        gridInstance.current!.filterModule!.customOperators.datetimeOperator =
          dateOperator;
        gridInstance.current!.filterModule!.customOperators.stringOperator =
          stringOperator;
      }
    };
    //filtering, sorting functions
    const dataStateChange = async (state: any) => {
      if (state.action.action == 'filter') {
        filterFields = [
          ...filterFields,
          ...state.action.columns.map((filter: any) => {
            return [
              filter.properties.field,
              filter.properties.value,
              filter.properties.operator,
            ];
          }),
        ];
      } else if (state.action.action == 'clearFilter') {
        filterFields = [
          ...filterFields,
          ...state.action.currentFilterObject.parentObj.properties.columns.map(
            (filter: any) => {
              return [
                filter.properties.field,
                filter.properties.value,
                filter.properties.operator,
              ];
            }
          ),
        ];
      }
      if (state.action.requestType == 'sorting' && state.action.columnName) {
        if (state.where) {
          filterFields = [
            ...filterFields,
            ...state.where[0].predicates.map((filter: any) => {
              return [filter.field, filter.value, filter.operator];
            }),
          ];
        }
        sortField = `${
          state.action.columnName
        },${state.action.direction.toLowerCase()}`;
      } else {
        sortField = 'false';
      }
      if (state.action.requestType == 'paging') {
        if (state.where) {
          filterFields = [
            ...filterFields,
            ...state.where[0].predicates.map((filter: any) => {
              return [filter.field, filter.value, filter.operator];
            }),
          ];
        }
        if (state?.sorted?.length > 0) {
          sortField = `${state.sorted[0].name},${state.sorted[0].direction}`;
        } else {
          sortField = 'false';
        }
      }
      try {
        if (updateRecords) {
          const updatedData = await updateRecords(
            state.skip,
            sortField,
            filterFields.length > 0 ? JSON.stringify(filterFields) : 'false'
          );
          if (updatedData?.status) {
            redirect('/');
          }
          if (updatedData) {
            data = [...data, updatedData];
          }
          gridInstance.current!.dataSource = data;
        }
      } catch (err: any) {
        console.error(err);
      }
    };

    //CRUD functions
    const dataSourceChanged = async (state: any) => {
      let googleCalendarDateAction: string = '';

      if (
        state.data.googleCalendarDate &&
        !state.previousData.googleCalendarDate
      ) {
        googleCalendarDateAction = 'createevent';
      } else if (
        !state.data.googleCalendarDate &&
        state?.previousData?.googleCalendarDate
      ) {
        googleCalendarDateAction = 'deleteevent';
      } else if (
        state.data.googleCalendarDate !==
        state?.previousData?.googleCalendarDate
      ) {
        googleCalendarDateAction = 'editevent';
      }
      Object.keys(state.data).map((entryKey: any) => {
        if (
          (entryKey === 'dueDate' && state.data[entryKey]) ||
          (entryKey === 'paymentDate' && state.data[entryKey]) ||
          (entryKey === 'googleCalendarDate' && state.data[entryKey])
        ) {
          let convertedDate = state.data[entryKey]
            .toISOString()
            .substring(0, 21);
          state.data[entryKey] = convertedDate;
        }
      });
      try {
        const result = await fetch(
          `/api/${state.action ? state.action : 'delete'}Records`,
          {
            method: state.action ? 'PUT' : 'DELETE',
            signal: AbortSignal.timeout(10000),
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...state.data, googleCalendarDateAction }),
          }
        );
        if (result) {
          const updatedData = await result.json();
          if (updatedData?.status) {
            redirect('/');
          }
          if (updatedData.error) {
            toastInstance.current?.show(toasts[state.action ? 2 : 3]);
          } else {
            toastInstance.current?.show(toasts[state.action ? 0 : 1]);
          }
          gridInstance.current!.dataSource = [updatedData];
        }
      } catch (err: any) {
        console.error('Error:', err.message);
        toastInstance.current?.show(toasts[state.action ? 2 : 3]);
      }
    };

    return (
      <div>
        <ToastComponent
          ref={toastInstance}
          position={{ X: 'Center', Y: 'Top' }}
        />
        <GridComponent
          dataSource={{ result: data?.result, count: data?.count }}
          ref={gridInstance}
          dataBound={dataBound}
          allowTextWrap={true}
          allowSorting={allowSorting}
          allowPaging={allowPaging}
          allowResizing={allowResizing}
          allowFiltering={allowFiltering}
          allowReordering={allowReordering}
          allowGrouping={allowGrouping}
          enableImmutableMode={true}
          editSettings={editOptions}
          selectionSettings={{ type: 'Single' }}
          statelessTemplates={['directiveTemplates']}
          filterSettings={filterSettings}
          toolbar={
            useToolbar ? ['Edit', 'Delete', 'Update', 'Cancel'] : undefined
          }
          width="100%"
          dataSourceChanged={dataSourceChanged}
          dataStateChange={dataStateChange}
          pageSettings={{ pageSize: 10 }}
        >
          <Inject
            services={[Sort, Filter, Reorder, Page, Resize, Edit, Toolbar]}
          />
          <ColumnsDirective>
            {cols.map((col) => (
              <ColumnDirective
                key={col.field}
                field={col.field}
                headerText={col.header}
                visible={
                  !(
                    col.field === 'id' ||
                    col.field === 'type' ||
                    col.field === 'googleCalendarDateEventId'
                  )
                }
                isPrimaryKey={col.field === 'id'}
                type={
                  col.field === 'paymentDate' || col.field === 'dueDate'
                    ? 'date'
                    : col.field === 'googleCalendarDate'
                    ? 'datetime'
                    : col.field === 'comments' ||
                      col.field === 'billIssuerOrExpenseType'
                    ? 'string'
                    : col.field === 'amount'
                    ? 'number'
                    : undefined
                }
                format={
                  (col.field === 'billIssuerOrExpenseType' &&
                    !billIssuerOrExpenseTypeAsDropdown) ||
                  col.field === 'comments'
                    ? 'string'
                    : col.field === 'paymentDate' || col.field === 'dueDate'
                    ? 'yMd'
                    : col.field === 'googleCalendarDate'
                    ? dateTime
                    : 'C2'
                }
                textAlign={
                  col.field === 'googleCalendarDate' ||
                  col.field === 'paymentDate' ||
                  col.field === 'dueDate'
                    ? 'Right'
                    : col.field === 'billIssuerOrExpenseType'
                    ? 'Left'
                    : 'Center'
                }
                validationRules={
                  col.field === 'billIssuerOrExpenseType' ||
                  col.field === 'amount'
                    ? { required: true }
                    : col.field === 'dueDate' ||
                      col.field === 'paymentDate' ||
                      col.field === 'googleCalendarDate'
                    ? {
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
                      }
                    : col.field === 'comments'
                    ? { required: false }
                    : undefined
                }
                template={
                  col.field === 'billIssuerOrExpenseType' &&
                  billIssuerOrExpenseTypeAsDropdown
                    ? expensesDropDownTemplate
                    : col.field === 'googleCalendarDate'
                    ? dateTimeTemplate
                    : false
                }
                editType={
                  col.field === 'comments' ||
                  (col.field === 'billIssuerOrExpenseType' &&
                    !billIssuerOrExpenseTypeAsDropdown)
                    ? 'stringedit'
                    : col.field === 'billIssuerOrExpenseType' &&
                      billIssuerOrExpenseTypeAsDropdown
                    ? 'dropdownedit'
                    : col.field === 'paymentDate' || col.field === 'dueDate'
                    ? 'datepickeredit'
                    : col.field === 'googleCalendarDate'
                    ? 'datetimepickeredit'
                    : 'numericedit'
                }
                edit={
                  col.field === 'billIssuerOrExpenseType' &&
                  billIssuerOrExpenseTypeAsDropdown
                    ? expenseDropdownParams
                    : undefined
                }
              />
            ))}
          </ColumnsDirective>
        </GridComponent>
      </div>
    );
  }
);

//assign display name to component
GridComponentFactory.displayName = 'GridComponentFactory';

export default GridComponentFactory;
