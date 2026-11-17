import React, { useEffect, useRef } from 'react';
import type { Theme } from './portfolio';

export default function AppearanceMenu({ theme, motion, onThemeChange, onMotionChange }: {
  theme: Theme;
  motion: boolean;
  onThemeChange: (theme: Theme) => void;
  onMotionChange: (motion: boolean) => void;
}) {
  const menu = useRef<HTMLDetailsElement>(null);

  const close = (restoreFocus = false) => {
    if (!menu.current?.open) return;
    menu.current.open = false;
    if (restoreFocus) menu.current.querySelector('summary')?.focus({ preventScroll: true });
  };

  useEffect(() => {
    const dismissOutside = (event: Event) => {
      if (event.target instanceof window.Node && !menu.current?.contains(event.target)) close();
    };
    const dismissEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menu.current?.open) {
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('focusin', dismissOutside);
    document.addEventListener('keydown', dismissEscape);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('focusin', dismissOutside);
      document.removeEventListener('keydown', dismissEscape);
    };
  }, []);

  return <details ref={menu} className="appearance-menu">
    <summary>Appearance <span aria-hidden="true">✦</span></summary>
    <div className="appearance-options">
      <div className="appearance-heading"><span>COLOR THEME</span><button type="button" className="appearance-close" aria-label="Close appearance settings" onClick={() => close(true)}>×</button></div>
      <div role="group" aria-label="Color theme">{(['orbit', 'nebula', 'solar'] as const).map(option => <button type="button" key={option} aria-pressed={theme === option} onClick={() => { onThemeChange(option); close(true); }}><i className={`swatch ${option}`} />{option}</button>)}</div>
      <button type="button" className="motion-setting" onClick={() => { onMotionChange(!motion); close(true); }} aria-pressed={!motion}>{motion ? 'Pause animations' : 'Resume animations'}</button>
    </div>
  </details>;
}
