const tmdbKey = process.env.TMDB_KEY;
if (!tmdbKey) {
  throw new Error("TMDB_KEY must be set");
}

export interface TMDBMovie {
  poster_path: string;
  backdrop_path: string;
  id: number;
  title: string;
}

export async function getPopularMovies() {
  let res = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbKey}&language=en-US&page=1`
  );

  return res.json();
}

export async function getMovie(tmdbMovieId: number) {
  let res = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbMovieId}?api_key=${tmdbKey}&language=en-US`
  );

  return res.json();
}
