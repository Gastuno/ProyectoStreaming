import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../MediaProfiles/MovieProfile.css';
import DefaultVideo from '../assets/placeholdervid.mp4';

function MovieProfile() {
  const location = useLocation();

  const media = location.state?.movie || location.state?.media || null;

  if (!media) {
    return (
      <div className="movie-profile-container">
        <div className="movie-profile-info-box">
          <h1 className="movie-profile-title">NULL</h1>
          <p className="movie-profile-description">NULL</p>
        </div>
      </div>
    );
  }

  const isSeries = media.type === 'Serie' || media.type === 'Series' || media.type === 'serie' || media.type === 'series';
  const chapters = Array.isArray(media.chapters) ? media.chapters : [];
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerSrc, setPlayerSrc] = useState('');
  const videoRef = useRef(null);

  const openPlayer = (src) => {
    setPlayerSrc(src || media.video || DefaultVideo);
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
        try { request.call(el); } catch (e) { /* ignore */ }
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

  return (
    <div
      className="movie-profile-container"
      style={{ backgroundImage: `url(${media.cover || ''})` }}
    >
      <div className="movie-profile-info-box">
        <h1 className="movie-profile-title">{media.name}</h1>

        <div className="movie-profile-genres">
          {Array.isArray(media.genres) ? media.genres.join(', ') : media.genres}
          {isSeries ? (
            ` · ${chapters.length} capítulos`
          ) : (
            media.duration ? ` · ${media.duration}` : ''
          )}
        </div>

        <p className="movie-profile-description">{media.description}</p>

        {isSeries && chapters.length > 0 && (
          <table className="movie-chapters-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Duración</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((ch, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{ch.name}</td>
                  <td>{ch.duration}</td>
                  <td><button onClick={() => openPlayer(ch.video || media.video)}>Play</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isSeries && (
          <div style={{marginTop:12}}>
            <button onClick={() => openPlayer(media.video)}>Play</button>
          </div>
        )}
      </div>
      {playerOpen && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:3000}}>
          <div style={{position:'absolute',right:20,top:20}}>
            <button onClick={closePlayer} style={{padding:8}}>Cerrar</button>
          </div>
          <video ref={videoRef} src={playerSrc || DefaultVideo} controls autoPlay style={{width:'100%',height:'100%',objectFit:'contain'}} onEnded={closePlayer} />
        </div>
      )}
    </div>
  );
}

export default MovieProfile;
