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

  console.log({ movies });

  return json<LoaderData>({ movies, votes });
};

export default function MovieNightIndexRoute() {
  const { movies, votes } = useLoaderData<LoaderData>();

  return (
    <div>
      <h2 className="text-xl text-bold">Suggested Movies</h2>
      <ul>
        {votes.map((vote) => (
          <li key={vote.movie.tmdbId}>
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
      <div className="flex flex-wrap gap-4">
        {movies.map((m) => (
          <div key={m.id} className="">
            <Form method="post" reloadDocument>
              <label>
                <input type="hidden" name="tmdbMovieId" value={m.id} />
              </label>
              <button type="submit">
                <img
                  className="w-48"
                  src={`https://image.tmdb.org/t/p/w200/${m.poster_path}`}
                />
              </button>
            </Form>
          </div>
        ))}
      </div>
    </div>
  );
}
