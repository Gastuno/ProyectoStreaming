import './MainScreen.css';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { addDoc, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebaseconfig';
import { urlimagen } from './urlimagen';

function MainScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [uid, setUserId] = useState(null); 
  const [faveIds, setFaveIds] = useState([]);
  const [role, setRole] = useState('user');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddFormGender, setShowAddFormGender] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGenres, setNewGenres] = useState([]);
  const [newType, setNewType] = useState('Movie');
  const [newDuration, setNewDuration] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDirector, setNewDirector] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newChaptersText, setNewChaptersText] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [genreSubmitting, setGenreSubmitting] = useState(false);
  const [genreError, setGenreError] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showBiblioteca, setShowBiblioteca] = useState(false);
  const [searchMov, setSearch] = useState('');
  const [genresList, setGenresList] = useState([]);
  const [msjError, setMsjError] = useState('');
  const [newGenre, setNewGenre] = useState('');

//interaccion bd
useEffect(() => {
      const sid = sessionStorage.getItem('userId');
      if (sid) {
          setUserId(sid);
      }
  }, []);

useEffect(() => {
  const fromState = location.state?.role;
  const stored = sessionStorage.getItem('role');
  if (fromState) setRole(fromState);
  else if (stored) setRole(stored);
}, [location.state]);

useEffect(() => {
    if (!uid) { 
        setLoading(false);
        return; 
    }

  const fetchMovies = async () => {
    try {
      //cargar faves
      const qFaves = query(
      collection(db, "UsuarioFaves"),
      where("idUser", "==", uid) 
      );
      
      const favesSnap = await getDocs(qFaves);
      const faveIds = favesSnap.docs.map(doc => doc.data().idFave);
      setFaveIds(faveIds); 

      //cargar productos
      const prodSnap = await getDocs(collection(db, "Producto"));
      const products = prodSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      //cargar generos
      const generoBd = await getDocs(collection(db, "Genero"));
      const genreList = generoBd.docs.map(doc => ({
        idGenero: doc.id,
        ...doc.data()
      }));

      setGenresList(genreList.map(g => g.nombre));

      const generoDetBd = await getDocs(collection(db, "Generos"));
      const generoLinks = generoDetBd.docs.map(doc => doc.data());

      const adapted = products.map(prod => {
        const matched = generoLinks.filter(g => g.idProducto === prod.id || g.idProd === prod.id);
        const saved = faveIds.includes(prod.id);
        const genres = Array.from(new Set(matched.map(rel => {
          const genreId = rel.idGenero || rel.idGen || rel.generoId;
          const gen = genreList.find(g => g.idGenero === genreId);
          return gen ? String(gen.nombre).trim() : null;
        }).filter(Boolean)));

        console.log("Generos: ", genres);
        
        return {
          id: prod.id,
          name: prod.nombre,
          cover: urlimagen(prod.portada),
          type: prod.tipo === "Pelicula" ? "Movie" : "Serie",
          duration: prod["duracion-m"] || "",
          stars: prod.puntaje || 0,
          saved: saved,
          fav: false,
          genres: genres.length > 0 ? genres : ["Desconocido"],
          description: prod.descripcion || "",
          numTemps: prod.numTemps || 0
        };
      });

      
      setMovies(adapted);

    } catch (error) {
      console.error("Error cargando películas:", error);
      
      if (error.code === 'permission-denied') {
        setMsjError('Permiso denegado');
      } else if (error.code === 'unauthenticated') {
        setMsjError('Error de autenticación, por favor intente denuevo');
      } else if (error.code === 'unavailable') {
        setMsjError('Contenido no disponible');
      } else {
        setMsjError('Error al cargar el contenido. por favor intente denuevo');
      }
    } finally {
      setLoading(false);
    }
  };

  fetchMovies();
}, [uid]);


  const resetForm = () => {
    setNewTitle(''); setNewGenres([]); setNewType('Movie'); setNewDuration(''); setNewDescription(''); setNewChaptersText(''); setGenreError(''); setMsjError('');
  };

  const handleAddSubmit = async (e) => {
  e.preventDefault();

  if (procesando) return; 
  setProcesando(true);


  //interaccion BD crear peli

  try {
    let inputGenres = [];
    if (Array.isArray(newGenres)) {
      inputGenres = newGenres.map(g => String(g).trim()).filter(Boolean);
    } else {
      inputGenres = String(newGenres).split(',').map(g => g.trim()).filter(Boolean);
    }

    if (inputGenres.length === 0) {
      setGenreError('Seleccione al menos un género.');
      setProcesando(false);
      return;
    }

    const productoRef = await addDoc(collection(db, "Producto"), {
      fechaLanz: new Date(),
      descripcion: newDescription,
      'duracion-m': newDuration,
      director: newDirector,
      mov: "",
      nombre: newTitle,
      numTemps: newType === "Serie" ? 1 : null,
      portada: newUrl ? newUrl : "url",
      tipo: newType === "Movie" ? "Pelicula" : "Serie",
    });

    const productoId = productoRef.id;
    console.log("Producto guardado con ID:", productoId);

    for (const genreName of inputGenres) {
      const qGenre = query(
        collection(db, "Genero"),
        where("nombre", "==", genreName)
      );

      const snap = await getDocs(qGenre);

      let genreId;

      if (snap.empty) {
        const newGenreRef = await addDoc(collection(db, "Genero"), {
          nombre: genreName
        });
        genreId = newGenreRef.id;
        console.log("Nuevo género creado:", genreName, genreId);
      } else {
        genreId = snap.docs[0].id;
        console.log("Género encontrado:", genreName, genreId);
      }

      await addDoc(collection(db, "Generos"), {
        idProducto: productoId,
        idGenero: genreId
      });

      console.log("Link creado:", productoId, " → ", genreId);
    }

    alert("Contenido agregado con exito.");
    setShowAddForm(false);
    resetForm();
    setProcesando(false);

    window.location.reload();

  } catch (error) {
    console.error("Error guardando contenido:", error);
    
    let mensajeError = 'Error guardando contenido';
    
    if (error.code === 'permission-denied') {
      mensajeError = 'Permiso denegado';
    } else if (error.code === 'unauthenticated') {
      mensajeError = 'Error de autenticación, por favor intente denuevo';
    } else if (error.code === 'unavailable') {
      mensajeError = 'Contenido no disponible';
    } else if (error.code === 'invalid-argument') {
      mensajeError = 'Argumento invalido en el formulario';
    }
    
    alert(mensajeError);
    setProcesando(false);
  }
  };


