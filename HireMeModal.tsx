import React, { useState } from 'react';
import Modal from './Modal';
import { profile, projects } from './portfolio';

export default function HireMeModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState('');
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied('Email copied'); }
    catch { setCopied('Select and copy the address below'); }
  };
  return <Modal open onClose={onClose} label="30-second recruiter brief" className="briefing-layer">
    <button className="briefing-backdrop" onClick={onClose} aria-label="Close brief" tabIndex={-1} />
    <article className="recruiter-brief">
      <header><span className="section-number">CANDIDATE / 30-SECOND BRIEF</span><button onClick={onClose} aria-label="Close recruiter brief">×</button></header>
      <div className="brief-identity"><span className="brand-mark">ZM</span><div><h2>{profile.name}</h2><p>Junior DevOps · Computer Science finalist · Johannesburg</p></div></div>
      <p className="brief-intro">Building practical experience in reliable delivery, cloud infrastructure and interactive software.</p>
      <div className="brief-columns">
        <section><h3>What I bring</h3><ul><li>Containerized microservices and automated build/deployment workflows.</li><li>Hands-on learning with Azure, Kubernetes, Terraform and GitOps.</li><li>Computer Science foundations, plus a team-built 3D browser game.</li></ul></section>
        <section><h3>Inspect the work</h3>{projects.map(project => <a key={project.id} href={project.source} target="_blank" rel="noreferrer"><strong>{project.title} ↗</strong><span>{project.category}</span></a>)}</section>
      </div>
      <div className="brief-education"><small>EDUCATION</small><strong>BSc Computer Science</strong><span>University of the Witwatersrand · final-year student</span></div>
      <div className="brief-contact"><a href={'mailto:' + profile.email}>{profile.email} ↗</a><button onClick={copy}>Copy email</button><span role="status">{copied}</span></div>
      <p className="term-tip">Open to junior DevOps roles, graduate opportunities and collaboration.</p>
    </article>
  </Modal>;
}
