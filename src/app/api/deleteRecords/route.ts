import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function DELETE(req: any) {
  let id = await req.json();
  let secret = process.env.NEXTAUTH_SECRET as string;
  let token = await getToken({ req, secret });

  try {
    if (id[0].googleCalendarDateEventId) {
      const eventResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${id[0].googleCalendarDateEventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token!.access_token}`,
          },
        }
      );
      if (eventResponse.status !== 204) {
        throw Error('Deleting the Google Calendar event failed');
      }
    }
    const result = await prisma.record.delete({
      where: { id: id[0].id },
    });
    if (result) {
      return NextResponse.json({ message: 'Record deleted successfully' });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      error: `Something went wrong - ${(e as Error).message}`,
    });
  }
}
