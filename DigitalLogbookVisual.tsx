import React, { useState } from 'react';
import ProjectPreview, { PreviewIcon } from './ProjectPreview';

const views = ['Kanban', 'Calendar', 'Timeline'] as const;
const statuses = ['Planned', 'In progress', 'Complete'];
const entries = [
  { title: 'Architecture plan', detail: 'Service boundaries', tag: 'Design', initials: 'ZM', day: 12 },
  { title: 'Container setup', detail: 'Docker & Compose', tag: 'Build', initials: 'ZM', day: 14 },
  { title: 'Release checklist', detail: 'Deployment notes', tag: 'Release', initials: 'ZM', day: 16 },
];

export default function DigitalLogbookVisual() {
  const [view, setView] = useState<typeof views[number]>('Kanban');
  const [selected, setSelected] = useState(0);
  const [progress, setProgress] = useState([0, 1, 2]);
  const entry = entries[selected];
  const slots = progress.map((status, index) => progress.slice(0, index).filter(value => value === status).length);
  const advance = () => setProgress(previous => previous.map((status, index) => index === selected ? (status + 1) % 3 : status));

  return <ProjectPreview className="logbook-visual pv-logbook" label="Interactive Digital Logbook concept">
    <div className="logbook-window"><span aria-hidden="true"><i /><i /><i /></span><small>digital logbook</small><span className="logbook-avatar" aria-hidden="true">ZM</span></div>
    <div className="logbook-canvas">
      <div className="logbook-heading"><span>WORKSPACE / ENGINEERING</span><strong>Release workspace<span>↗</span></strong></div>
      <div className="logbook-view-switch" role="group" aria-label="Digital Logbook preview view" style={{ '--view-index': views.indexOf(view) } as React.CSSProperties}>
        {views.map(option => <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)}>{option}</button>)}
      </div>
      <div className={`logbook-demo view-${view.toLowerCase()}`} aria-label={`${view} concept preview`}>
        {view === 'Kanban' && <div className="logbook-board" style={{ height: Math.max(196, 158 + Math.max(...slots) * 78) }}>
          {statuses.map((status, index) => <div className="logbook-column-title" key={status}><i /><span>{status}</span><b>{progress.filter(value => value === index).length}</b></div>)}
          {entries.map((item, index) => <button type="button" className="logbook-task" key={item.title} aria-pressed={selected === index} onClick={() => setSelected(index)} style={{ '--column': progress[index], '--slot': slots[index], '--task-color': ['#8b7965', '#b2764f', '#527c68'][progress[index]] } as React.CSSProperties}>
            <span className="task-tag">{item.tag}<i /></span><strong>{item.title}</strong><span className="task-meta"><small>DL–0{index + 1}</small><b>{item.initials}</b></span>
          </button>)}
        </div>}
        {view === 'Calendar' && <div className="logbook-calendar">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => {
          const task = entries.findIndex(item => item.day === index + 12);
          return <div key={day} className={task === selected ? 'is-selected' : ''}><span>{day}</span><strong>{index + 12}</strong><i aria-hidden="true" />
            {task >= 0 && <button type="button" onClick={() => setSelected(task)} aria-pressed={selected === task}><i />{entries[task].title}</button>}
          </div>;
        })}</div>}
        {view === 'Timeline' && <div className="logbook-timeline"><div className="timeline-dates"><span>THIS WEEK</span><div>{['M', 'T', 'W', 'T', 'F'].map((day, index) => <small key={index}>{day}</small>)}</div></div>{entries.map((item, index) => <button type="button" key={item.title} aria-pressed={selected === index} onClick={() => setSelected(index)}>
          <span>{item.tag}</span><div><i style={{ gridColumn: `${index + 1} / span 3` }}><span>{progress[index] === 2 ? '✓' : '·'}</span></i></div>
        </button>)}</div>}
      </div>
      <div className="logbook-selection"><div aria-live="polite"><small>SELECTED TASK</small><strong>{entry.title}</strong></div><button type="button" onClick={advance} aria-label={`Move ${entry.title} to ${statuses[(progress[selected] + 1) % 3]}`}>{statuses[(progress[selected] + 1) % 3]}<PreviewIcon name="arrow" /></button></div>
      <div className="logbook-bottom"><span>Interactive concept</span><span>{progress.filter(value => value === 2).length} / 3 complete<i><b style={{ width: `${progress.filter(value => value === 2).length / 3 * 100}%` }} /></i></span></div>
    </div>
  </ProjectPreview>;
}
