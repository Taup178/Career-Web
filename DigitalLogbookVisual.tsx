import React, { useState } from 'react';

const views = ['Kanban', 'Calendar', 'Timeline'] as const;
const entries = [
  { title: 'Architecture plan', detail: 'Service boundaries', status: 'Up Next' },
  { title: 'Container setup', detail: 'Docker & Compose', status: 'In Motion' },
  { title: 'Release checklist', detail: 'Deployment notes', status: 'Done & Dusted' },
];

export default function DigitalLogbookVisual() {
  const [view, setView] = useState<typeof views[number]>('Kanban');

  return <div className="logbook-visual">
    <div className="logbook-window"><span aria-hidden="true"><i /><i /><i /></span><small>digital-logbook / workspace</small></div>
    <div className="logbook-canvas">
      <div className="logbook-heading"><span>CODACAINE / DIGITAL LOGBOOK</span><strong>A place for progress.</strong><p>Projects, plans and everything in between.</p></div>
      <div className="logbook-view-switch" role="group" aria-label="Digital Logbook preview view">
        {views.map(option => <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)}>{option}</button>)}
      </div>
      <div className="logbook-demo" aria-label={`${view} concept preview`}>
        {view === 'Kanban' && <div className="logbook-board">{entries.map((entry, index) => <div className="logbook-column" key={entry.title}>
          <div className="logbook-column-title"><i /><span>{entry.status}</span></div>
          <div className="logbook-entry"><span>0{index + 1}</span><strong>{entry.title}</strong><small>{entry.detail}</small><i aria-hidden="true" /></div>
        </div>)}</div>}
        {view === 'Calendar' && <div className="logbook-calendar">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => <div key={day}>
          <span>{day}</span><strong>{String(index + 12).padStart(2, '0')}</strong>
          {index % 2 === 0 && <small>{['Plan services', 'Build images', 'Review release'][index / 2]}</small>}
        </div>)}</div>}
        {view === 'Timeline' && <div className="logbook-timeline">{['Architecture', 'Containers', 'Deployment'].map((label, index) => <div key={label}>
          <span>{label}</span><div><i style={{ gridColumn: `${index * 2 + 1} / span 3` }} /></div>
        </div>)}</div>}
      </div>
      <div className="logbook-system"><span>REACT</span><i aria-hidden="true">→</i><span>GATEWAY</span><i aria-hidden="true">→</i><span>4 SERVICES</span><i aria-hidden="true">→</i><span>SUPABASE</span></div>
      <p className="logbook-preview-note">Illustrative preview · sample entries</p>
    </div>
  </div>;
}
