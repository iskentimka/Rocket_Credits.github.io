import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Mock Data for Movies (9 Movies for 3x3 Matrix)
const movies = [
  { id: 1, title: "Inception", image: `${process.env.PUBLIC_URL}/movies/inception.jpg` },
  { id: 2, title: "Interstellar", image: `${process.env.PUBLIC_URL}/movies/interstellar.jpg` },
  { id: 3, title: "The Dark Knight", image: `${process.env.PUBLIC_URL}/movies/dark-knight.jpg` },
  { id: 4, title: "Avatar", image: `${process.env.PUBLIC_URL}/movies/avatar.jpg` },
  { id: 5, title: "Avengers: Endgame", image: `${process.env.PUBLIC_URL}/movies/endgame.jpg` },
  { id: 6, title: "Titanic", image: `${process.env.PUBLIC_URL}/movies/titanic.jpg` },
  { id: 7, title: "The Matrix", image: `${process.env.PUBLIC_URL}/movies/matrix.jpg` },
  { id: 8, title: "Joker", image: `${process.env.PUBLIC_URL}/movies/joker.jpg` },
  { id: 9, title: "Spider-Man: No Way Home", image: `${process.env.PUBLIC_URL}/movies/spiderman.jpg` }
];

const Home = () => {
  const { user } = useAuth();
  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Content */}
      <div className="relative z-10 text-center py-20">
        <h1 className="text-4xl font-bold">Popular Movies</h1>
      </div>

      {/* Movies List (Fixed 3x3 Grid) */}
      <div className="relative z-10 container mx-auto p-6">
        <div className="movie-grid">
          {movies.map((movie) => (
            <Link  key={movie.id} to= {user ? "/subscribe" : "/login"}  className="block">
              <div className="movie-container">
                <img src={movie.image} alt={movie.title} className="movie-poster" />
                <p className="movie-title">{movie.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;