import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useLoaderData,
} from "remix";
import { db } from "~/utils/db.server";
import { getInviteeId } from "~/utils/session.server";
import { getMovie, getPopularMovies, TMDBMovie } from "~/utils/tmdb.server";

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  const tmdbMovieId = form.get("tmdbMovieId");

  if (typeof tmdbMovieId !== "string") {
    throw new Error(`Form not submitted correctly.`);
  }

  const inviteeId = await getInviteeId(request);
  if (!inviteeId) throw new Error("No invitee id in session");

  const tmdbMovie = await getMovie(Number(tmdbMovieId));

  const existingSuggestionForInviteeAndMovie =
    await db.movieSuggestion.findFirst({
      where: { inviteeId: inviteeId, tmdbId: tmdbMovie.id },
    });

  if (existingSuggestionForInviteeAndMovie === null) {
    await db.movieSuggestion.create({
      data: {
        tmdbTitle: tmdbMovie.title,
        tmdbId: Number(tmdbMovie.id),
        tmdbPosterPath: tmdbMovie.poster_path,
        tmdbBackdropPath: tmdbMovie.backdrop_path,
        inviteeId: inviteeId,
      },
    });
  } else {
    await db.movieSuggestion.delete({
      where: { id: existingSuggestionForInviteeAndMovie.id },
    });
  }

  return redirect(`/movie-nights/${params.movieNightId}`);
};

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
          <li>
            <Form method="post" reloadDocument>
              <label>
                {m.title}
                <input type="hidden" name="tmdbMovieId" value={m.id} />
              </label>
              <button type="submit">Vote</button>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  );
}
