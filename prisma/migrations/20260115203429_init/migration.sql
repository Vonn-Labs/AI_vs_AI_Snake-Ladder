-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "winner" TEXT,
    "player1Provider" TEXT NOT NULL,
    "player1Model" TEXT NOT NULL,
    "player1Name" TEXT NOT NULL,
    "player1Position" INTEGER NOT NULL DEFAULT 0,
    "player2Provider" TEXT NOT NULL,
    "player2Model" TEXT NOT NULL,
    "player2Name" TEXT NOT NULL,
    "player2Position" INTEGER NOT NULL DEFAULT 0,
    "currentPlayer" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Turn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "playerNum" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "diceRoll" INTEGER NOT NULL,
    "fromPos" INTEGER NOT NULL,
    "toPos" INTEGER NOT NULL,
    "finalPos" INTEGER NOT NULL,
    "event" TEXT,
    "eventFrom" INTEGER,
    "eventTo" INTEGER,
    "preRollCommentary" TEXT,
    "postRollCommentary" TEXT,
    "trashTalk" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Turn_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE INDEX "Turn_gameId_idx" ON "Turn"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_provider_model_key" ON "Leaderboard"("provider", "model");
