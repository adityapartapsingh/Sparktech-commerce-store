import React, { useState } from 'react';
import { Play, ExternalLink, X, ChevronRight } from 'lucide-react';

const TUTORIALS = [
  {
    id: 1,
    title: 'CAN-BUS Communication Protocol',
    subtitle: 'Connecting MCP2515 CAN module with Arduino & STM32',
    duration: '2 Min Guide',
    tag: 'Protocol',
    color: '#3B82F6',
    youtubeId: 'qR0G6f_yF4c',
    author: 'Robu.in Engineering',
  },
  {
    id: 2,
    title: 'PID Tuning of Self-Balancing Robot',
    subtitle: 'Calibrating Kp, Ki, Kd coefficients for stability in real-time',
    duration: '2 Min Guide',
    tag: 'Control Systems',
    color: '#10B981',
    youtubeId: 'k5_w37c7s8E',
    author: "Robu's Two Minute Tutorials",
  },
  {
    id: 3,
    title: 'Waveshare mmWave Micro-Motion Sensor',
    subtitle: '24GHz FMCW Human presence detection & GPIO interrupt wiring',
    duration: '2 Min Guide',
    tag: 'Sensors',
    color: '#F59E0B',
    youtubeId: 'R9K1u9Z4u5E',
    author: 'Electronics Lab Demo',
  },
  {
    id: 4,
    title: 'Interfacing DHT11 Sensor with STM32',
    subtitle: 'HAL Timer configuration & single-wire bit readout in CubeIDE',
    duration: '2 Min Guide',
    tag: 'Embedded C',
    color: '#8B5CF6',
    youtubeId: 'F6K2b_E525U',
    author: 'STM32 Architecture',
  },
];

export default function TutorialVideosSection() {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <section className="section" style={{ paddingBlock: '3.5rem 4rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Knowledge Hub
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
              Our Short Videos &amp; Tutorials
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Concise hardware interfacing, robotics tuning, and protocol guides from YouTube
            </p>
          </div>

          <a
            href="https://www.youtube.com/@RobuIn/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}
          >
            View All On YouTube <ChevronRight size={16} />
          </a>
        </div>

        {/* 4 Video Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {TUTORIALS.map((video) => (
            <div
              key={video.id}
              onClick={() => setActiveVideo(video)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = 'var(--accent-blue)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              {/* Thumbnail Container with YouTube Thumbnail Image */}
              <div
                style={{
                  position: 'relative',
                  height: '160px',
                  background: '#0B1120',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.9)',
                    transition: 'transform 0.4s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />

                {/* Dark Vignette Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* 2 Minute Tutorial Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: 'rgba(15, 23, 42, 0.88)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#F8FAFC',
                    zIndex: 2,
                  }}
                >
                  ⚡ {video.duration}
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    background: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(4px)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    zIndex: 2,
                  }}
                >
                  {video.tag}
                </div>

                {/* Circular Play Button in Center */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    color: '#0F172A',
                    zIndex: 3,
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <Play size={20} fill="#0F172A" style={{ marginLeft: 3 }} />
                </div>
              </div>

              {/* Title & Info */}
              <div style={{ padding: '1rem 1.15rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                    {video.title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '0.75rem' }}>
                    {video.subtitle}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>{video.author}</span>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Watch Now →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal with Real YouTube Embed */}
      {activeVideo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '1.5rem',
          }}
          onClick={() => setActiveVideo(null)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: 720,
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-blue" style={{ fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                  {activeVideo.tag} • {activeVideo.duration}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {activeVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                aria-label="Close tutorial"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Embedded Responsive YouTube Player */}
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            </div>

            {/* Modal Footer with Actions */}
            <div style={{ padding: '0.85rem 1.25rem', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                {activeVideo.subtitle}
              </p>
              <a
                href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Open on YouTube <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
