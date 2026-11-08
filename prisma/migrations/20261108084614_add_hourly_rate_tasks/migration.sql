/*
  Warnings:

  - Added the required column `hourlyRate` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "idTask" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startDateTime" DATETIME NOT NULL,
    "endDateTime" DATETIME NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "hourlyRate" DECIMAL NOT NULL,
    "idProject" INTEGER NOT NULL,
    CONSTRAINT "Task_idProject_fkey" FOREIGN KEY ("idProject") REFERENCES "Project" ("idProject") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("endDateTime", "idProject", "idTask", "name", "paid", "startDateTime", "hourlyRate") SELECT "endDateTime", "idProject", "idTask", "name", "paid", "startDateTime", 28 FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
