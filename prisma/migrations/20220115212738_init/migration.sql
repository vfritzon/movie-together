-- CreateTable
CREATE TABLE "MovieNight" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MovieNight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitee" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "movieNightId" TEXT NOT NULL,

    CONSTRAINT "Invitee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieSuggestion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "tmdbPosterPath" TEXT NOT NULL,
    "tmdbBackdropPath" TEXT NOT NULL,
    "tmdbTitle" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,

    CONSTRAINT "MovieSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MovieSuggestion_tmdbId_inviteeId_key" ON "MovieSuggestion"("tmdbId", "inviteeId");

-- AddForeignKey
ALTER TABLE "Invitee" ADD CONSTRAINT "Invitee_movieNightId_fkey" FOREIGN KEY ("movieNightId") REFERENCES "MovieNight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieSuggestion" ADD CONSTRAINT "MovieSuggestion_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "Invitee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
