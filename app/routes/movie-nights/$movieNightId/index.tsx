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

type LoaderData = {
  movies: Array<TMDBMovie>;
  votes: Array<Vote>;
};

type Vote = {
  movie: { tmdbId: number; title: string };
  voters: { inviteeId: string; name: string }[];
};

export let loader: LoaderFunction = async ({ params }) => {
  const data = await getPopularMovies();
  const movies: TMDBMovie[] = data.results;

  const inviteesForMovieNight = await db.invitee.findMany({
    where: { movieNightId: params.movieNightId },
  });
  const suggestionsForMovieNight = await db.movieSuggestion.findMany({
    where: { invitee: { id: { in: inviteesForMovieNight.map((i) => i.id) } } },
  });

  let votes: Array<Vote> = [];

  suggestionsForMovieNight.forEach((s) => {
    const existing = votes.find((v) => v.movie.tmdbId === s.tmdbId);

    const invitee = inviteesForMovieNight.find(
      (invitee) => invitee.id === s.inviteeId
    );
    if (!invitee) {
      throw new Error("invitee not in invitees for night");
    }

    if (existing !== undefined) {
      existing.voters.push({
        inviteeId: invitee.id,
        name: invitee.name,
      });
    } else {
      votes.push({
        voters: [
          {
            inviteeId: invitee.id,
            name: invitee.name,
          },
        ],
        movie: { tmdbId: s.tmdbId, title: s.tmdbTitle },
      });
    }
  });

  return json<LoaderData>({ movies, votes });
};

export default function MovieNightIndexRoute() {
  const { movies, votes } = useLoaderData<LoaderData>();

  return (
    <div className="bg-red-200">
      <h2 className="text-xl text-bold">Suggested Movies</h2>
      <ul>
        {votes.map((vote) => (
          <li>
            <Form method="post" reloadDocument>
              <label>
                <input
                  type="hidden"
                  name="tmdbMovieId"
                  value={vote.movie.tmdbId}
                />
              </label>
              <button type="submit">{vote.movie.title}</button>
            </Form>
            {vote.voters.map((voter) => voter.name).join(", ")}
          </li>
        ))}
      </ul>
      <h2 className="text-xl text-bold">Top Movies</h2>
      <ul>
        {movies.map((m) => (
          <li key={m.id}>
            <Form method="post" reloadDocument>
              <label>
                <input type="hidden" name="tmdbMovieId" value={m.id} />
              </label>
              <button type="submit">{m.title}</button>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  );
}
