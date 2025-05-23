-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paymentDate" TIMESTAMP(3),
    "expenseDate" TIMESTAMP(3),
    "calendarDate" TIMESTAMP(3),
    "year" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "billIssuerOrExpenseType" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Record_id_key" ON "Record"("id");
