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

export function AzureVisual() {
  const [step, setStep] = useState(0);
  const stages = [
    ['01', 'BUILD', 'Docker image', 'Package the application and its dependencies into a reusable container image.'],
    ['02', 'STORE', 'Azure registry', 'Push the image to Azure Container Registry so it can be used by the deployment.'],
    ['03', 'DECLARE', 'Kubernetes', 'Describe the workload with Kubernetes deployment and service manifests.'],
    ['04', 'RECONCILE', 'ArgoCD', 'Explore how a GitOps controller reconciles the cluster with the declared state in Git.'],
  ];
  return <div className="azure-visual">
    <div className="arch-top"><span>AZURE / GITOPS LAB</span><span>LEARNING MAP</span></div>
    <div className="azure-orbit" aria-hidden="true"><i /><i /><span>△</span></div>
    <div className="azure-stages">{stages.map(([number, label, title], index) => <button key={label} onClick={() => setStep(index)} aria-pressed={step === index}><small>{number} / {label}</small><strong>{title}</strong></button>)}</div>
    <p aria-live="polite">{stages[step][3]}</p>
  </div>;
}