//logica filtros

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
  if (searchMov.trim() !== '') {
    const searchLower = searchMov.toLowerCase();
    filteredMovies = filteredMovies.filter(movie => movie.name.toLowerCase().includes(searchLower));
  }

  const columns = 7;
  const moviesList = filteredMovies.filter(m => m.type === 'Movie');
  const seriesList = filteredMovies.filter(m => m.type === 'Serie');
  const faves = filteredMovies.filter(m => m.fav === (true));
  
  //logica tablas

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
    navigate(`/movie/${encodeURIComponent(movie.id)}`);
};

  // Menus de arriba
  const availableGenres = ['All', ...Array.from(new Set(genresList.filter(Boolean)))];

  return (
    <div className="main">
      {loading && <p>Cargando...</p>}
      {msjError && <div style={{position:'fixed', top:20, left:20, background:'#d32f2f', color:'white', padding:'12px 16px', borderRadius:'4px', zIndex:3000}}>{errorMsg}</div>}
      <div className="background"></div>
      <nav className="topmenu">
        <button onClick={() => {setSelectedType('All'); setSelectedGenre('All'); setShowBiblioteca(false)}}className={selectedType === 'All' && selectedGenre === 'All' && !showBiblioteca ? 'active' : '' }>Home</button>
        <button onClick={() => {setSelectedType('Movie'); setSelectedGenre('All'); setShowBiblioteca(false)}} className={selectedType === 'Movie' ? 'active' : ''}>Peliculas</button>
        <button onClick={() => {setSelectedType('Serie'); setSelectedGenre('All'); setShowBiblioteca(false)}} className={selectedType === 'Serie' ? 'active' : ''}>Series</button>
        <input type="text" placeholder="Buscar..." value={searchMov} onChange={e => setSearch(e.target.value)} className="search-input" />
        <nav className="menu">
          {availableGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => {setShowBiblioteca(false); setSelectedGenre(genre)}}
              className={selectedGenre === genre ? 'active' : ''}
            >
              {genre}
            </button>
          ))}
        </nav>
      </nav>

      <nav className="biblioteca-menu">
        <button onClick={() => {setSelectedType('All'); setSelectedGenre('All'); setShowBiblioteca(true)}}className={showBiblioteca ? 'active' : ''}>Biblioteca</button>
        <button onClick={() => {sessionStorage.clear(); navigate('/');}}>Logout</button>
      </nav>

    {/* ADMIN */}

    {role === 'admin' && <nav className="adminmenu">
      <h2>Controles Administrativos</h2>
      <button className="button2" onClick={() => setShowAddForm(true)}>Agregar Contenido</button>
      <button className="button2" onClick={() => setShowAddFormGender(true)}>Agregar Genero</button>
      <button className="button2" onClick={() => navigate('/userindex')}>Usuarios</button>
    </nav>}


    {/* FORMULARIO DE ANIADIR GENERO */}
    {showAddFormGender && (
      <div className="form" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000}}>
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (genreSubmitting) return;
          setGenreSubmitting(true);

          const formData = new FormData(e.target);
          const nombre = formData.get('nombre');

          try {
            const generoSnap = await getDocs(collection(db, "Genero"));
            const nextId = String(generoSnap.size);
            await setDoc(doc(db, "Genero", nextId), { nombre });
            setShowAddFormGender(false);
            setNewGenre('');
          } catch (error) {
            console.error("Error al agregar género:", error);
          } finally {
            setGenreSubmitting(false);
          }
        }} style={{background:'#222',padding:20,borderRadius:8,minWidth:320,color:'#fff'}}>
          <h3>Agregar nuevo género</h3>
          <div><label>Nombre</label><br/><input type="text" name="nombre" value={newGenre} onChange={e => setNewGenre(e.target.value)} required /></div>
          <div style={{marginTop:8}}>
            <button type="submit" disabled={genreSubmitting}> {genreSubmitting ? 'Guardando...' : 'Agregar'}</button>
            <button type="button" onClick={()=>{setShowAddFormGender(false);}} style={{marginLeft:8}}>Cancelar</button>
          </div>
        </form>
      </div>
    )}

    {/* FORMULARIO DE ANIADIR CONTENIDO */}

      {showAddForm && (
        <div className="form" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000}}>
          <form onSubmit={handleAddSubmit} style={{background:'#222',padding:20,borderRadius:8,minWidth:320,color:'#fff'}}>
            <h3>Agregar nuevo elemento</h3>
            <div><label>Título</label><br/><input value={newTitle} maxLength={30} onChange={e=>setNewTitle(e.target.value)} required /></div>
            <div><label>Tipo</label><br/>
              <select value={newType} onChange={e=>setNewType(e.target.value)}>
                <option value="Movie">Pelicula</option>
                <option value="Serie">Serie</option>
              </select>
            </div>
            <div><label>Géneros</label><br/>
            {genresList.map(g => (
              <label key={g} style={{display:'block'}}>
                <input
                  type="checkbox"
                  value={g}
                  checked={newGenres.includes(g)}
                  onChange={e => {
                    if (e.target.checked) {
                      setNewGenres([...newGenres, g]);
                      if (genreError) setGenreError('');
                    } else {
                      setNewGenres(newGenres.filter(x => x !== g));
                    }
                  }}
                />
                {g}
              </label>
            ))}
            {genreError && <div style={{color:'tomato', marginTop:4}}>{genreError}</div>}
            </div>
            {newType === 'Movie' && <div><label>Duración(minutos)</label><br/><input value={newDuration} max={999} min={0} type="number" onChange={e=>setNewDuration(e.target.value)} placeholder="120" /></div>}
            <div><label>Descripción</label><br/><textarea value={newDescription} onChange={e=>setNewDescription(e.target.value)} /></div>
            <div><label>Url Portada</label><br/><textarea value={newUrl} type="image" onChange={e=>setNewUrl(e.target.value)} /></div>
            <div style={{marginTop:8}}>
            <button type="submit" disabled={procesando}> {procesando ? 'Guardando...' : 'Agregar'}</button>
            <button type="button" onClick={()=>{setShowAddForm(false); resetForm();}} style={{marginLeft:8}}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLA CONTENIDO */}
      {/* PELICULAS */}
      {
       rowsForMovies.length > 0 && <div className="content-section"><h2>Peliculas</h2>
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
      </table></div>
      }

      {/* SERIES */}
      {
       rowsForSeries.length > 0 && <div className="content-section"><h2>Series</h2>
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
      </table></div>
      }
    </div>
  );
}

export default MainScreen;
