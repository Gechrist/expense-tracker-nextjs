import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken, JWT } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  let secret: string = process.env.NEXTAUTH_SECRET as string;
  let token: JWT | null = (await getToken({ req, secret })) as JWT | null;
  if (!token?.access_token) {
    return NextResponse.json({ status: 'unauthorized' });
  }
  let {
    id,
    amount,
    type,
    dueDate,
    comments,
    paymentDate,
    googleCalendarDate,
    googleCalendarDateAction,
    rawGoogleCalendarDate,
    googleCalendarDateEventId,
    billIssuerOrExpenseType,
  } = await req.json();

  amount = parseFloat(amount);
  dueDate = dueDate ? new Date(dueDate) : null;
  paymentDate = paymentDate ? new Date(paymentDate) : null;
  googleCalendarDate = googleCalendarDate ? new Date(googleCalendarDate) : null;
  rawGoogleCalendarDate = rawGoogleCalendarDate
    ? new Date(rawGoogleCalendarDate)
    : null;
  let calendarEvent;

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

  if (googleCalendarDateAction) {
    if (googleCalendarDateAction !== 'deleteevent') {
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
        colorId: 11,
        conferenceData: null,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 5 },
            { method: 'email', minutes: 10 },
          ],
        },
      };
    }
  }

  try {
    if (
      googleCalendarDateAction === 'createevent' ||
      googleCalendarDateAction === 'editevent'
    ) {
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
      if (googleCalendarDateAction === 'createevent') {
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
          console.log(eventResult);
          throw Error('Creating a new Google Calendar event failed');
        }
      }

      if (googleCalendarDateAction === 'editevent') {
        const eventResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleCalendarDateEventId}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token!.access_token}`,
            },
            body: JSON.stringify(calendarEvent),
          }
        );
        const eventResult = await eventResponse.json();
        if (eventResult.status !== 'confirmed') {
          console.log(eventResult);
          throw Error('Editing the Google Calendar event failed');
        }
      }
    }

    if (googleCalendarDateAction === 'deleteevent') {
      const eventResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleCalendarDateEventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token!.access_token}`,
          },
        }
      );
      if (eventResponse.status !== 204) {
        throw Error('Deleting the Google Calendar event failed');
      } else {
        googleCalendarDateEventId = null;
      }
    }

    const result = await prisma.record.update({
      where: { id: id },
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
      },
    });
    if (result) {
      return NextResponse.json({ message: 'Record updated successfully' });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      error: `Something went wrong - ${(e as Error).message}`,
    });
  }
}
