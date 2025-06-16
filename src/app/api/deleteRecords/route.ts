import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken, JWT } from 'next-auth/jwt';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function DELETE(req: any) {
  let id = await req.json();
  let secret: string = process.env.NEXTAUTH_SECRET as string;
  let token: JWT | null = (await getToken({ req, secret })) as JWT | null;

  if (!token?.access_token) {
    redirect('/');
  }

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
