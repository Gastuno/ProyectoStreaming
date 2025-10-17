import React from 'react';
import { useLocation } from 'react-router-dom';
import '../MediaProfiles/MovieProfile.css';

function MovieProfile() {
  const location = useLocation();

  // Expect movie/media object to be passed via navigation state from MainScreen
  const media = location.state?.movie || location.state?.media || null;

  // If no media was passed, render a simple fallback message
  if (!media) {
    return (
      <div className="movie-profile-container">
        <div className="movie-profile-info-box">
          <h1 className="movie-profile-title">No media selected</h1>
          <p className="movie-profile-description">Please navigate here by clicking a media item from the main screen.</p>
        </div>
      </div>
    );
  }

  const isSeries = media.type === 'Serie' || media.type === 'Series' || media.type === 'serie' || media.type === 'series';
  const chapters = Array.isArray(media.chapters) ? media.chapters : [];

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
              </tr>
            </thead>
            <tbody>
              {chapters.map((ch, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{ch.name}</td>
                  <td>{ch.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default MovieProfile;
