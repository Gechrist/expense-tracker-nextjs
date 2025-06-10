// dropdown expense fields
export const expenseFields: { text: string; value: string } = {
  text: 'Type',
  value: 'Id',
};

//dropdown list items order
export const sortOrder = 'Ascending';

//get records function
export const getRecords = async (
  user: string,
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
      `/api/getRecords?&user=${user}&type=${type}&home=${home}&billsorexpenses=${billsOrExpenses}&charts=${charts}&startingdate=${startingDate}&endingdate=${endingDate}&skip=${skip}&sort=${sort}&filter=${filter}`,
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
