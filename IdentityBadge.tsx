import React, { useRef, useState } from 'react';

type BadgePosition = { x: number; y: number; rotation: number; tilt: number };

const IdentityBadge: React.FC = () => {
  const pointerStart = useRef({ x: 0, y: 0 });
  const rig = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<BadgePosition>({ x: 0, y: 0, rotation: -5, tilt: 0 });
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const scale = (rig.current?.getBoundingClientRect().width || 270) / 270;
    pointerStart.current = { x: event.clientX / scale - position.x, y: event.clientY / scale - position.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const scale = (rig.current?.getBoundingClientRect().width || 270) / 270;
    const x = Math.max(-75, Math.min(115, event.clientX / scale - pointerStart.current.x));
    const y = Math.max(-30, Math.min(68, event.clientY / scale - pointerStart.current.y));
    setPosition({ x, y, rotation: Math.max(-18, Math.min(18, x * 0.12)), tilt: Math.max(-8, Math.min(8, -y * 0.12)) });
  };

  const release = () => {
    setDragging(false);
    setPosition({ x: 0, y: 0, rotation: -5, tilt: 0 });
  };

  return (
    <div ref={rig} className="identity-rig" aria-label="Interactive Zamokuhle Maziya identity badge">
      <div className={`badge-suspension ${dragging ? 'is-dragging' : ''}`}>
        <svg className="identity-rope" viewBox="0 0 270 300" width="270" height="300" aria-hidden="true">
          <defs>
            <linearGradient id="strap" x1="0" x2="1"><stop stopColor="#222925" /><stop offset=".5" stopColor="#59615b" /><stop offset="1" stopColor="#171c1a" /></linearGradient>
          </defs>
          <path d={`M135 0 C 127 40, ${126 + position.x * .6} 70, ${135 + position.x} ${96 + position.y}`} fill="none" stroke="rgba(0,0,0,.45)" strokeWidth="13" strokeLinecap="round" />
          <path d={`M135 0 C 127 40, ${126 + position.x * .6} 70, ${135 + position.x} ${96 + position.y}`} fill="none" stroke="url(#strap)" strokeWidth="9" strokeLinecap="round" />
          <path d={`M135 0 C 127 40, ${126 + position.x * .6} 70, ${135 + position.x} ${96 + position.y}`} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1" />
        </svg>
        <div
          className={`identity-badge ${dragging ? 'dragging' : ''}`}
          style={{
            '--badge-x': `${position.x}px`,
            '--badge-y': `${position.y}px`,
            '--badge-r': `${position.rotation}deg`,
            '--badge-rx': `${position.tilt}deg`,
          } as React.CSSProperties}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={release}
          onPointerCancel={release}
          onLostPointerCapture={release}
          role="button"
          tabIndex={0}
          onKeyDown={event => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
              event.preventDefault();
              setPosition(previous => ({ ...previous, x: Math.max(-75, Math.min(115, previous.x + (event.key === 'ArrowLeft' ? -12 : event.key === 'ArrowRight' ? 12 : 0))), y: Math.max(-30, Math.min(68, previous.y + (event.key === 'ArrowUp' ? -10 : event.key === 'ArrowDown' ? 10 : 0))) }));
            }
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); release(); }
          }}
          aria-label="Move identity badge: drag or use arrow keys. Enter resets."
        >
          <div className="badge-clip" />
          <div className="badge-slot" />
          <div className="badge-inner">
            <div className="badge-holo" />
            <div className="badge-top"><span>PERSONAL / EXPLORER PASS</span><span>ZM—024</span></div>
            <div className="badge-avatar">ZM</div>
            <div className="badge-copy"><strong>Zamokuhle</strong><span>MAZIYA</span><small>DEVOPS · COMPUTER SCIENCE</small></div>
            <div className="badge-bottom"><span>AUTHORIZED TO BUILD BETTER</span><div className="badge-code" /></div>
          </div>
        </div>
      </div>
      <span className="badge-hint">↖ Drag me. I’m attached.</span>
    </div>
  );
};

export default IdentityBadge;
