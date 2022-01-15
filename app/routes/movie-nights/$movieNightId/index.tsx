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
import {
  getMovie,
  getPopularMovies,
  searchMoviesByTitle,
  TMDBMovie,
} from "~/utils/tmdb.server";
import { SearchIcon } from "@heroicons/react/solid";
import logo from "~/images/logo.svg";

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
  movie: { tmdbId: number; title: string; posterPath: string };
  voters: { inviteeId: string; name: string }[];
};

export let loader: LoaderFunction = async ({ params, request }) => {
  const url = new URL(request.url);
  const search = new URLSearchParams(url.search);
  const titleSearch = search.get("title");

  const data =
    titleSearch === null || titleSearch.trim() === ""
      ? await getPopularMovies()
      : await searchMoviesByTitle(titleSearch);
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
        movie: {
          tmdbId: s.tmdbId,
          title: s.tmdbTitle,
          posterPath: s.tmdbPosterPath,
        },
      });
    }
  });

  return json<LoaderData>({ movies, votes });
};

export default function MovieNightIndexRoute() {
  const { movies, votes } = useLoaderData<LoaderData>();

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {votes.map((vote) => (
          <div key={vote.movie.tmdbId}>
            <Form method="post" reloadDocument>
              <label>
                <input
                  type="hidden"
                  name="tmdbMovieId"
                  value={vote.movie.tmdbId}
                />
              </label>
              <button type="submit">
                <img
                  className="w-48"
                  src={`https://image.tmdb.org/t/p/w200/${vote.movie.posterPath}`}
                />
              </button>
            </Form>
            <div className="flex flex-row">
              {vote.voters.map((voter) => (
                <div key={voter.inviteeId} className="w-5" title={voter.name}>
                  <img src={logo} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Form method="get" className="max-w-5xl ">
        <label
          htmlFor="title"
          className="mt-3 block text-xl font-medium text-red-600"
        >
          Suggest a Movie
        </label>
        <div className="mt-1 flex shadow-sm mb-3">
          <div className="relative flex items-stretch flex-grow focus-within:z-10">
            <input
              type="search"
              name="title"
              id="title"
              className="focus:ring-gray-500 focus:border-gray-500 block w-full sm:text-sm border-gray-300"
              placeholder="Enter a movie title to search"
            />
          </div>
          <button
            type="button"
            className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </button>
        </div>
      </Form>
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
