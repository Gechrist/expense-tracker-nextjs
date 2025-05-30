import { Prisma, PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: any, res: any) {
  const user: string = new URLSearchParams(req.url)
    .get('user')
    ?.toString() as string;
  const type: string | null = new URLSearchParams(req.url)
    .get('type')
    ?.toString() as string;
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
          createdBy: { equals: user },
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
          createdBy: { equals: user },
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
              createdBy: { equals: user },
            },
          }),
          prisma.record.findMany({
            where: {
              createdBy: { equals: user },
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
              createdBy: { equals: user },
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
              createdBy: { equals: user },
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
      monthExpenses.map(
        (
          record: {
            billIssuerOrExpenseType: string;
            amount: number;
            text?: string;
            fill?: string;
          },
          index: number
        ) => {
          record.text = `${record?.billIssuerOrExpenseType}:\u00A0 ${
            type == 'Bills' ? '$' + record.amount : record.amount + ' €'
          }`;
          record.fill =
            index === 0
              ? '#7C00FE'
              : index === 1
              ? '#F9E400'
              : index === 2
              ? '#FFAF00'
              : index === 3
              ? '#F5004F'
              : index === 4
              ? '#36BA98'
              : index === 5
              ? '#CEDF9F'
              : index === 6
              ? '#AAB396'
              : index === 7
              ? '#0A6847'
              : index === 8
              ? '#C6A969'
              : '#6CBEC7';
        }
      );

      return NextResponse.json({
        monthExpenseAmount,
        recentBills,
        recentExpenses,
        monthExpenses,
      });
    }
    if (billsOrExpenses && !filter) {
      let [recordsNumber, records] = await prisma.$transaction([
        prisma.record.count({
          where: {
            createdBy: { equals: user },
            type: type,
          },
        }),
        prisma.record.findMany({
          where: {
            createdBy: { equals: user },
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
                    dueDate: sort[1].includes('Asc') ? 'asc' : 'desc',
                  }
                : sort[0] === 'paymentDate'
                ? {
                    paymentDate: sort[1].includes('Asc') ? 'asc' : 'desc',
                  }
                : sort[0] === 'googleCalendarDate'
                ? {
                    googleCalendarDate: sort[1].includes('Asc')
                      ? 'asc'
                      : 'desc',
                  }
                : sort[0] === 'billIssuerOrExpenseType'
                ? {
                    billIssuerOrExpenseType: sort[1].includes('Asc')
                      ? 'asc'
                      : 'desc',
                  }
                : sort[0] === 'comments'
                ? {
                    comments: sort[1].includes('Asc') ? 'asc' : 'desc',
                  }
                : sort[0] === 'amount'
                ? {
                    amount: sort[1].includes('Asc') ? 'asc' : 'desc',
                  }
                : null
              : null),
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
                  createdBy: { equals: user },
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
                  createdBy: { equals: user },
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
                    dueDate: sort[1].includes('Asc') ? 'asc' : 'desc',
                  }
                : sort[0] === 'paymentDate'
                ? {
                    paymentDate: sort[1].includes('Asc') ? 'asc' : 'desc',
                  }
                : sort[0] === 'googleCalendarDate'
                ? {
                    googleCalendarDate: sort[1].includes('Asc')
                      ? 'asc'
                      : 'desc',
                  }
                : sort[0] === 'billIssuerOrExpenseType'
                ? {
                    billIssuerOrExpenseType: sort[1].includes('Asc')
                      ? 'asc'
                      : 'desc',
                  }
                : sort[0] === 'comments'
                ? {
                    comments: sort[1].includes('Asc') ? 'asc' : 'desc',
                  }
                : sort[0] === 'amount'
                ? {
                    amount: sort[1].includes('Asc') ? 'asc' : 'desc',
                  }
                : null
              : null),
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
