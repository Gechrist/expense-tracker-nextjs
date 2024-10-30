import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import {
  ColumnDirective,
  ColumnsDirective,
  Filter,
  GridComponent,
  Group,
  Inject,
  Page,
  Reorder,
  Resize,
  Sort,
  Edit,
  EditSettingsModel,
  Grid,
  ColumnModel,
} from '@syncfusion/ej2-react-grids';
import { CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import { useTranslations } from 'next-intl';
import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars';
import { DataManager, Query } from '@syncfusion/ej2/data';
import { expenseFields, minDate, sortOrder } from '@/styles/utils/utils';
import Image from 'next/image';
import React from 'react';

const GridComponentFactory = ({
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
  categoryAsDropdown,
  limitResults,
}: {
  data: Object;
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
  categoryAsDropdown?: boolean;
  limitResults?: Boolean;
}) => {
  const editOptions: EditSettingsModel = {
    allowEditing: allowEditing,
    allowAdding: allowAdding,
    allowDeleting: allowDeleting,
    mode: 'Normal',
    showDeleteConfirmDialog: true,
  };

  const t = useTranslations('UserBillsExpenses');
  const te = useTranslations('UserBillsExpenses.Expenses');

  let grid: Grid | null;
  const dataBound = () => {
    if (grid) {
      const columns: ColumnModel[] = grid.columns as ColumnModel[];
      for (const col of columns) {
        if (col.field === 'paidBill') {
          col.displayAsCheckBox = true;
        }
        grid.refreshColumns();
      }
    }
  };

  const gridData = new DataManager(data).executeLocal(new Query().take(3));

  // google calendar alert
  const dateTime: { type: string; skeleton: string } = {
    type: 'dateTime',
    skeleton: 'short',
  };

  // date format
  const date: { type: string; skeleton: string } = {
    type: 'date',
    skeleton: 'short',
  };

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
              ? '/leisure-icon.svg'
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

  //expenses dropdown categories

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

  // cell templates
  const expensesDropDownTemplate = (props: any) => {
    return (
      <div>
        <DropDownListComponent
          value={props.category}
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
          value={props.calendarDate}
          min={minDate}
          step={60}
        />
      </div>
    );
  };

  const checkBoxPaidBillTemplate = (props: any) => {
    return (
      <div>
        <CheckBoxComponent checked={props.paidBill}></CheckBoxComponent>
      </div>
    );
  };
  const checkBoxCalendarAlertTemplate = (props: any) => {
    return (
      <div>
        <CheckBoxComponent checked={props.calendarAlert}></CheckBoxComponent>
      </div>
    );
  };
  const gridExpenseCategoryTemplate = (props: any) => {
    return `${te(props.category)}`;
  };

  return (
    <div>
      <GridComponent
        dataBound={dataBound}
        dataSource={limitResults ? gridData : data}
        allowTextWrap={true}
        allowSorting={allowSorting}
        allowPaging={allowPaging}
        allowResizing={allowResizing}
        allowFiltering={allowFiltering}
        allowReordering={allowReordering}
        allowGrouping={allowGrouping}
        editSettings={editOptions}
        selectionSettings={{ type: 'Multiple' }}
        statelessTemplates={['directiveTemplates']}
        width="100%"
      >
        <Inject services={[Sort, Filter, Group, Reorder, Page, Resize, Edit]} />
        <ColumnsDirective>
          {cols.map((col) => (
            <ColumnDirective
              key={col.field}
              field={col.field}
              headerText={col.header}
              visible={col.field !== 'id'}
              isPrimaryKey={col.field === 'id'}
              format={
                col.field === 'issuer' || col.field === 'comments'
                  ? 'string'
                  : col.field === 'date'
                  ? date
                  : col.field === 'calendarDate'
                  ? dateTime
                  : 'C2'
              }
              textAlign={
                col.field === 'date' || col.field === 'calendarDate'
                  ? 'Right'
                  : col.field === 'issuer' || col.field === 'category'
                  ? 'Left'
                  : 'Center'
              }
              template={
                col.field === 'paidBill'
                  ? checkBoxPaidBillTemplate
                  : col.field === 'calendarAlert'
                  ? checkBoxCalendarAlertTemplate
                  : col.field === 'category' && categoryAsDropdown
                  ? expensesDropDownTemplate
                  :col.field === 'category' && !categoryAsDropdown
                  ? gridExpenseCategoryTemplate
                  : col.field === 'calendarDate'
                  ? dateTimeTemplate
                  : false
              }
              editType={
                col.field === 'issuer' || col.field === 'comments'
                  ? 'stringedit'
                  : col.field === 'category'
                  ? 'dropdownedit'
                  : col.field === 'paidBill' || col.field === 'calendarAlert'
                  ? 'booleanedit'
                  : col.field === 'date'
                  ? 'datepickeredit'
                  : col.field === 'calendarDate'
                  ? 'datetimepickeredit'
                  : 'numericedit'
              }
            />
          ))}
        </ColumnsDirective>
      </GridComponent>
    </div>
  );
};

export default GridComponentFactory;
