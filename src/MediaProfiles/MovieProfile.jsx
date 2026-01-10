import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, getDocs, collection, addDoc, query, where, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseconfig';
import '../MediaProfiles/MovieProfile.css';
import DefaultVideo from '../assets/placeholdervid.mp4';
import DefaultCover from '../assets/placeholder.jpg';

function MovieProfile() {
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const getImageSrc = (portada) => {
    if (!portada || portada === "url") return DefaultCover;
    if (portada.startsWith('http://') || portada.startsWith('https://')) return portada;
    return new URL(`../assets/${portada}`, import.meta.url).href;
  };

  // formulario
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingEp, setAddingEp] = useState(false);

  // player
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerSrc, setPlayerSrc] = useState('');
  const videoRef = useRef(null);

  // biblioteca
  const uid = useRef(`stars-${Math.random().toString(36).slice(2, 9)}`);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [faveDocId, setFaveDocId] = useState(null);

  // series
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);

  // rol
  const [role, setRole] = useState(sessionStorage.getItem('role') || 'user');

  // agregar stuff
  const [newEpName, setNewEpName] = useState('');
  const [newEpDesc, setNewEpDesc] = useState('');
  const [newEpDuration, setNewEpDuration] = useState('');
  const [newEpMov, setNewEpMov] = useState('');
  const [newEpNumTemp, setNewEpNumTemp] = useState(1);

  useEffect(() => {
    const checkSaved = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const q = query(collection(db, 'UsuarioFaves'), where('idUser', '==', user.uid), where('idFave', '==', id));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          setSaved(true);
          setFaveDocId(d.id);
        } else {
          setSaved(false);
          setFaveDocId(null);
        }
      } catch (err) {
        console.error('Error', err);
      }
    };
    checkSaved();
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'Producto', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMedia(data);

          try {
            const generoDetSnap = await getDocs(collection(db, 'Generos'));
            const generoLinks = generoDetSnap.docs.map(d => d.data());
            const generoSnap = await getDocs(collection(db, 'Genero'));
            const genreList = generoSnap.docs.map(d => ({ idGenero: d.id, ...d.data() }));
            const matched = generoLinks.filter(g => g.idProducto === id || g.idProd === id || g.id === id);
            const names = Array.from(new Set(matched.map(rel => {
              const gid = rel.idGenero || rel.idGen || rel.generoId;
              const gen = genreList.find(x => x.idGenero === gid);
              return gen ? String(gen.nombre).trim() : null;
            }).filter(Boolean)));
            if (names.length > 0) setGenres(names);
            else if (Array.isArray(data.genres) && data.genres.length > 0) setGenres(data.genres.map(g => String(g).trim()));
          } catch (e) {
            console.error('Error de genero', e);
            if (Array.isArray(data.genres) && data.genres.length > 0) setGenres(data.genres.map(g => String(g).trim()));
          }
        } else {
          console.error('No se encontr el producto');
        }
      } catch (err) {
        console.error('Error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!media || !media.tipo?.toLowerCase().includes("serie")) return;

      try {
        const q = query(
            collection(db, 'Capitulo'), 
            where('idSerie', '==', id), 
            where('numTemp', '==', selectedSeason)
        );

        const querySnapshot = await getDocs(q);
        const fetchedEpisodes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        setEpisodes(fetchedEpisodes);
      } catch (error) {
        console.error("Error cargando capítulos:", error);
      }
    };

    fetchEpisodes();
  }, [id, selectedSeason, media]); 

  {/* VIDEO PLAYER */}

  const openPlayer = (src) => {
    const videoSrc = src && src !== "url" ? new URL(`../assets/${src}`, import.meta.url).href : DefaultVideo;
    setPlayerSrc(videoSrc);
    setPlayerOpen(true);
  };

  const closePlayer = () => {
    setPlayerOpen(false);
    setPlayerSrc('');
  };

  useEffect(() => {
    if (playerOpen && videoRef.current) {
      const el = videoRef.current;
      const request = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
      if (request) {
        try { request.call(el); } catch (e) {}
      }
    }
    const onFsChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
        setPlayerOpen(false);
        setPlayerSrc('');
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('mozfullscreenchange', onFsChange);
    document.addEventListener('MSFullscreenChange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('mozfullscreenchange', onFsChange);
      document.removeEventListener('MSFullscreenChange', onFsChange);
    };
  }, [playerOpen]);

  if (loading) return <div className="movie-profile-container"><p>Cargando...</p></div>;
  if (!media) return <div className="movie-profile-container"><p>No se encontró el producto.</p></div>;

  const isSeries = media.tipo?.toLowerCase().includes("serie");
  const totalSeasons = Math.max(1, Number(media.numTemps) || 1);

