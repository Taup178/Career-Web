import React, { useEffect, useRef } from 'react';

/** Light follows the pointer; ambient motion stops outside the viewport. */
export default function ProjectPreview({ className, label, children }: {
  className: string;
  label: string;
  children: React.ReactNode;
}) {
  const surface = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = surface.current;
    if (!element) return;
    let visible = true;
    const sync = () => { element.dataset.active = String(visible && !document.hidden); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { rootMargin: '40px' });
    observer.observe(element);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return <div ref={surface} className={`project-preview ${className}`} role="group" aria-label={label} data-active="true"
    onPointerMove={event => {
      if (event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      if (event.currentTarget.closest('.motion-paused') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      event.currentTarget.style.setProperty('--pointer-x', `${x * 100}%`);
      event.currentTarget.style.setProperty('--pointer-y', `${y * 100}%`);
      event.currentTarget.style.setProperty('--scene-x', `${(x - .5) * -12}px`);
      event.currentTarget.style.setProperty('--scene-y', `${(y - .5) * -8}px`);
    }}
    onPointerLeave={event => {
      event.currentTarget.style.removeProperty('--pointer-x');
      event.currentTarget.style.removeProperty('--pointer-y');
      event.currentTarget.style.removeProperty('--scene-x');
      event.currentTarget.style.removeProperty('--scene-y');
    }}>
    {children}
  </div>;
}

export function PreviewIcon({ name, className = '' }: { name: string; className?: string }) {
  const paths: Record<string, string> = {
    client: 'M4 4h16v12H4zM8 21h8m-4-5v5M4 8h16',
    gateway: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
    auth: 'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Zm-4 9 3 3 5-6',
    pay: 'M4 5h16v14H4zM4 10h16m-5 5h2',
    meet: 'M5 5h14v16H5zM8 3v4m8-4v4M5 11h14m-10 4h2m2 3h2',
    data: 'M4 20h17M7 16v-5m5 5V5m5 11V8',
    core: 'M9 3h6l1 4 4 1v8l-4 1-1 4H9l-1-4-4-1V8l4-1 1-4Zm0 9a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z',
    provision: 'm12 3 9 5v9l-9 5-9-5V8l9-5Zm0 10 9-5M12 13 3 8m9 5v9',
    package: 'M4 8h16v13H4zM3 3h18v5H3zM9 12h6',
    automate: 'm13 2-9 12h7l-1 8 10-13h-7l1-7Z',
    deploy: 'M12 3v12m-4-8 4-4 4 4M5 13v7h14v-7',
    check: 'm5 12 4 4L19 6',
    arrow: 'M5 12h14m-5-5 5 5-5 5',
  };
  return <svg className={`preview-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.gateway} /></svg>;
}
