import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseconfig';
import '../MediaProfiles/MovieProfile.css';
import DefaultVideo from '../assets/placeholdervid.mp4';
import DefaultCover from '../assets/placeholder.jpg';

function MovieProfile() {
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerSrc, setPlayerSrc] = useState('');
  const videoRef = useRef(null);
  const uid = useRef(`stars-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "Producto", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMedia(docSnap.data());
        } else {
          console.error("No se encontró el producto");
        }
      } catch (err) {
        console.error("Error al obtener datos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const openPlayer = (src) => {
    setPlayerSrc(src || DefaultVideo);
    setPlayerOpen(true);
  };

  const closePlayer = () => {
    setPlayerOpen(false);
    setPlayerSrc('');
  };

  useEffect(() => {
    if (playerOpen && videoRef.current) {
      const el = videoRef.current;
      const request =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen;
      if (request) {
        try {
          request.call(el);
        } catch (e) {}
      }
    }

    const onFsChange = () => {
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement
      ) {
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

  if (loading)
    return (
      <div className="movie-profile-container">
        <p>Cargando...</p>
      </div>
    );
  if (!media)
    return (
      <div className="movie-profile-container">
        <p>No se encontró el producto.</p>
      </div>
    );

  const isSeries = media.tipo?.toLowerCase().includes("serie");

  return (
    <div
      className="movie-profile-container"
      style={{ backgroundImage: `url(${media.portada || ''})` || DefaultCover }}
    >
      <div className="movie-profile-info-box">
        <div className="movie-profile-header">
          <img
            src={media.portada}
            alt={`${media.nombre} portada`}
            className="movie-profile-thumb"
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 className="movie-profile-title">{media.nombre}</h1>

            <div className="movie-profile-genres">
              {isSeries
                ? `· ${media.numTemps || 0} temporadas`
                : `· ${media['duracion-m'] || media.duracion_m || media.duracion || ''} min`}
            </div>

            <div className="movie-profile-stars">
              {Array.from({ length: 5 }).map((_, i) => {
                const raw = Number(media.puntaje) || 0;
                const fill = Math.max(0, Math.min(1, raw - i));
                const gid = `${uid.current}-g-${i}`;
                return (
                  <svg
                    key={i}
                    className="star-svg"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id={gid}
                        x1="0%"
                        x2="100%"
                        y1="0%"
                        y2="0%"
                      >
                        <stop
                          offset={`${fill * 100}%`}
                          stopColor="#FFD166"
                        />
                        <stop
                          offset={`${fill * 100}%`}
                          stopColor="transparent"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      className="star-bg"
                      d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.402 8.172L12 18.897l-7.336 3.873 1.402-8.172L.132 9.21l8.2-1.192z"
                    />
                    <path
                      className="star-fill"
                      d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.402 8.172L12 18.897l-7.336 3.873 1.402-8.172L.132 9.21l8.2-1.192z"
                      fill={`url(#${gid})`}
                    />
                  </svg>
                );
              })}
              <span className="stars-label">
                {Number(media.puntaje) || 0}/5
              </span>
            </div>
          </div>
        </div>

        <p className="movie-profile-description">
          {media.descripcion || 'Sin descripción disponible'}
        </p>

        <div style={{ marginTop: 12 }}>
          <button onClick={() => openPlayer(media.video)}>Play</button>
        </div>
      </div>

      {playerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000
          }}
        >
          <div style={{ position: 'absolute', right: 20, top: 20 }}>
            <button onClick={closePlayer} style={{ padding: 8 }}>
              Cerrar
            </button>
          </div>
          <video
            ref={videoRef}
            src={playerSrc || DefaultVideo}
            controls
            autoPlay
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onEnded={closePlayer}
          />
        </div>
      )}
    </div>
  );
}

export default MovieProfile;
