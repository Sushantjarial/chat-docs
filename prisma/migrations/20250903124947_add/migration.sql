-- CreateTable
CREATE TABLE "public"."file" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_s3Key_key" ON "public"."file"("s3Key");

-- AddForeignKey
ALTER TABLE "public"."file" ADD CONSTRAINT "file_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
