/*
  Warnings:

  - You are about to drop the column `calendarDate` on the `Record` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Record" DROP COLUMN "calendarDate",
ADD COLUMN     "googleCalendarDate" TIMESTAMP(3);
