import { Prisma, PrismaClient } from '@prisma/client';
import { StrokeSettings } from '@syncfusion/ej2/image-editor';
import { getToken, JWT } from 'next-auth/jwt';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  let secret: string = process.env.NEXTAUTH_SECRET as string;
  let token: JWT | null = (await getToken({ req, secret })) as JWT | null;

  if (!token?.access_token) {
    redirect('/');
  }

  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get('type')?.toString();

  // const type: string | null = new URLSearchParams(req.url)
  //   .get('type')
  //   ?.toString() as string;
  const startingDate: Date | boolean =
    new URLSearchParams(req.url).get('startingdate') !== 'false'
      ? new Date(new URLSearchParams(req.url).get('startingdate') as string)
      : false;
  const endingDate: Date | boolean =
    new URLSearchParams(req.url).get('endingdate') !== 'false'
      ? new Date(new URLSearchParams(req.url).get('endingdate') as string)
      : false;
  const home: boolean | null =
    new URLSearchParams(req.url).get('home') === 'false' ? false : true;
  const charts: boolean | null =
    new URLSearchParams(req.url).get('charts') === 'false' ? false : true;
  const billsOrExpenses: boolean | null =
    new URLSearchParams(req.url).get('billsorexpenses') === 'false'
      ? false
      : true;
  const skip: number | boolean =
    new URLSearchParams(req.url).get('skip') === 'false'
      ? false
      : parseInt(new URLSearchParams(req.url).get('skip') as string);
  let filter: string | boolean | string[] =
    new URLSearchParams(req.url).get('filter') == 'false'
      ? false
      : (new URLSearchParams(req.url).get('filter') as string);
  let sort: string | boolean | string[] =
    new URLSearchParams(req.url).get('sort') == 'false'
      ? false
      : (new URLSearchParams(req.url).get('sort')?.toString() as string);

  let currentDate = new Date();
  let month = currentDate.getMonth() + 1;
  let year = currentDate.getFullYear();
  let firstOfMonth = new Date(`${year}-${month}-01`);
  sort = sort && sort.split(',');
  filter = filter && JSON.parse(filter);

  try {
    if (charts && !startingDate && !endingDate) {
      const records = await prisma.record.findMany({
        where: {
          createdBy: token?.email as string,
          NOT: [
            {
              type: type == 'Bills' ? 'Λογαριασμοί' : '',
            },
            { type: type == 'Bills' ? 'Δαπάνες' : '' },
            { type: type == 'Λογαριασμοί' ? 'Bills' : '' },
            { type: type == 'Λογαριασμοί' ? 'Expenses' : '' },
          ],
        },
        select: {
          type: true,
          amount: true,
          billIssuerOrExpenseType: true,
          day: true,
          month: true,
          year: true,
        },
      });
      if (records) {
        return NextResponse.json({ result: records, count: records.length });
      }
    }
    if (startingDate && endingDate) {
      const records = await prisma.record.findMany({
        where: {
          createdBy: token?.email as string,
          paymentDate: { gte: startingDate, lte: endingDate },
          NOT: [
            {
              type: type == 'Bills' ? 'Λογαριασμοί' : '',
            },
            { type: type == 'Bills' ? 'Δαπάνες' : '' },
            { type: type == 'Λογαριασμοί' ? 'Bills' : '' },
            { type: type == 'Λογαριασμοί' ? 'Expenses' : '' },
          ],
        },
        select: {
          type: true,
          amount: true,
          billIssuerOrExpenseType: true,
          day: true,
          month: true,
          year: true,
        },
      });
      if (records) {
        return NextResponse.json({ result: records, count: records.length });
      }
    }
    if (home) {
      let [monthExpenseAmount, recentBills, recentExpenses, monthExpenses] =
        await prisma.$transaction([
          prisma.record.aggregate({
            _sum: { amount: true },
            where: {
              type: type == 'Bills' ? 'Expenses' : 'Δαπάνες',
              paymentDate: { gte: firstOfMonth },
              createdBy: token?.email as string,
            },
          }),
          prisma.record.findMany({
            where: {
              createdBy: token?.email as string,
              type: type,
            },
            select: {
              amount: true,
              billIssuerOrExpenseType: true,
              dueDate: true,
            },
            orderBy: {
              dueDate: 'desc',
            },
            take: 3,
          }),
          prisma.record.findMany({
            where: {
              createdBy: token?.email as string,
              type: type == 'Bills' ? 'Expenses' : 'Δαπάνες',
            },
            orderBy: {
              paymentDate: 'desc',
            },
            select: {
              amount: true,
              billIssuerOrExpenseType: true,
              paymentDate: true,
            },
            take: 3,
          }),
          prisma.record.findMany({
            where: {
              createdBy: token?.email as string,
              type: type == 'Bills' ? 'Expenses' : 'Δαπάνες',
              paymentDate: { gte: firstOfMonth },
            },
            select: {
              amount: true,
              billIssuerOrExpenseType: true,
            },
          }),
        ]);

      monthExpenseAmount = monthExpenseAmount._sum
        .amount as unknown as Prisma.GetRecordAggregateType<any>;

      // accumulate expense amounts for each category
      let accumulatedMonthExpensesPerCategory: any[] = [];
      let monthExpensesPerCategory: any[] = [];
      let amountPerCategory: number;

      monthExpenses.map((record: any) => {
        monthExpensesPerCategory = monthExpenses.filter(
          (x: any) =>
            x.billIssuerOrExpenseType === record.billIssuerOrExpenseType
        );
        if (
          accumulatedMonthExpensesPerCategory.some(
            (x) =>
              x.billIssuerOrExpenseType ===
              monthExpensesPerCategory[0].billIssuerOrExpenseType
          )
        ) {
          return;
        }
        amountPerCategory = monthExpensesPerCategory
          .reduce((accumulator: any, entry: any) => {
            return accumulator + entry.amount;
          }, 0)
          .toFixed(2);

        accumulatedMonthExpensesPerCategory.push({
          ...monthExpensesPerCategory[0],
          amount: amountPerCategory,
          text: `${record?.billIssuerOrExpenseType}:\u00A0 ${
            type == 'Bills' ? '$' + amountPerCategory : amountPerCategory + ' €'
          }`,
        });
      });

      return NextResponse.json({
        monthExpenseAmount,
        recentBills,
        recentExpenses,
        accumulatedMonthExpensesPerCategory,
      });
    }
    if (billsOrExpenses && !filter) {
      let [recordsNumber, records] = await prisma.$transaction([
        prisma.record.count({
          where: {
            createdBy: token?.email as string,
            type: type,
          },
        }),
        prisma.record.findMany({
          where: {
            createdBy: token?.email as string,
            type: type,
          },
          select: {
            billIssuerOrExpenseType: true,
            amount: true,
            id: true,
            createdBy: true,
            dueDate: true,
            paymentDate: true,
            comments: true,
            googleCalendarDate: true,
            googleCalendarDateEventId: true,
            type: true,
          },
          take: 10,
          skip: skip ? skip : 0,
          orderBy: {
            ...(sort
              ? sort[0] === 'dueDate'
                ? {
                    dueDate: sort[1].includes('asc') ? 'asc' : 'desc',
                  }
                : sort[0] === 'paymentDate'
                ? {
                    paymentDate: sort[1].includes('asc') ? 'asc' : 'desc',
                  }
                : sort[0] === 'googleCalendarDate'
                ? {
                    googleCalendarDate: sort[1].includes('asc')
                      ? 'asc'
                      : 'desc',
                  }
                : sort[0] === 'billIssuerOrExpenseType'
                ? {
                    billIssuerOrExpenseType: sort[1].includes('asc')
                      ? 'asc'
                      : 'desc',
                  }
                : sort[0] === 'comments'
                ? {
                    comments: sort[1].includes('asc') ? 'asc' : 'desc',
                  }
                : sort[0] === 'amount'
                ? {
                    amount: sort[1].includes('asc') ? 'asc' : 'desc',
                  }
                : null
              : type === 'Expenses' || type === 'Δαπάνες'
              ? { paymentDate: 'desc' }
              : { dueDate: 'asc' }),
          },
        }),
      ]);

      if (records) {
        return NextResponse.json({
          result: records,
          count: recordsNumber,
        });
      }
    }
    if (filter) {
      let [recordsNumber, records] = await prisma.$transaction([
        prisma.record.count({
          where: {
            AND: [
              ...(filter as string[]).map((filterField: any) => {
                return {
                  createdBy: token?.email as string,
                  type: type,
                  ...(filterField[0] === 'dueDate'
                    ? {
                        dueDate: {
                          ...(filterField[2] === 'equal'
                            ? { equals: new Date(filterField[1]) }
                            : filterField[2] === 'greaterthan'
                            ? { gt: new Date(filterField[1]) }
                            : filterField[2] === 'greaterthanorequal'
                            ? { gte: new Date(filterField[1]) }
                            : filterField[2] === 'lessthan'
                            ? { lt: new Date(filterField[1]) }
                            : filterField[2] === 'lessthanorequal'
                            ? { lte: new Date(filterField[1]) }
                            : filterField[2] === 'notequal'
                            ? { not: new Date(filterField[1]) }
                            : filterField[2] === 'isnull'
                            ? { equals: null }
                            : { not: null }),
                        },
                      }
                    : filterField[0] === 'paymentDate'
                    ? {
                        paymentDate: {
                          ...(filterField[2] === 'equal'
                            ? { equals: new Date(filterField[1]) }
                            : filterField[2] === 'greaterthan'
                            ? { gt: new Date(filterField[1]) }
                            : filterField[2] === 'greaterthanorequal'
                            ? { gte: new Date(filterField[1]) }
                            : filterField[2] === 'lessthan'
                            ? { lt: new Date(filterField[1]) }
                            : filterField[2] === 'lessthanorequal'
                            ? { lte: new Date(filterField[1]) }
                            : filterField[2] === 'notequal'
                            ? { not: new Date(filterField[1]) }
                            : filterField[2] === 'isnull'
                            ? { equals: null }
                            : { not: null }),
                        },
                      }
                    : filterField[0] === 'googleCalendarDate'
                    ? {
                        googleCalendarDate: {
                          ...(filterField[2] === 'equal'
                            ? { equals: new Date(filterField[1]) }
                            : filterField[2] === 'greaterThan'
                            ? { gt: new Date(filterField[1]) }
                            : filterField[2] === 'greaterthanorequal'
                            ? { gte: new Date(filterField[1]) }
                            : filterField[2] === 'lessThan'
                            ? { lt: new Date(filterField[1]) }
                            : filterField[2] === 'lessthanorequal'
                            ? { lte: new Date(filterField[1]) }
                            : filterField[2] === 'notequal'
                            ? { not: new Date(filterField[1]) }
                            : filterField[2] === 'isnull'
                            ? { equals: null }
                            : { not: null }),
                        },
                      }
                    : filterField[0] === 'billIssuerOrExpenseType'
                    ? {
                        billIssuerOrExpenseType: {
                          ...(filterField[2] === 'equal'
                            ? { equals: filterField[1] }
                            : filterField[2] === 'contains'
                            ? { contains: filterField[1] }
                            : filterField[2] === 'startsWith'
                            ? { startsWith: filterField[1] }
                            : filterField[2] === 'endsWith'
                            ? { endsWith: filterField[1] }
                            : filterField[2] === 'isempty'
                            ? { equals: '' }
                            : filterField[2] === 'notequal'
                            ? { not: filterField[1] }
                            : { not: '' }),
                        },
                      }
                    : filterField[0] === 'comments'
                    ? {
                        comments: {
                          ...(filterField[2] === 'equal'
                            ? { equals: filterField[1] }
                            : filterField[2] === 'contains'
                            ? { contains: filterField[1] }
                            : filterField[2] === 'startsWith'
                            ? { startsWith: filterField[1] }
                            : filterField[2] === 'endsWith'
                            ? { endsWith: filterField[1] }
                            : filterField[2] === 'isempty'
                            ? { equals: '' }
                            : filterField[2] === 'notequal'
                            ? { not: filterField[1] }
                            : { not: '' }),
                        },
                      }
                    : filterField[0] === 'amount'
                    ? {
                        amount: {
                          ...(filterField[2] === 'equal'
                            ? { equals: parseFloat(filterField[1]) }
                            : filterField[2] === 'greaterThan'
                            ? { gt: parseFloat(filterField[1]) }
                            : filterField[2] === 'greaterthanorequal'
                            ? { gte: parseFloat(filterField[1]) }
                            : filterField[2] === 'lessThan'
                            ? { lt: parseFloat(filterField[1]) }
                            : filterField[2] === 'lessthanorequal'
                            ? { lte: parseFloat(filterField[1]) }
                            : filterField[2] === 'notequal'
                            ? { not: parseFloat(filterField[1]) }
                            : {}),
                        },
                      }
                    : null),
                };
              }),
            ],
          },
        }),
        prisma.record.findMany({
          where: {
            AND: [
              ...(filter as string[]).map((filterField: any) => {
                return {
                  createdBy: token?.email as string,
                  type: type,
                  ...(filterField[0] === 'dueDate'
                    ? {
                        dueDate: {
                          ...(filterField[2] === 'equal'
                            ? { equals: new Date(filterField[1]) }
                            : filterField[2] === 'greaterthan'
                            ? { gt: new Date(filterField[1]) }
                            : filterField[2] === 'greaterthanorequal'
                            ? { gte: new Date(filterField[1]) }
                            : filterField[2] === 'lessthan'
                            ? { lt: new Date(filterField[1]) }
                            : filterField[2] === 'lessthanorequal'
                            ? { lte: new Date(filterField[1]) }
                            : filterField[2] === 'notequal'
                            ? { not: new Date(filterField[1]) }
                            : filterField[2] === 'isnull'
                            ? { equals: null }
                            : { not: null }),
                        },
                      }
                    : filterField[0] === 'paymentDate'
                    ? {
                        paymentDate: {
                          ...(filterField[2] === 'equal'
                            ? { equals: new Date(filterField[1]) }
                            : filterField[2] === 'greaterthan'
                            ? { gt: new Date(filterField[1]) }
                            : filterField[2] === 'greaterthanorequal'
                            ? { gte: new Date(filterField[1]) }
                            : filterField[2] === 'lessthan'
                            ? { lt: new Date(filterField[1]) }
                            : filterField[2] === 'lessthanorequal'
                            ? { lte: new Date(filterField[1]) }
                            : filterField[2] === 'notequal'
                            ? { not: new Date(filterField[1]) }
                            : filterField[2] === 'isnull'
                            ? { equals: null }
                            : { not: null }),
                        },
                      }
                    : filterField[0] === 'googleCalendarDate'
                    ? {
                        googleCalendarDate: {
                          ...(filterField[2] === 'equal'
                            ? { equals: new Date(filterField[1]) }
                            : filterField[2] === 'greaterThan'
                            ? { gt: new Date(filterField[1]) }
                            : filterField[2] === 'greaterthanorequal'
                            ? { gte: new Date(filterField[1]) }
                            : filterField[2] === 'lessThan'
                            ? { lt: new Date(filterField[1]) }
                            : filterField[2] === 'lessthanorequal'
                            ? { lte: new Date(filterField[1]) }
                            : filterField[2] === 'notequal'
                            ? { not: new Date(filterField[1]) }
                            : filterField[2] === 'isnull'
                            ? { equals: null }
                            : { not: null }),
                        },
                      }
                    : filterField[0] === 'billIssuerOrExpenseType'
                    ? {
                        billIssuerOrExpenseType: {
                          ...(filterField[2] === 'equal'
                            ? { equals: filterField[1] }
                            : filterField[2] === 'contains'
                            ? { contains: filterField[1] }
                            : filterField[2] === 'startsWith'
                            ? { startsWith: filterField[1] }
                            : filterField[2] === 'endsWith'
                            ? { endsWith: filterField[1] }
                            : filterField[2] === 'isempty'
                            ? { equals: '' }
                            : filterField[2] === 'notequal'
                            ? { not: filterField[1] }
                            : { not: '' }),
                        },
                      }
                    : filterField[0] === 'comments'
                    ? {
                        comments: {
                          ...(filterField[2] === 'equal'
                            ? { equals: filterField[1] }
                            : filterField[2] === 'contains'
                            ? { contains: filterField[1] }
                            : filterField[2] === 'startsWith'
                            ? { startsWith: filterField[1] }
                            : filterField[2] === 'endsWith'
                            ? { endsWith: filterField[1] }
                            : filterField[2] === 'isempty'
                            ? { equals: '' }
                            : filterField[2] === 'notequal'
                            ? { not: filterField[1] }
                            : { not: '' }),
                        },
                      }
                    : filterField[0] === 'amount'
                    ? {
                        amount: {
                          ...(filterField[2] === 'equal'
                            ? { equals: parseFloat(filterField[1]) }
                            : filterField[2] === 'greaterThan'
                            ? { gt: parseFloat(filterField[1]) }
                            : filterField[2] === 'greaterthanorequal'
                            ? { gte: parseFloat(filterField[1]) }
                            : filterField[2] === 'lessThan'
                            ? { lt: parseFloat(filterField[1]) }
                            : filterField[2] === 'lessthanorequal'
                            ? { lte: parseFloat(filterField[1]) }
                            : filterField[2] === 'notequal'
                            ? { not: parseFloat(filterField[1]) }
                            : {}),
                        },
                      }
                    : null),
                };
              }),
            ],
          },
          select: {
            billIssuerOrExpenseType: true,
            amount: true,
            id: true,
            createdBy: true,
            dueDate: true,
            paymentDate: true,
            comments: true,
            googleCalendarDate: true,
            googleCalendarDateEventId: true,
            type: true,
          },
          take: 10,
          skip: skip ? skip : 0,
          orderBy: {
            ...(sort
              ? sort[0] === 'dueDate'
                ? {
                    dueDate: sort[1].includes('asc') ? 'asc' : 'desc',
                  }
                : sort[0] === 'paymentDate'
                ? {
                    paymentDate: sort[1].includes('asc') ? 'asc' : 'desc',
                  }
                : sort[0] === 'googleCalendarDate'
                ? {
                    googleCalendarDate: sort[1].includes('asc')
                      ? 'asc'
                      : 'desc',
                  }
                : sort[0] === 'billIssuerOrExpenseType'
                ? {
                    billIssuerOrExpenseType: sort[1].includes('asc')
                      ? 'asc'
                      : 'desc',
                  }
                : sort[0] === 'comments'
                ? {
                    comments: sort[1].includes('asc') ? 'asc' : 'desc',
                  }
                : sort[0] === 'amount'
                ? {
                    amount: sort[1].includes('asc') ? 'asc' : 'desc',
                  }
                : null
              : type === 'Expenses' || type === 'Δαπάνες'
              ? { paymentDate: 'desc' }
              : { dueDate: 'asc' }),
          },
        }),
      ]);
      if (records) {
        return NextResponse.json({
          result: records,
          count: recordsNumber,
        });
      }
    }
  } catch (e: any) {
    console.error('Error:', e);
    return NextResponse.json({
      error: `Something went wrong - ${(e as Error).message}`,
    });
  }
}
