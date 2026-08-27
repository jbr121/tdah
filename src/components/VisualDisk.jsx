import React from 'react'

export default function VisualDisk({ progress = 1, label, caption, size = 260 }) {
  const clamped = Math.max(0, Math.min(1, progress))
  const innerSize = Math.max(36, Math.floor(size * clamped))
  const outerStyle = {
    width: size,
    height: size,
    borderRadius: '9999px',
    background: 'radial-gradient(ellipse at center, rgba(143,169,143,0.14), transparent 60%), #141417',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  }
  const diskStyle = {
    width: innerSize,
    height: innerSize,
    borderRadius: '9999px',
    background: `conic-gradient(#8FA98F ${clamped * 360}deg, rgba(255,255,255,0.03) 0deg)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'width 0.25s linear, height 0.25s linear, background 0.25s linear',
  }

  return (
    <div style={outerStyle} aria-hidden>
      <div style={diskStyle}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-cream)', fontVariantNumeric: 'tabular-nums', fontSize: size > 200 ? 48 : 20 }}>
            {label}
          </p>
          {caption && <p style={{ margin: 0, color: 'var(--color-mute)', fontSize: 13 }}>{caption}</p>}
        </div>
      </div>
    </div>
  )
}

