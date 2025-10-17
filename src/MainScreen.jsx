import "./MainScreen.css";
import Cover from './assets/placeholder.jpg';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';

function MainScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const [movies, setMovies] = useState([
    { name: 'Pelicula Peliculasa Peliculera', cover: Cover, genres: ['Accion', 'Comedia'], type: 'Movie', description: 'Placeholder', duration: '2h 30m', saved: (true), fav: (true)},
    { name: 'Pelicula 2', cover: Cover, genres: ['Accion'], type: 'Movie', description: 'Placeholder', duration: '2h 30m', saved: (true), fav: (false)},
    { name: 'Pelicula 5', cover: Cover, genres: ['Drama', 'Accion'], type: 'Movie', description: 'Placeholder', duration: '2h 30m', saved: (true), fav: (false)},
    { name: 'Pelicula 6', cover: Cover, genres: ['Romance'], type: 'Movie', description: 'Placeholder', duration: '2h 30m', saved: false, fav: (false)},
    { name: 'Pelicula 7', cover: Cover, genres: ['Comedia', 'Accion'], type: 'Movie', description: 'Placeholder', duration: '2h 30m', saved: (true), fav: (false)},
    { name: 'Pelicula 8', cover: Cover, genres: ['Sci-Fi'], type: 'Movie', description: 'Placeholder', duration: '2h 30m', saved: false, fav: (false)},
    { name: 'Serie 1', cover: Cover, genres: ['Romance', 'Drama'], type: 'Serie', description: 'Placeholder', saved: (true), fav: (false), chapters: [
      { name: 'Capítulo 1', duration: '45m' },
      { name: 'Capítulo 2', duration: '50m' },
      { name: 'Capítulo 3', duration: '40m' }
    ] },
    { name: 'Serie 2', cover: Cover, genres: ['Horror'], type: 'Serie', description: 'Placeholder', saved: (true), fav: (true), chapters: [
      { name: 'Episodio 1', duration: '42m' },
      { name: 'Episodio 2', duration: '39m' }
    ] },
  ]);

  const [role, setRole] = useState('user');
  useEffect(() => {
    const fromState = location.state?.role;
    const stored = sessionStorage.getItem('role');
    if (fromState) setRole(fromState);
    else if (stored) setRole(stored);
  }, [location.state]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGenres, setNewGenres] = useState('');
  const [newType, setNewType] = useState('Movie');
  const [newDuration, setNewDuration] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newChaptersText, setNewChaptersText] = useState('');

  const resetForm = () => {
    setNewTitle(''); setNewGenres(''); setNewType('Movie'); setNewDuration(''); setNewDescription(''); setNewChaptersText('');
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const addedGenres = newGenres.split(',').map(g => g.trim()).filter(Boolean);
    let chapters = [];
    if (newType === 'Serie' && newChaptersText.trim()) {
      chapters = newChaptersText.split(',').map(part => {
        const [name, duration] = part.split(':').map(p => p && p.trim());
        return { name: name || 'Untitled', duration: duration || '' };
      });
    }
    const movieObj = {
      name: newTitle || 'Untitled',
      cover: Cover,
      genres: addedGenres,
      type: newType,
      description: newDescription || '',
      duration: newType === 'Movie' ? (newDuration || '') : undefined,
      chapters: newType === 'Serie' ? chapters : undefined,
    };
    setMovies(prev => [movieObj, ...prev]);
    setShowAddForm(false);
    resetForm();
  };

  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showBiblioteca, setShowBiblioteca] = useState(false);


  let filteredMovies = movies;
  if (selectedType !== 'All') {
    filteredMovies = filteredMovies.filter(movie => movie.type === selectedType);
  }
  if (selectedGenre !== 'All') {
    filteredMovies = filteredMovies.filter(movie => movie.genres.includes(selectedGenre));
  }
  if (showBiblioteca == (true)) {
    filteredMovies = filteredMovies.filter(movie => movie.saved === (true));
  }

  const columns = 4;
  const moviesList = filteredMovies.filter(m => m.type === 'Movie');
  const seriesList = filteredMovies.filter(m => m.type === 'Serie');
  const faves = filteredMovies.filter(m => m.fav === (true));

  const rowsForMovies = [];
  for (let i = 0; i < moviesList.length; i += columns) {
    rowsForMovies.push(moviesList.slice(i, i + columns));
  }

  const rowsForSeries = [];
  for (let i = 0; i < seriesList.length; i += columns) {
    rowsForSeries.push(seriesList.slice(i, i + columns));
  }

  const rowsForAll = [];
  for (let i = 0; i < filteredMovies.length; i += columns) {
    rowsForAll.push(filteredMovies.slice(i, i + columns));
  }

  const rowsForFaves = [];
  for (let i = 0; i < filteredMovies.length; i += columns) {
    rowsForFaves.push(faves.slice(i, i + columns));
  }


  const handleMovieClick = (movie) => {
    navigate(`/movie/${encodeURIComponent(movie.name)}`, { state: { movie } });
  };

  return (
    <div className="main">
      <nav className="topmenu">
        <button onClick={() => {setSelectedType('All'); setSelectedGenre('All'); setShowBiblioteca(false)}}>Home</button>
        <button onClick={() => {setSelectedType('Movie'); setSelectedGenre('All'); setShowBiblioteca(false)}} className={selectedType === 'Movie' ? 'active' : ''}>Peliculas</button>
        <button onClick={() => {setSelectedType('Serie'); setSelectedGenre('All'); setShowBiblioteca(false)}} className={selectedType === 'Serie' ? 'active' : ''}>Series</button>
        <button onClick={() => {setSelectedType('All'); setSelectedGenre('All'); setShowBiblioteca(true)}}>Biblioteca</button>
        <nav className="menu">
          <button onClick={() => setSelectedGenre('All')} className={selectedGenre === 'All' ? 'active' : ''}>Todas</button>
          <button onClick={() => setSelectedGenre('Accion')} className={selectedGenre === 'Accion' ? 'active' : ''}>Accion</button>
          <button onClick={() => setSelectedGenre('Romance')} className={selectedGenre === 'Romance' ? 'active' : ''}>Romance</button>
          <button onClick={() => setSelectedGenre('Comedia')} className={selectedGenre === 'Comedia' ? 'active' : ''}>Comedia</button>
          <button onClick={() => setSelectedGenre('Drama')} className={selectedGenre === 'Drama' ? 'active' : ''}>Drama</button>
          <button onClick={() => setSelectedGenre('Sci-Fi')} className={selectedGenre === 'Sci-Fi' ? 'active' : ''}>Sci-Fi</button>
          <button onClick={() => setSelectedGenre('Horror')} className={selectedGenre === 'Horror' ? 'active' : ''}>Horror</button>
        </nav>
      </nav>

    {role === 'admin' && <nav className="adminmenu">
      <h2>Controles Administrativos</h2>
      <button className="button2" onClick={() => setShowAddForm(true)}>Agregar Contenido</button>
      <button className="button2" onClick={() => setShowAddForm(true)}>Agregar Genero</button>
    </nav>}

      {showAddForm && (
        <div className="form" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000}}>
          <form onSubmit={handleAddSubmit} style={{background:'#222',padding:20,borderRadius:8,minWidth:320,color:'#fff'}}>
            <h3>Agregar nuevo elemento</h3>
            <div><label>Título</label><br/><input value={newTitle} onChange={e=>setNewTitle(e.target.value)} required /></div>
            <div><label>Géneros</label><br/><input value={newGenres} onChange={e=>setNewGenres(e.target.value)} placeholder="Accion, Comedia" /></div>
            <div><label>Tipo</label><br/>
              <select value={newType} onChange={e=>setNewType(e.target.value)}>
                <option value="Movie">Pelicula</option>
                <option value="Serie">Serie</option>
              </select>
            </div>
            {newType === 'Movie' && <div><label>Duración</label><br/><input value={newDuration} onChange={e=>setNewDuration(e.target.value)} placeholder="2h 10m" /></div>}
            <div><label>Descripción</label><br/><textarea value={newDescription} onChange={e=>setNewDescription(e.target.value)} /></div>
            <div style={{marginTop:8}}>
              <button type="submit">Agregar</button>
              <button type="button" onClick={()=>{setShowAddForm(false); resetForm();}} style={{marginLeft:8}}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {
       rowsForMovies.length > 0 && <h2>Peliculas</h2>
      }
      <table className="movies-table">
        <tbody>
          {rowsForMovies.map((row, rowIdx) => (
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

      {
       rowsForSeries.length > 0 && <h2>Series</h2>
      }
      <table className="movies-table">
        <tbody>
          {rowsForSeries.map((row, rowIdx) => (
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

      {/* FAVOURITESES*/}
      
      {rowsForFaves.length > 0 && showBiblioteca && (
        <>
          <h2>Favoritos</h2>
          <table className="movies-table">
            <tbody>
              {rowsForFaves.map((row, rowIdx) => (
                <tr key={rowIdx} className="Movie-row">
                  {row.map((movie, colIdx) => (
                    <td key={colIdx} className="movie-cell">
                      <button className="pelicula-click" onClick={() => handleMovieClick(movie)}>
                        <img src={movie.cover} alt={movie.name} className="movie-cover" />
                      </button>
                      <button className="pelicula-click" onClick={() => handleMovieClick(movie)}>
                        {movie.name}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default MainScreen;
