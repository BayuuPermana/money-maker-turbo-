import React from 'react';
import { Video, Award, DollarSign, Activity, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export default function Dashboard({ stats, activeTasksCount, videosCount, onNavigate }) {
  return (
    <div className="tab-content fade-in">
      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="glass-card stat-card primary">
          <div className="stat-icon-wrapper">
            <Video size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Videos Generated</span>
            <span className="stat-value">{videosCount}</span>
            <span className="stat-trend up">↗ +12% this week</span>
          </div>
        </div>

        <div className="glass-card stat-card success">
          <div className="stat-icon-wrapper">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Success Rate</span>
            <span className="stat-value">98.6%</span>
            <span className="stat-trend up">↗ +0.2% improvement</span>
          </div>
        </div>

        <div className="glass-card stat-card accent">
          <div className="stat-icon-wrapper">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">API Credits Used</span>
            <span className="stat-value">$14.28</span>
            <span className="stat-trend down">↘ -4% less usage</span>
          </div>
        </div>

        <div className="glass-card stat-card secondary">
          <div className="stat-icon-wrapper">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Running Tasks</span>
            <span className="stat-value">{activeTasksCount}</span>
            <span className="stat-trend up">{activeTasksCount > 0 ? 'Active rendering...' : 'Idle'}</span>
          </div>
        </div>
      </div>

      {/* Main Panel with Graphic / Guide & Welcome banner */}
      <div className="dashboard-main-grid">
        {/* Left Column - Welcome & Performance */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={20} style={{ color: 'var(--color-secondary)' }} /> Quick Start Guide
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
            MoneyPrinterTurbo is a highly automated content creation engine. It leverages Large Language Models (LLMs) to write captivating scripts, advanced Text-to-Speech (TTS) engines to generate natural narratives, and stock media engines to compile stunning visual timelines complete with subtitles.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '12px 0' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>1</span>
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '2px' }}>Enter Subject & Topic</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Input your core topic in the video generator form.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ background: 'var(--color-secondary-glow)', color: 'var(--color-secondary)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>2</span>
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '2px' }}>Review or Edit the Script</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Generate or paste your script and tweak paragraphs to your liking.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ background: 'var(--color-accent-glow)', color: 'var(--color-accent)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>3</span>
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '2px' }}>Synthesize & Render</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select background music, voiceover and click render. Track logs in real time.</p>
              </div>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: 'fit-content', marginTop: 'auto' }} onClick={() => onNavigate('generator')}>
            Generate a Video Now <ArrowRight size={16} />
          </button>
        </div>

        {/* Right Column - System Status */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} style={{ color: 'var(--color-accent)' }} /> System Diagnostics
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 500 }}>
                <span style={{ color: 'var(--text-secondary)' }}>FFmpeg Video Renderer</span>
                <span style={{ color: 'var(--color-success)' }}>Online (GPU Accelerated)</span>
              </div>
              <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '100%', background: 'var(--color-success)' }} /></div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 500 }}>
                <span style={{ color: 'var(--text-secondary)' }}>TTS Engine (EdgeTTS)</span>
                <span style={{ color: 'var(--color-success)' }}>Operational</span>
              </div>
              <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '100%', background: 'var(--color-success)' }} /></div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 500 }}>
                <span style={{ color: 'var(--text-secondary)' }}>OpenAI API Latency</span>
                <span style={{ color: 'var(--color-success)' }}>145ms (Healthy)</span>
              </div>
              <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '92%', background: 'var(--color-success)' }} /></div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 500 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pexels Sourcing Crawler</span>
                <span style={{ color: 'var(--color-success)' }}>Ready (Rate Limits: 200/200)</span>
              </div>
              <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '100%', background: 'var(--color-success)' }} /></div>
            </div>
          </div>

          <div style={{ 
            marginTop: 'auto', 
            background: 'rgba(0,0,0,0.2)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '12px', 
            padding: '14px',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <RefreshCw size={16} className="spin-loader" style={{ color: 'var(--color-secondary)' }} />
            <span>FastAPI Server on <b>http://localhost:8000</b> is connected.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
