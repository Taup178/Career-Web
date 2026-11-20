export const profile = {
  name: 'Zamokuhle Maziya',
  email: 'zamokuhlemaziya944@gmail.com',
  location: 'Johannesburg, South Africa',
  careerFocus: 'Seeking junior and graduate roles in DevOps, cloud and software engineering.',
  github: 'https://github.com/Zamam03',
  linkedin: 'https://linkedin.com/in/zamokuhle-maziya',
};

export const projects = [
  {
    id: 'stockvel', title: 'Stockvel-Pro', category: 'Cloud microservices',
    description: 'A community finance platform with five microservices, containerized environments and automated delivery.',
    tools: ['React', 'Node.js', 'Express', 'Firebase', 'Docker', 'Kubernetes', 'GitHub Actions', 'Render'],
    source: 'https://github.com/Zamam03/Stockvel-Microservice',
  },
  {
    id: 'azure', title: 'DevOps Practices', category: 'Infrastructure as code · CI/CD',
    description: 'Azure infrastructure as code, containerized applications and Kubernetes deployments, with documented CI/CD and GitOps workflows.',
    tools: ['Azure', 'Terraform', 'ARM templates', 'Docker', 'Docker Compose', 'Azure DevOps', 'ACR', 'Kubernetes / AKS', 'ArgoCD'],
    source: 'https://github.com/Zamam03/Microsoft-Azure',
  },
  {
    id: 'logbook', title: 'Digital Logbook', category: 'Planning platform · team project',
    description: 'A shared planning workspace with Kanban, calendar and timeline views, backed by four services and Supabase.',
    contribution: 'Architecture planning, containerization and deployments.',
    tools: ['React', 'TypeScript', 'Vite', 'Node.js', 'Express', 'Supabase', 'PostgreSQL', 'Docker', 'Docker Compose', 'Render'],
    source: 'https://github.com/logb945/Digital-Logbook',
    live: 'https://digital-logbook-dhtq.onrender.com',
    liveLabel: 'Open app',
  },
  {
    id: 'thesis', title: 'Thesis of the Dead', category: '3D browser game · team project',
    description: 'Three chapters of survival, puzzles and combat, from Freshman Woods to a final encounter with the Dean.',
    tools: ['JavaScript', 'Three.js', 'WebGL', 'GLSL', 'Vite', 'GLTF', 'Web Audio', 'Node.js tests'],
    source: 'https://github.com/Taup178/Thesis_of_the_dead',
    live: 'https://wmc.ms.wits.ac.za/students/sgroup3911/index.html',
    liveLabel: 'Play live',
  },
] as const;

export type ProjectId = typeof projects[number]['id'];
export type Theme = 'orbit' | 'nebula' | 'solar';
export const isTheme = (value: unknown): value is Theme => ['orbit', 'nebula', 'solar'].includes(String(value));

export function readPreference(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
export function savePreference(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* Preferences are optional in private browsers. */ }
}
