import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import Loader from "./Loader";

const KEY = "903162cc";

export default function SelectedMovieDetails({
  selectedId,
  setSelectedId,
  onAddWatched,
  watched,
  userRating,
  setUserRating,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const {
    imdbID,
    Title,
    Poster,
    Runtime,
    imdbRating,
    Plot,
    Released,
    Actors,
    Director,
    Genre,
  } = movie;

  const handleAdd = () => {
    onAddWatched({ ...movie, userRating });
    setSelectedId(null);
  };

  const isWatched = watched.map((movie) => movie.imdbID).includes(imdbID);
  const watchedRating = watched.find((el) => el.imdbID === imdbID)?.userRating;

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

  useEffect(() => {
    if (!Title) return;
    document.title = `Movie | ${Title}`;
    return () => {
      document.title = "usePopcorn";
    };
  }, [Title]);

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
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={22}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>you rated this movie with: ⭐ {watchedRating} </p>
              )}
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
