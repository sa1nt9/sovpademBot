-- CreateTable
CREATE TABLE "PendingNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lastAttempt" TIMESTAMP(3),

    CONSTRAINT "PendingNotification_pkey" PRIMARY KEY ("id")
);
