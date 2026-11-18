import React, { useState } from 'react';

const services = [
  ['AUTH', 'Identity', 'Firebase Authentication supplies identity for protected service routes.'],
  ['PAY', 'Payments', 'A dedicated service separates payment behavior from the rest of the platform.'],
  ['MEET', 'Meetings', 'Meeting coordination is isolated behind the API gateway.'],
  ['DATA', 'Analytics', 'A focused analytics service handles platform reporting.'],
  ['CORE', 'Management', 'Stockvel management contains the core community finance workflows.'],
];

export function StockvelVisual() {
  const [selected, setSelected] = useState(0);
  return <div className="architecture-card">
    <div className="arch-top"><span>STOCKVEL-PRO / SYSTEM MAP</span><span className="arch-live">EXPLORE</span></div>
    <div className="arch-client"><span>◫</span><div><small>INTERFACE</small><strong>React client</strong></div></div>
    <div className="arch-flow"><i /><i /><i /></div>
    <div className="gateway"><small>ENTRY POINT</small><strong>API GATEWAY</strong><span>routing · services</span></div>
    <div className="service-grid">{services.map(([code, name], index) => <div key={code} className={selected === index ? 'selected' : ''}><button onClick={() => setSelected(index)} aria-pressed={selected === index}><span>{code}</span><strong>{name}</strong><i /></button></div>)}</div>
    <p className="service-detail" aria-live="polite">{services[selected][2]}</p>
    <div className="arch-foundation"><span>FIREBASE</span><span>DOCKER</span><span>KUBERNETES</span><span>RENDER</span></div>
  </div>;
}

export function DevOpsVisual() {
  const [step, setStep] = useState(0);
  const stages = [
    ['01', 'PROVISION', 'Infrastructure as code', 'Terraform modules and matching ARM templates define Azure infrastructure, including resources for the voting application.'],
    ['02', 'PACKAGE', 'Containers & Compose', 'Dockerfiles and Compose definitions connect a voting app with Python, Node.js and .NET services, Redis and PostgreSQL.'],
    ['03', 'AUTOMATE', 'CI/CD workflows', 'The deployment guide documents Azure Repos and a multi-stage Azure DevOps pipeline that builds images, pushes to ACR and updates Git manifests.'],
    ['04', 'DEPLOY', 'Kubernetes & GitOps', 'Kubernetes examples cover deployments, services, configuration and ingress. The guide explains AKS setup and ArgoCD synchronization.'],
  ];
  return <div className="azure-visual">
    <div className="arch-top"><span>DEVOPS PRACTICES</span><span>PRACTICE MAP</span></div>
    <div className="azure-orbit" aria-hidden="true"><i /><i /><span>△</span></div>
    <div className="azure-stages">{stages.map(([number, label, title], index) => <button key={label} onClick={() => setStep(index)} aria-pressed={step === index}><small>{number} / {label}</small><strong>{title}</strong></button>)}</div>
    <p aria-live="polite">{stages[step][3]}</p>
  </div>;
}
