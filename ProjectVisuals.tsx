import React, { useState } from 'react';
import ProjectPreview, { PreviewIcon } from './ProjectPreview';

const services = [
  { icon: 'auth', name: 'Identity', route: '/auth', detail: 'Firebase authentication protects access to the platform.' },
  { icon: 'pay', name: 'Payments', route: '/payments', detail: 'Payment workflows run in their own focused service.' },
  { icon: 'meet', name: 'Meetings', route: '/meetings', detail: 'A dedicated service coordinates community meetings.' },
  { icon: 'data', name: 'Analytics', route: '/analytics', detail: 'Platform reporting is handled independently.' },
  { icon: 'core', name: 'Management', route: '/stockvel', detail: 'Core workflows bring community finance together.' },
];

export function StockvelVisual() {
  const [selected, setSelected] = useState(0);
  const service = services[selected];
  const route = `M250 178 V207 Q250 219 ${selected < 2 ? 238 : selected > 2 ? 262 : 250} 219 H${50 + selected * 100} V253`;

  return <ProjectPreview className="architecture-card pv-stockvel" label="Interactive Stockvel service architecture">
    <div className="preview-chrome"><span><i /> Service architecture</span><small>01 / SYSTEM</small></div>
    <div className="system-diagram">
      <svg className="system-connections" viewBox="0 0 500 320" fill="none" aria-hidden="true">
        <path className="connection-base" d="M250 80V125M250 178V219M50 253V219H450V253M150 219V253M250 219V253M350 219V253" />
        <path className="connection-active" d="M250 80V125" />
        <path key={selected} className="connection-active connection-route" d={route} />
        <path className="connection-packet" d="M250 80V125" pathLength="100" />
        <path key={`packet-${selected}`} className="connection-packet" d={route} pathLength="100" />
        <circle cx="250" cy="219" r="3" className="connection-junction" />
      </svg>
      <div className="system-client"><PreviewIcon name="client" /><span>React client</span><i /></div>
      <div className="system-gateway"><PreviewIcon name="gateway" /><div><small>ROUTING LAYER</small><strong>API gateway</strong></div><span>↗</span></div>
      <div className="system-services" role="group" aria-label="Explore services">{services.map((item, index) => <button key={item.name} type="button" className={selected === index ? 'selected' : ''} onClick={() => setSelected(index)} aria-pressed={selected === index}>
        <span className="service-symbol"><PreviewIcon name={item.icon} /><i /></span><strong>{item.name}</strong>
      </button>)}</div>
    </div>
    <div className="preview-inspector" aria-live="polite"><div className="inspector-copy" key={selected}><span className="inspector-label">{service.route}</span><p>{service.detail}</p></div><PreviewIcon name={service.icon} /></div>
    <div className="preview-bottom"><span>5 independent services</span><span>Containerized delivery <i /></span></div>
  </ProjectPreview>;
}

const stages = [
  { icon: 'provision', label: 'Provision', title: 'Infrastructure as code', tool: 'Terraform + ARM', file: 'infrastructure/main.tf', detail: 'Repeatable Azure environments, defined in code.', lines: ['resource "azurerm_resource_group" "app" {', '  name     = "voting-app"', '  location = "South Africa North"', '}'] },
  { icon: 'package', label: 'Package', title: 'Containers & Compose', tool: 'Docker + Compose', file: 'compose.yaml', detail: 'Services and dependencies, packaged together.', lines: ['services:', '  vote:   { build: ./vote }', '  redis:  { image: redis:alpine }', '  db:     { image: postgres:15 }'] },
  { icon: 'automate', label: 'Automate', title: 'CI/CD workflows', tool: 'Azure DevOps + ACR', file: 'azure-pipelines.yml', detail: 'Build images, publish to ACR, update manifests.', lines: ['stages:', '  - stage: Build', '  - stage: PushToACR', '  - stage: UpdateManifests'] },
  { icon: 'deploy', label: 'Deploy', title: 'Kubernetes & GitOps', tool: 'AKS + ArgoCD', file: 'k8s/deployment.yaml', detail: 'Declarative workloads with GitOps synchronization.', lines: ['apiVersion: apps/v1', 'kind: Deployment', 'metadata:', '  name: voting-app'] },
];

export function DevOpsVisual() {
  const [step, setStep] = useState(0);
  const stage = stages[step];

  return <ProjectPreview className="azure-visual pv-devops" label="Interactive DevOps delivery workflow">
    <div className="preview-chrome"><span><i /> Delivery workflow</span><small>02 / PIPELINE</small></div>
    <div className="delivery-map">
      <div className="delivery-track" aria-hidden="true"><i style={{ width: `${step / 3 * 100}%` }} /><b /></div>
      <div className="delivery-nodes" role="group" aria-label="Explore delivery stages">{stages.map((item, index) => <button type="button" key={item.label} onClick={() => setStep(index)} aria-pressed={step === index} className={index < step ? 'is-complete' : ''}>
        <span className="delivery-node"><PreviewIcon name={item.icon} /><i /></span><small>0{index + 1}</small><strong>{item.label}</strong>
      </button>)}</div>
      <div className="delivery-platform" aria-hidden="true"><span /><span /><span /></div>
    </div>
    <div className="delivery-code" aria-label="Illustrative configuration">
      <div className="code-title"><span key={stage.file}>{stage.file}</span><small>EXAMPLE</small></div>
      <div key={step} className="code-lines">{stage.lines.map((line, index) => <div key={index}><span>{String(index + 1).padStart(2, '0')}</span><code>{line}</code></div>)}</div>
    </div>
    <div className="delivery-detail" aria-live="polite"><div key={step}><small>{stage.tool}</small><strong>{stage.title}</strong><p>{stage.detail}</p></div><span className="delivery-count">0{step + 1}<i> / 04</i></span></div>
  </ProjectPreview>;
}
