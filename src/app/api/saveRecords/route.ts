import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken, JWT } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  let secret: string = process.env.NEXTAUTH_SECRET as string;
  let token: JWT | null = (await getToken({ req, secret })) as JWT | null;

  if (!token?.access_token) {
    return NextResponse.json({ status: 'unauthorized' });
  }

  let {
    amount,
    type,
    dueDate,
    comments,
    paymentDate,
    googleCalendarDate,
    billIssuerOrExpenseType,
  } = await req.json();

  amount = parseFloat(amount);

  googleCalendarDate = googleCalendarDate ? new Date(googleCalendarDate) : null;
  paymentDate = paymentDate ? new Date(paymentDate) : null;
  dueDate = dueDate ? new Date(dueDate) : null;
  // Used to get timezone from Google Calendar
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
  if (googleCalendarDate) {
    calendarEvent = {
      summary:
        type == 'Bills'
          ? `Pay $${amount} ${billIssuerOrExpenseType} Bill Reminder`
          : `Υπενθύμιση πληρωμής λογαριασμού ${billIssuerOrExpenseType} ${amount} €`,
      start: {
        dateTime: googleCalendarDate,
        timeZone: '',
      },
      end: {
        dateTime: googleCalendarDate,
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
        createdBy: token?.email as string,
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
