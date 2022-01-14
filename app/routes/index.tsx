import { json, LoaderFunction, useLoaderData } from "remix";
import type { MovieNight } from "@prisma/client";
import { db } from "~/utils/db.server";

export let loader: LoaderFunction = async () => {
  const data = await db.movieNight.findMany();

  return json<Array<MovieNight>>(data);
};

export default function Users() {
  const movieNights = useLoaderData<Array<MovieNight>>();

  return (
    <ul>
      {movieNights.map((movieNight) => (
        <li key={movieNight.id}>{movieNight.name}</li>
      ))}
    </ul>
  );
}
