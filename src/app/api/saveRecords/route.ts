import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { hrtime } from 'process';

const prisma = new PrismaClient();

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

const modifyDateString = (type: string, date: string): string => {
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

  let time: string;
  if (year.includes('.μ.') || year.includes('M')) {
    year = year.replace('π.μ.', 'AM');
    year = year.replace('μ.μ.', 'PM');
    time = year.substring(5);
    time = to24HrTime(time) as string;
    time = 'T' + time;
    year = year.substring(0, 4);
  } else {
    time = 'T00:00:00';
  }
  return year + '-' + month + '-' + day + time;
};

export async function POST(req: any) {
  let {
    amount,
    type,
    dueDate,
    comments,
    paymentDate,
    googleCalendarDate,
    billIssuerOrExpenseType,
    createdBy,
  } = await req.json();

  amount = parseFloat(amount);
  dueDate = dueDate ? new Date(modifyDateString(type, dueDate)) : null;
  paymentDate = paymentDate
    ? new Date(modifyDateString(type, paymentDate))
    : null;
  let rawGoogleCalendarDate = googleCalendarDate
    ? modifyDateString(type, googleCalendarDate)
    : null;
  googleCalendarDate = googleCalendarDate
    ? new Date(modifyDateString(type, googleCalendarDate))
    : null;
  let googleCalendarDateEventId: string = '';

  let months = [
    type == 'Bills' || type == 'Expenses' ? 'January' : 'Ιανουάριος',
    type == 'Bills' || type == 'Expenses' ? 'February' : 'Φεβρουάριος',
    type == 'Bills' || type == 'Expenses' ? 'March' : 'Μάρτιος',
    type == 'Bills' || type == 'Expenses' ? 'April' : 'Απρίλιος',
    type == 'Bills' || type == 'Expenses' ? 'May' : 'Μάιος',
    type == 'Bills' || type == 'Expenses' ? 'June' : 'Ιούνιος',
    type == 'Bills' || type == 'Expenses' ? 'July' : 'Ιούλιος',
    type == 'Bills' || type == 'Expenses' ? 'August' : 'Αύγουστος',
    type == 'Bills' || type == 'Expenses' ? 'September' : 'Σεπτέμβριος',
    type == 'Bills' || type == 'Expenses' ? 'October' : 'Οκτώβριος',
    type == 'Bills' || type == 'Expenses' ? 'November' : 'Νοέμβριος',
    type == 'Bills' || type == 'Expenses' ? 'December' : 'Δεκέμβριος',
  ];

  let year: string =
    type == 'Λογαριασμοί' || type == 'Bills'
      ? dueDate.getFullYear().toString()
      : paymentDate.getFullYear().toString();
  let month: string =
    type == 'Λογαριασμοί' || type == 'Bills'
      ? months[dueDate.getMonth()]
      : months[paymentDate.getMonth()];
  let day: string =
    type == 'Λογαριασμοί' || type == 'Bills'
      ? dueDate.toLocaleDateString(type == 'Bills' ? 'en' : 'el', {
          weekday: 'long',
        })
      : paymentDate.toLocaleDateString(type == 'Bills' ? 'en' : 'el', {
          weekday: 'long',
        });

  let calendarEvent;
  let token;
  let secret: string;
  if (googleCalendarDate) {
    secret = process.env.NEXTAUTH_SECRET as string;
    token = await getToken({ req, secret });
    calendarEvent = {
      summary:
        type == 'Bills'
          ? `Pay $${amount} ${billIssuerOrExpenseType} Bill`
          : `Πληρωμή λογαριασμού ${billIssuerOrExpenseType} ${amount} €`,
      start: {
        dateTime: rawGoogleCalendarDate,
        timeZone: '',
      },
      end: {
        dateTime: rawGoogleCalendarDate,
        timeZone: '',
      },
      conferenceData: null,
      colorId: 11,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 5 },
          { method: 'email', minutes: 10 },
        ],
      },
    };
  }
  try {
    if (googleCalendarDate) {
      const timeZoneResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList/primary',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token!.access_token}`,
          },
        }
      );
      const timeZoneResult = await timeZoneResponse.json();
      calendarEvent!.start.timeZone = timeZoneResult.timeZone;
      calendarEvent!.end.timeZone = timeZoneResult.timeZone;
      const eventResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token!.access_token}`,
          },
          body: JSON.stringify(calendarEvent),
        }
      );
      const eventResult = await eventResponse.json();
      if (eventResult.status === 'confirmed') {
        googleCalendarDateEventId = eventResult.id;
      } else {
        throw Error('Creating a new Google Calendar event failed');
      }
    }
    const result = await prisma.record.create({
      data: {
        amount,
        type,
        dueDate,
        comments,
        paymentDate,
        googleCalendarDate,
        googleCalendarDateEventId,
        year,
        month,
        day,
        billIssuerOrExpenseType,
        createdBy,
      },
    });
    if (result) {
      return NextResponse.json({ message: 'Record saved successfully' });
    }
  } catch (e) {
    if (googleCalendarDateEventId) {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleCalendarDateEventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token!.access_token}`,
          },
        }
      );
    }
    console.error(e);
    return NextResponse.json({
      error: `Something went wrong - ${(e as Error).message}`,
    });
  }
}
