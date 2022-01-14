import { json, LoaderFunction, useLoaderData } from "remix";
import { getPopularMovies, TMDBMovie } from "~/utils/tmdb.server";

export let loader: LoaderFunction = async () => {
  const data = await getPopularMovies();
  const movies: TMDBMovie[] = data.results;

  return json<Array<TMDBMovie>>(movies);
};

export default function MovieNightIndexRoute() {
  const data = useLoaderData<Array<TMDBMovie>>();

  return (
    <div>
      <ul>
        {data.map((m) => (
          <li>{m.title}</li>
        ))}
      </ul>
    </div>
  );
}