{/* PERFIL CONTENIDO */}

  return (
    <div
      className="movie-profile-container"
      style={{ backgroundImage: `url(${getImageSrc(media.portada)})` }}
    >
      <div className="movie-profile-info-box">
        <div className="movie-profile-header">
          <img src={getImageSrc(media.portada)} alt={`${media.nombre} portada`} className="movie-profile-thumb" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 className="movie-profile-title">{media.nombre}</h1>

            <div className="movie-profile-genres">
              {genres && genres.length > 0 ? genres.join(' · ') : (media.genres && media.genres.length > 0 ? media.genres.join(' · ') : 'Sin género')}
            </div>

            <div className="movie-profile-genres">
              {isSeries
                ? `Duracion: ${media.numTemps || 0} temporadas`
                : `Duracion: ${media['duracion-m'] || media.duracion_m || media.duracion || ''} min`}
            </div>

            <div className="movie-profile-stars">
              {Array.from({ length: 5 }).map((_, i) => {
                const raw = Number(media.puntaje) || 0;
                const fill = Math.max(0, Math.min(1, raw - i));
                const gid = `${uid.current}-g-${i}`;
                return (
                  <svg key={i} className="star-svg" viewBox="0 0 24 24" aria-hidden="true">
                    <defs>
                      <linearGradient id={gid} x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset={`${fill * 100}%`} stopColor="#FFD166" />
                        <stop offset={`${fill * 100}%`} stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <path className="star-bg" d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.402 8.172L12 18.897l-7.336 3.873 1.402-8.172L.132 9.21l8.2-1.192z" />
                    <path className="star-fill" d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.402 8.172L12 18.897l-7.336 3.873 1.402-8.172L.132 9.21l8.2-1.192z" fill={`url(#${gid})`} />
                  </svg>
                );
              })}
              <span className="stars-label">{Number(media.puntaje) || 0}/5</span>
            </div>
          </div>
        </div>

        <p className="movie-profile-description">
          {media.descripcion || 'Sin descripción disponible'}
        </p>

        {/* BOTONES */}

        <div style={{ marginTop: 12 }}>
          {!isSeries && (<button onClick={() => openPlayer(media.mov)}>Play</button>)}
          <button
            onClick={async () => {
              if (saving) return;
              const user = auth.currentUser;
              setSaving(true);
              try {
                if (saved) {
                  if (faveDocId) {
                    await deleteDoc(doc(db, 'UsuarioFaves', faveDocId));
                  } else {
                    const q = query(collection(db, 'UsuarioFaves'), where('idUser', '==', user.uid), where('idFave', '==', id));
                    const existing = await getDocs(q);
                    for (const d of existing.docs) { await deleteDoc(doc(db, 'UsuarioFaves', d.id)); }
                  }
                  setSaved(false);
                  setFaveDocId(null);
                } else {
                  const ref = await addDoc(collection(db, 'UsuarioFaves'), { idUser: user.uid, idFave: id });
                  setSaved(true);
                  setFaveDocId(ref.id);
                }
              } catch (e) {
                console.error('Error', e);
                alert('Error');
              } finally {
                setSaving(false);
              }
            }}
            style={{ marginLeft: 8 }}
            disabled={saving}
          >
            {saving ? 'Cargando...' : saved ? 'Quitar' : 'Guardar'}
          </button>
        </div>

        {/* ADMIN */}

        {role === 'admin' && isSeries && <nav className="adminmenu">
        <h2>Controles Administrativos</h2>
        <button className="button2" onClick={() => setShowAddForm(true)}>Agregar Contenido</button>
        </nav>}

        {showAddForm && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2500}}>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (addingEp) return;
              setAddingEp(true);
              try {
                await addDoc(collection(db, 'Capitulo'), {
                  nombre: newEpName,
                  descripcion: newEpDesc,
                  'duracion-m': newEpDuration,
                  mov: newEpMov || '',
                  idSerie: id,
                  numTemp: Number(newEpNumTemp) || 1
                });
                alert('Capítulo agregado correctamente.');
                setNewEpName(''); setNewEpDesc(''); setNewEpDuration(''); setNewEpMov(''); setNewEpNumTemp(1);
                setShowAddForm(false);
                const q = query(collection(db, 'Capitulo'), where('idSerie','==', id), where('numTemp','==', selectedSeason));
                const snap = await getDocs(q);
                setEpisodes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
              } catch (err) {
                console.error('Error agregando capítulo:', err);
                alert('Error al agregar capítulo. Revisa la consola.');
              } finally {
                setAddingEp(false);
              }
            }} style={{background:'#222',padding:20,borderRadius:8,minWidth:360,color:'#fff'}}>
              <h3>Agregar nuevo capítulo</h3>
              <div><label>Nombre</label><br/><input required value={newEpName} onChange={e=>setNewEpName(e.target.value)} /></div>
              <div><label>Descripción</label><br/><textarea value={newEpDesc} onChange={e=>setNewEpDesc(e.target.value)} /></div>
              <div><label>Duración (min)</label><br/><input value={newEpDuration} onChange={e=>setNewEpDuration(e.target.value)} placeholder="45" /></div>
              <div><label>URL</label><br/><input value={newEpMov} onChange={e=>setNewEpMov(e.target.value)} placeholder="(opcional)" /></div>
              <div><label>Temporada</label><br/><input type="number" min={1} value={newEpNumTemp} onChange={e=>setNewEpNumTemp(e.target.value)} /></div>
              <div style={{marginTop:8}}>
                <button type="submit" disabled={addingEp}>{addingEp ? 'Guardando...' : 'Agregar capítulo'}</button>
                <button type="button" onClick={()=>setShowAddForm(false)} style={{marginLeft:8}}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* MOSTRAR CAPITULOS DE SERIE */}

        {isSeries && (
          <div className="series-section" style={{ marginTop: 18 }}>
            <div className="season-selector" style={{ marginBottom: 10 }}>
              {Array.from({ length: totalSeasons }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSeason(i + 1)}
                  className={selectedSeason === i + 1 ? 'active' : ''}
                  style={{ marginRight: 6, padding: '6px 10px' }}
                >
                  Temporada {i + 1}
                </button>
              ))}
            </div>

            <table className="episodes-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8 }}>Capítulo</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Duración</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {episodes.length > 0 ? (
                    episodes.map((ep) => (
                    <tr key={ep.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: 8 }}>
                            <div style={{ fontWeight: 'bold' }}>{ep.nombre}</div>
                            <div style={{ fontSize: '0.85em', opacity: 0.7 }}>{ep.descripcion}</div>
                        </td>
                        <td style={{ padding: 8 }}>
                             {ep['duracion-m'] || ep.duracion_m || ''} min
                        </td>
                        <td style={{ padding: 8 }}>
                        <button onClick={() => openPlayer(ep.mov)}>Play</button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="3" style={{ padding: 20, textAlign: 'center', opacity: 0.7 }}>
                            Sin capitulos por el momento!
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ESTILO PLAYER */}

      {playerOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 3000
          }}
        >
          <div style={{ position: 'absolute', right: 20, top: 20 }}>
            <button onClick={closePlayer} style={{ padding: 8 }}>Cerrar</button>
          </div>
          <video
            ref={videoRef}
            src={playerSrc || DefaultVideo}
            controls autoPlay
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onEnded={closePlayer}
          />
        </div>
      )}
    </div>
  );
}

export default MovieProfile;