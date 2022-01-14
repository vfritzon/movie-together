import type { LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import type { MovieNight } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = { movieNight: MovieNight };

export const loader: LoaderFunction = async ({ params }) => {
  const movieNight = await db.movieNight.findUnique({
    where: { id: params.movieNightId },
  });

  if (!movieNight) throw new Error("Movie Night not found");
  const data: LoaderData = { movieNight };

  return data;
};

export default function MovieNightRoute() {
  const data = useLoaderData<LoaderData>();

  return <h1>{data.movieNight.name}</h1>;
}
