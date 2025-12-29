-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "siret" TEXT NOT NULL,
    "accountant" TEXT DEFAULT 'Jean Dupont (Moi)',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorizedEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "AuthorizedEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bilan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "importDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "Bilan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AuthorizedEmailToClient" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AuthorizedEmailToClient_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AuthorizedEmailToBilan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AuthorizedEmailToBilan_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_siret_key" ON "Client"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "AuthorizedEmail_email_key" ON "AuthorizedEmail"("email");

-- CreateIndex
CREATE INDEX "_AuthorizedEmailToClient_B_index" ON "_AuthorizedEmailToClient"("B");

-- CreateIndex
CREATE INDEX "_AuthorizedEmailToBilan_B_index" ON "_AuthorizedEmailToBilan"("B");

-- AddForeignKey
ALTER TABLE "Bilan" ADD CONSTRAINT "Bilan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorizedEmailToClient" ADD CONSTRAINT "_AuthorizedEmailToClient_A_fkey" FOREIGN KEY ("A") REFERENCES "AuthorizedEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorizedEmailToClient" ADD CONSTRAINT "_AuthorizedEmailToClient_B_fkey" FOREIGN KEY ("B") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorizedEmailToBilan" ADD CONSTRAINT "_AuthorizedEmailToBilan_A_fkey" FOREIGN KEY ("A") REFERENCES "AuthorizedEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorizedEmailToBilan" ADD CONSTRAINT "_AuthorizedEmailToBilan_B_fkey" FOREIGN KEY ("B") REFERENCES "Bilan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
