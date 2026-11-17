import React from 'react';

export default function ViewSwitch({ active, onChange }: {
  active: 'portfolio' | 'terminal';
  onChange: (view: 'portfolio' | 'terminal') => void;
}) {
  return <div className="view-switch" role="group" aria-label="View mode">
    <button type="button" data-view="portfolio" aria-pressed={active === 'portfolio'} onClick={() => onChange('portfolio')}>
      <span aria-hidden="true">▦</span> Portfolio
    </button>
    <button type="button" data-view="terminal" aria-pressed={active === 'terminal'} onClick={() => onChange('terminal')} title="Terminal · Ctrl / ⌘ K">
      <span aria-hidden="true">&gt;_</span> Terminal
    </button>
  </div>;
}
