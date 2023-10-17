import { useEffect, useState } from "react";
import "./App.css";
import Loader from "./components/Loader";
import ErrorMsg from "./components/ErrorMsg";
import { NavBar, Logo, SearchInput, NavResults } from "./components/NavBar";
import { WatchedSummary, WatchedMovieList } from "./components/WatchList";
import SelectedMovieDetails from "./components/SelectedMovieDetails";
import MoviesList from "./components/MovieList";

const KEY = "903162cc";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [userRating, setUserRating] = useState(0);

  const handleAddWatched = (movie) => {
    const newWatchedMovie = {
      imdbRating: Number(movie.imdbRating),
      imdbID: movie.imdbID,
      Poster: movie.Poster,
      Title: movie.Title,
      Runtime: movie.Runtime.split(" ")[0],
      userRating: movie.userRating,
    };

    if (Number.isNaN(newWatchedMovie.imdbRating))
      newWatchedMovie.imdbRating = 0;

    setWatched((cur) => [...cur, newWatchedMovie]);
  };

  const handleDeleteWatche = (id) => {
    setWatched((cur) => cur.filter((movie) => movie.imdbID !== id));
  };

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setIsLoading(true);
      setErr("");
      try {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error(`something went wrong with fething data.`);

        const data = await res.json();

        if (data.Response === "False") throw new Error(data.Error);

        setMovies(data.Search);
      } catch (error) {
        if (error.name !== "AbortError") setErr(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setErr("");
      return;
    }
    fetchData();

    return () => {
      controller.abort();
    };
  }, [query]);

  return (
    <>
      <NavBar>
        <Logo />
        <SearchInput query={query} setQuery={setQuery} />
        <NavResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {!isLoading && !err && (
            <MoviesList
              movies={movies}
              setSelectedId={setSelectedId}
              setUserRating={setUserRating}
            ></MoviesList>
          )}
          {err && <ErrorMsg msg={err} />}
          {isLoading && <Loader />}
        </Box>

        <Box>
          {selectedId ? (
            <SelectedMovieDetails
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              onAddWatched={handleAddWatched}
              watched={watched}
              userRating={userRating}
              setUserRating={setUserRating}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeleteWatche}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}
