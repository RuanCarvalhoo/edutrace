-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activation_expires" TIMESTAMP(3),
ADD COLUMN     "activation_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_activation_token_key" ON "User"("activation_token");
