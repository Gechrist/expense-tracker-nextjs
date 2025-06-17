// dropdown expense fields
export const expenseFields: { text: string; value: string } = {
  text: 'Type',
  value: 'Id',
};

//dropdown list items order
export const sortOrder = 'Ascending';

//convert to UTC Dates

const to24HrTime = (time: string) => {
  let [hr, min] =
    String(time)
      .toLowerCase()
      .match(/\d+|[a-z]+/g) || [];
  // If time is valid, return reformatted time
  // Otherwise return undefined
  let ap: string = time.substring(time.length - 2);
  return `${ap == 'AM' && (hr?.length === 1 || hr === '12') ? '0' : ''}${
    ((hr as unknown as number) % 12) + (ap == 'AM' ? 0 : 12)
  }:${min}:00`;
};

export const convertDateStringToUTC = (type: string, date: string): string => {
  // if type is in English, the date format will be US
  let dateParts = date.toString().split('/');
  let day: string;
  let month: string;

  if (
    type.toString().includes('Bills') ||
    type.toString().includes('Expenses')
  ) {
    day = dateParts[1];
    month = dateParts[0];
  } else {
    day = dateParts[0];
    month = dateParts[1];
  }
  if (day.length === 1) {
    day = '0' + day;
  }
  if (month.length === 1) {
    month = '0' + month;
  }
  let year: string = dateParts[2];

  let time: string = '';
  if (year.includes('.μ.') || year.includes('M')) {
    year = year.replace('π.μ.', 'AM');
    year = year.replace('μ.μ.', 'PM');
    time = year.substring(5);
    time = to24HrTime(time) as string;
    year = year.substring(0, 4);
  }
  let UTCDate = new Date(
    year + '-' + month + '-' + day + ' ' + time
  ).toISOString();
  return UTCDate;
};

//get records function
export const getRecords = async (
  type: string,
  home: string,
  billsOrExpenses: string,
  charts: string,
  startingDate: string,
  endingDate: string,
  skip: string,
  sort: string,
  filter: string
): Promise<any> => {
  try {
    const response = await fetch(
      `/api/getRecords?&type=${type}&home=${home}&billsorexpenses=${billsOrExpenses}&charts=${charts}&startingdate=${startingDate}&endingdate=${endingDate}&skip=${skip}&sort=${sort}&filter=${filter}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
        signal: AbortSignal.timeout(10000),
      }
    );
    if (response) {
      const data = await response.json();
      return data;
    }
  } catch (error: any) {
    console.error(error.message);
    return error.message;
  }
};
