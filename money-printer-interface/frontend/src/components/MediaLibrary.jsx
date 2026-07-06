import React from 'react';
import { PlayCircle, Download, Film, Clock, Calendar } from 'lucide-react';

const API_BASE = "http://localhost:8000";

export default function MediaLibrary({ videos, isLoading, onPlayVideo }) {
  
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return "Recent";
    }
  };

  const formatDuration = (sec) => {
    if (!sec) return "0:45";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="tab-content fade-in">
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <PlayCircle size={40} className="spin-loader" style={{ color: 'var(--color-primary)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading media library collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content fade-in">
      <div className="glass-card">
        <h2 className="section-title">
          <Film size={20} /> Media Library Gallery ({videos.length})
        </h2>

        {videos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <p>No generated videos found in library.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Render some topic queries first in the Video Generator form.</p>
          </div>
        ) : (
          <div className="video-grid">
            {videos.map(video => {
              const isPortrait = video.aspect_ratio === '9:16';
              const downloadUrl = video.download_url.startsWith('http') 
                ? video.download_url 
                : `${API_BASE}${video.download_url}`;

              return (
                <div 
                  key={video.id} 
                  className={`video-card ${isPortrait ? 'portrait' : 'landscape'}`}
                >
                  <div 
                    className="video-thumbnail-container"
                    onClick={() => onPlayVideo(video)}
                  >
                    <div className="video-thumbnail-placeholder">
                      <Film size={36} style={{ opacity: 0.6 }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        {isPortrait ? 'Short Form' : 'Wide Screen'}
                      </span>
                    </div>

                    <span className="video-badge">{video.aspect_ratio}</span>
                    <span className="video-duration">
                      <Clock size={10} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                      {formatDuration(video.duration)}
                    </span>

                    <div className="play-overlay">
                      <div className="play-btn-circle">
                        <PlayCircle size={28} />
                      </div>
                    </div>
                  </div>

                  <div className="video-details">
                    <h3 className="video-title" title={video.title}>{video.title}</h3>
                    <p className="video-prompt" title={video.prompt}>"{video.prompt}"</p>
                    
                    <div className="video-footer">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {formatDate(video.created_at)}
                      </span>
                      <a 
                        href={downloadUrl} 
                        download={`video_${video.id}.mp4`}
                        target="_blank" 
                        rel="noreferrer"
                        className="control-btn"
                        style={{ color: 'var(--text-secondary)' }}
                        title="Download Video File"
                        onClick={e => e.stopPropagation()}
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
