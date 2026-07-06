import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Subtitles, Maximize } from 'lucide-react';

const API_BASE = "http://localhost:8000";

const MOCK_SUBTITLES = [
  { start: 0, end: 4, text: "Welcome to this AI-generated video!" },
  { start: 4, end: 9, text: "Today, we're exploring an exciting subject." },
  { start: 9, end: 15, text: "Automating content creation has never been easier than with MoneyPrinterTurbo." },
  { start: 15, end: 21, text: "We combine state-of-the-art LLMs with high-quality TTS voices." },
  { start: 21, end: 28, text: "Then, relevant stock footages are automatically sourced and combined." },
  { start: 28, end: 35, text: "Subtitles are rendered in real-time to match the narrator's voice." },
  { start: 35, end: 42, text: "This workflow enables creators to print high-converting shorts rapidly." },
  { start: 42, end: 45, text: "Stay tuned for more automation tips and tricks!" }
];

export default function CustomPlayer({ video, onClose }) {
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState("");

  const videoUrl = video.download_url.startsWith('http') 
    ? video.download_url 
    : `${API_BASE}${video.download_url}`;

  // Handle Play/Pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Update Progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curTime = videoRef.current.currentTime;
      setCurrentTime(curTime);
      
      // Update subtitles
      if (showSubtitles) {
        const activeSub = MOCK_SUBTITLES.find(
          sub => curTime >= sub.start && curTime <= sub.end
        );
        setCurrentSubtitle(activeSub ? activeSub.text : "");
      } else {
        setCurrentSubtitle("");
      }
    }
  };

  // Handle Loaded Metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || video.duration || 45);
    }
  };

  // Scrub progress
  const handleScrub = (e) => {
    if (progressBarRef.current && videoRef.current && duration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(1, clickX / width));
      videoRef.current.currentTime = percentage * duration;
      setCurrentTime(percentage * duration);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Volume slider change
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Request Fullscreen
  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Formatting helper
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Auto play when modal opens
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log("Auto-play blocked, waiting for interaction"));
    }
  }, [video]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <h3>{video.title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-content">
          {/* Custom Player Column */}
          <div className={`custom-player-wrapper ${video.aspect_ratio === '9:16' ? 'portrait' : 'landscape'}`}>
            <video 
              ref={videoRef}
              src={videoUrl}
              className="main-video"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onClick={togglePlay}
              playsInline
            />
            
            {/* Custom Subtitle Layer overlay */}
            {showSubtitles && currentSubtitle && (
              <div className="subtitle-overlay">
                <span className="subtitle-text">{currentSubtitle}</span>
              </div>
            )}
            
            {/* Player Controls overlay */}
            <div className="player-controls">
              {/* Timeline bar */}
              <div 
                ref={progressBarRef}
                className="player-timeline-container"
                onClick={handleScrub}
              >
                <div 
                  className="player-progress-bar"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              
              {/* Buttons row */}
              <div className="player-controls-row">
                <div className="controls-left">
                  <button className="control-btn" onClick={togglePlay}>
                    {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                  </button>
                  
                  <button className="control-btn" onClick={toggleMute}>
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={isMuted ? 0 : volume} 
                    onChange={handleVolumeChange} 
                    style={{ width: '60px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                  />
                  
                  <span className="video-time">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="controls-right">
                  <button 
                    className={`control-btn ${showSubtitles ? '' : 'text-muted'}`}
                    onClick={() => setShowSubtitles(!showSubtitles)}
                    title="Toggle Subtitles"
                  >
                    <Subtitles size={16} style={{ opacity: showSubtitles ? 1 : 0.5 }} />
                  </button>
                  
                  <button className="control-btn" onClick={handleFullscreen} title="Fullscreen">
                    <Maximize size={16} />
                  </button>
                  
                  <a 
                    href={videoUrl} 
                    download={`video_${video.id}.mp4`}
                    target="_blank" 
                    rel="noreferrer"
                    className="control-btn" 
                    title="Download Video"
                  >
                    <Download size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Metadata/Information Column */}
          <div className="modal-details-side">
            <div className="modal-detail-section">
              <h4>Title</h4>
              <p style={{ fontWeight: 600 }}>{video.title}</p>
            </div>
            
            <div className="modal-detail-section">
              <h4>Generation Prompt</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                "{video.prompt}"
              </p>
            </div>
            
            <div className="modal-detail-section">
              <h4>Technical Specs</h4>
              <div className="metadata-pill-group" style={{ marginTop: '8px' }}>
                <span className="metadata-pill">Aspect Ratio: {video.aspect_ratio}</span>
                <span className="metadata-pill">Duration: {formatTime(duration)}</span>
                <span className="metadata-pill">Format: MP4</span>
                <span className="metadata-pill">ID: {video.id}</span>
              </div>
            </div>

            <div className="modal-detail-section">
              <h4>Subtitles Script</h4>
              <div 
                style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  fontSize: '0.8rem', 
                  color: 'var(--text-secondary)',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  lineHeight: '1.5'
                }}
              >
                {MOCK_SUBTITLES.map((sub, idx) => (
                  <div key={idx} style={{ marginBottom: '6px' }}>
                    <span style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', marginRight: '8px' }}>
                      [{formatTime(sub.start)}]
                    </span>
                    {sub.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
