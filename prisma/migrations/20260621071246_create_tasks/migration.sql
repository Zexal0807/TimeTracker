-- CreateTable
CREATE TABLE "Task" (
    "idTask" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startDateTime" DATETIME NOT NULL,
    "endDateTime" DATETIME NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "idProject" INTEGER NOT NULL,
    CONSTRAINT "Task_idProject_fkey" FOREIGN KEY ("idProject") REFERENCES "Project" ("idProject") ON DELETE RESTRICT ON UPDATE CASCADE
);
