import { useEffect, useState } from "react";
import "./App.css";
import StarRating from "./StarRating";

const KEY = "903162cc";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

///////////////////////////////// APP ////////////////////////////
export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setErr("");
      try {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
        );

        if (!res.ok) throw new Error(`something went wrong with fething data.`);

        const data = await res.json();

        if (data.Response === "False") throw new Error(data.Error);

        setMovies(data.Search);
      } catch (error) {
        setErr(error.message);
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
          {/* {isLoading ? (
            <Loader />
          ) : err ? (
            <ErrorMsg msg={err} />
          ) : (
            <MoviesList movies={movies}></MoviesList>
          )} */}
          {!isLoading && !err && (
            <MoviesList
              movies={movies}
              setSelectedId={setSelectedId}
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
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return (
    <div className="lds-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <p className="error">
      <span>⛔</span> {msg}
    </p>
  );
}

///////////////////////////////// NAV ////////////////////////////
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function SearchInput({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NavResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

/////////////////////////// Main ////////////////////////////
function Main({ children }) {
  return <main className="main">{children}</main>;
}

/////////////////////////// Box //////////////////////////
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

function MoviesList({ movies, setSelectedId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} setSelectedId={setSelectedId} />
      ))}
    </ul>
  );
}

function Movie({ movie, setSelectedId }) {
  return (
    <li
      onClick={() =>
        setSelectedId((cur) => (cur === movie.imdbID ? null : movie.imdbID))
      }
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

/////////////////////// Selected Movie Details///////////////////////
function SelectedMovieDetails({ selectedId, setSelectedId }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const {
    Title,
    Year,
    Poster,
    Runtime,
    imdbRating,
    Plot,
    Released,
    Actors,
    Director,
    Genre,
  } = movie;

  useEffect(() => {
    const getMovieDetails = async () => {
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      );

      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    };

    getMovieDetails();
  }, [selectedId]);
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={() => setSelectedId(null)}>
              &larr;
            </button>
            <img src={Poster} alt={`Poster of ${Title} movie`} />
            <div className="details-overview">
              <h2>{Title}</h2>
              <p>
                {Released} &bull; {Runtime}
              </p>
              <p>{Genre}</p>
              <p>
                <span>⭐</span> {imdbRating} IMDB Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              <StarRating maxRating={10} size={24} />
            </div>
            <p>
              <em>{Plot}</em>
            </p>
            <p>Starring {Actors}</p>
            <p>Directed by {Director}</p>
          </section>
        </>
      )}
    </div>
  );
}

/////////////////////// WatchList ///////////////////////

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
