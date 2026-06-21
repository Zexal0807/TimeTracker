-- CreateTable
CREATE TABLE "Project" (
    "idProject" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "hourlyRate" DECIMAL NOT NULL,
    "notes" TEXT NOT NULL,
    "idClient" INTEGER NOT NULL,
    CONSTRAINT "Project_idClient_fkey" FOREIGN KEY ("idClient") REFERENCES "Client" ("idClient") ON DELETE RESTRICT ON UPDATE CASCADE
);
