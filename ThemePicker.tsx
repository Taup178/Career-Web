import React from 'react';
import { isTheme } from './portfolio';
import type { Theme } from './portfolio';

export default function ThemePicker({ theme, onChange }: {
  theme: Theme;
  onChange: (theme: Theme) => void;
}) {
  return <label className="theme-picker">
    <span>Theme</span>
    <select aria-label="Color theme" value={theme} onChange={event => {
      if (isTheme(event.target.value)) onChange(event.target.value);
    }}>
      <option value="orbit">Orbit</option>
      <option value="nebula">Nebula</option>
      <option value="solar">Solar</option>
    </select>
  </label>;
}
