export default function MoviesList({ movies, setSelectedId, setUserRating }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          key={movie.imdbID}
          movie={movie}
          setSelectedId={setSelectedId}
          setUserRating={setUserRating}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, setSelectedId, setUserRating }) {
  const handleSelectMovie = () => {
    setUserRating(0);
    setSelectedId((cur) => (cur === movie.imdbID ? null : movie.imdbID));
  };
  return (
    <li onClick={handleSelectMovie}>
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
