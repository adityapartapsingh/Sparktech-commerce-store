import React from 'react';
import { motion } from 'framer-motion';

/**
 * High-performance, hardware-engineered SVG PCB Circuit Background
 * Features authentic 45-degree PCB traces, glowing micro-vias, and pulsating data currents.
 * Fully responsive and strictly contained to prevent document flow overflow on mobile.
 */
const CircuitBackground = ({ className = '', showTelemetry = true }) => {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      {/* Blueprint Matrix Grid */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.22,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hardware-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="var(--border, rgba(255,255,255,0.08))"
              strokeWidth="0.5"
            />
            <circle cx="0" cy="0" r="1" fill="var(--border-hover, rgba(255,255,255,0.18))" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hardware-grid)" />
      </svg>

      {/* PCB Circuit Traces & Solder Nodes */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="trace-glow-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="trace-glow-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
          </linearGradient>
          <filter id="pcb-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Passive Circuit Traces (Left Flank) */}
        <g stroke="var(--border, rgba(255,255,255,0.12))" strokeWidth="1.5" fill="none">
          <path d="M 0 180 L 180 180 L 260 260 L 420 260" />
          <path d="M 0 320 L 120 320 L 190 390 L 360 390 L 410 440" />
          <path d="M 80 0 L 80 140 L 150 210 L 150 350" />
          <path d="M 220 0 L 220 90 L 280 150 L 390 150" />
        </g>

        {/* Passive Circuit Traces (Right Flank) */}
        <g stroke="var(--border, rgba(255,255,255,0.12))" strokeWidth="1.5" fill="none">
          <path d="M 1440 220 L 1260 220 L 1180 300 L 1020 300" />
          <path d="M 1440 400 L 1310 400 L 1230 480 L 1070 480 L 1010 540" />
          <path d="M 1360 0 L 1360 160 L 1280 240 L 1280 400" />
          <path d="M 1200 0 L 1200 110 L 1140 170 L 1040 170" />
        </g>

        {/* Active Animated Power Rail & Data Traces */}
        <motion.path
          d="M 0 240 L 210 240 L 290 320 L 460 320 L 510 370"
          fill="none"
          stroke="url(#trace-glow-blue)"
          strokeWidth="2"
          filter="url(#pcb-glow)"
          initial={{ pathLength: 0, opacity: 0.3 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0.3, 0.9, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.path
          d="M 1440 280 L 1230 280 L 1150 360 L 980 360 L 920 420"
          fill="none"
          stroke="url(#trace-glow-green)"
          strokeWidth="2"
          filter="url(#pcb-glow)"
          initial={{ pathLength: 0, opacity: 0.3 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0.3, 0.9, 0.4] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        <motion.path
          d="M 320 0 L 320 160 L 400 240 L 540 240"
          fill="none"
          stroke="#2563EB"
          strokeWidth="1.5"
          opacity="0.6"
          strokeDasharray="6 4"
          animate={{ strokeDashoffset: [-50, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        <motion.path
          d="M 1120 900 L 1120 740 L 1040 660 L 900 660"
          fill="none"
          stroke="#10B981"
          strokeWidth="1.5"
          opacity="0.6"
          strokeDasharray="6 4"
          animate={{ strokeDashoffset: [0, -50] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Solder Vias / Micro Nodes */}
        {[
          { cx: 420, cy: 260 },
          { cx: 510, cy: 370 },
          { cx: 390, cy: 150 },
          { cx: 150, cy: 350 },
          { cx: 1020, cy: 300 },
          { cx: 920, cy: 420 },
          { cx: 1040, cy: 170 },
          { cx: 900, cy: 660 },
        ].map((via, idx) => (
          <g key={idx}>
            <circle
              cx={via.cx}
              cy={via.cy}
              r="4.5"
              fill="var(--bg-primary, #0B0F17)"
              stroke="var(--accent-blue, #2563EB)"
              strokeWidth="1.5"
            />
            <motion.circle
              cx={via.cx}
              cy={via.cy}
              r={2}
              fill={idx % 2 === 0 ? '#2563EB' : '#10B981'}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2 + (idx % 3), repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>
        ))}

        {/* Signal Current Pulses (Moving Photons) */}
        <motion.circle
          cx={0}
          cy={240}
          r={3}
          fill="#38BDF8"
          filter="url(#pcb-glow)"
          animate={{
            cx: [0, 210, 290, 460, 510],
            cy: [240, 240, 320, 320, 370],
            opacity: [0, 1, 1, 1, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.circle
          cx={1440}
          cy={280}
          r={3}
          fill="#34D399"
          filter="url(#pcb-glow)"
          animate={{
            cx: [1440, 1230, 1150, 980, 920],
            cy: [280, 280, 360, 360, 420],
            opacity: [0, 1, 1, 1, 0],
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </svg>

      {/* Corner Precision CAD Crosshairs (Desktop Only) */}
      {showTelemetry && (
        <div className="telemetry-crosshairs-group">
          <div
            style={{
              position: 'absolute',
              top: '1.25rem',
              left: '1.25rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '10px',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              opacity: 0.55,
              userSelect: 'none',
            }}
          >
            <span style={{ color: '#2563EB', fontWeight: 700 }}>+</span> LOC_01 // 34.05°N
          </div>
          <div
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '10px',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              opacity: 0.55,
              userSelect: 'none',
              textAlign: 'right',
            }}
          >
            ENC_256 // AES-GCM <span style={{ color: '#10B981', fontWeight: 700 }}>+</span>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '1.25rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '10px',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              opacity: 0.55,
              userSelect: 'none',
            }}
          >
            <span style={{ color: '#2563EB', fontWeight: 700 }}>+</span> BUS_FREQ // 2.4GHz
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '1.25rem',
              right: '1.25rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '10px',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              opacity: 0.55,
              userSelect: 'none',
              textAlign: 'right',
            }}
          >
            IPC-A-610 // CLASS-3 <span style={{ color: '#10B981', fontWeight: 700 }}>+</span>
          </div>
        </div>
      )}

      {/* Radial Vignette Mask */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at center, transparent 30%, var(--bg-primary, #0B0F17) 85%)',
        }}
      />

      <style>{`
        @media (max-width: 768px) {
          .telemetry-crosshairs-group {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(CircuitBackground);
