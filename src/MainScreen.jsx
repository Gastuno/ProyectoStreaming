import "./MainScreen.css";
import Cover from './assets/placeholder.jpg';
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

function MainScreen() {
  const navigate = useNavigate();
  const movies = [
    { name: 'Pelicula Peliculasa Peliculera', cover: Cover, genres: ['Action', 'Comedy'], type: 'Movie', description: 'Placeholder', duration: '2h 30m' },
    { name: 'Pelicula 2', cover: Cover, genres: ['Action'], type: 'Movie', description: 'Placeholder', duration: '2h 30m' },
    { name: 'Pelicula 3', cover: Cover, genres: ['Romance', 'Drama'], type: 'Serie', description: 'Placeholder', chapters: [
      { name: 'Capítulo 1', duration: '45m' },
      { name: 'Capítulo 2', duration: '50m' },
      { name: 'Capítulo 3', duration: '40m' }
    ] },
    { name: 'Pelicula 4', cover: Cover, genres: ['Horror'], type: 'Serie', description: 'Placeholder', chapters: [
      { name: 'Episodio 1', duration: '42m' },
      { name: 'Episodio 2', duration: '39m' }
    ] },
    { name: 'Pelicula 5', cover: Cover, genres: ['Drama', 'Action'], type: 'Movie', description: 'Placeholder', duration: '2h 30m' },
    { name: 'Pelicula 6', cover: Cover, genres: ['Romance'], type: 'Movie', description: 'Placeholder', duration: '2h 30m' },
    { name: 'Pelicula 7', cover: Cover, genres: ['Comedy', 'Action'], type: 'Movie', description: 'Placeholder', duration: '2h 30m' },
    { name: 'Pelicula 8', cover: Cover, genres: ['Sci-Fi'], type: 'Movie', description: 'Placeholder', duration: '2h 30m' },
  ];

  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedType, setSelectedType] = useState('Movie');


  let filteredMovies = movies;
  if (selectedType !== 'All') {
    filteredMovies = filteredMovies.filter(movie => movie.type === selectedType);
  }
  if (selectedGenre !== 'All') {
    filteredMovies = filteredMovies.filter(movie => movie.genres.includes(selectedGenre));
  }

  const columns = 4;
  const rows = [];
  for (let i = 0; i < filteredMovies.length; i += columns) {
    rows.push(filteredMovies.slice(i, i + columns));
  }

  
  // Navigation handler for movie click
  const handleMovieClick = (movie) => {
    navigate(`/movie/${encodeURIComponent(movie.name)}`, { state: { movie } });
  };

  return (
    <div className="main-container">
      <nav className="top-menu">
        <button>Hogar</button>
        <button onClick={() => setSelectedType('Movie')} className={selectedType === 'Movie' ? 'active' : ''}>Peliculas</button>
        <button onClick={() => setSelectedType('Serie')} className={selectedType === 'Serie' ? 'active' : ''}>Series</button>
        <button>Biblioteca</button>
        <nav className="genre-menu">
          <button onClick={() => setSelectedGenre('All')} className={selectedGenre === 'All' ? 'active' : ''}>Todas</button>
          <button onClick={() => setSelectedGenre('Action')} className={selectedGenre === 'Action' ? 'active' : ''}>Accion</button>
          <button onClick={() => setSelectedGenre('Romance')} className={selectedGenre === 'Romance' ? 'active' : ''}>Romance</button>
          <button onClick={() => setSelectedGenre('Comedy')} className={selectedGenre === 'Comedy' ? 'active' : ''}>Comedia</button>
          <button onClick={() => setSelectedGenre('Drama')} className={selectedGenre === 'Drama' ? 'active' : ''}>Drama</button>
          <button onClick={() => setSelectedGenre('Sci-Fi')} className={selectedGenre === 'Sci-Fi' ? 'active' : ''}>Sci-Fi</button>
          <button onClick={() => setSelectedGenre('Horror')} className={selectedGenre === 'Horror' ? 'active' : ''}>Horror</button>
        </nav>
      </nav>

      <h2>{selectedType === 'Serie' ? 'Series' : 'Películas'}</h2>
      <table className="movies-table">
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="Movie-row">
              {row.map((movie, colIdx) => (
                <td key={colIdx} className="movie-cell">
                  <button className="pelicula-click" onClick={() => handleMovieClick(movie)}><img src={movie.cover} alt={movie.name} className="movie-cover" /></button>
                  <button className="pelicula-click" onClick={() => handleMovieClick(movie)}>{movie.name}</button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default MainScreen;
