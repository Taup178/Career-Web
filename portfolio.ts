export const profile = {
  name: 'Zamokuhle Maziya',
  email: 'zamokuhlemaziya944@gmail.com',
  location: 'Johannesburg, South Africa',
  careerFocus: 'I’m focused on DevOps and Cloud roles, and I’m also open to other software engineering opportunities.',
  github: 'https://github.com/Zamam03',
  linkedin: 'https://linkedin.com/in/zamokuhle-maziya',
};

export const projects = [
  {
    id: 'stockvel', title: 'Stockvel-Pro', category: 'Cloud microservices',
    description: 'An API gateway and five services for authentication, payments, meetings, analytics and stockvel management, with containerized environments and automated delivery.',
    tools: ['React', 'Node.js', 'Express', 'Firebase', 'Docker', 'Kubernetes', 'GitHub Actions', 'Render'],
    source: 'https://github.com/Zamam03/Stockvel-Microservice',
  },
  {
    id: 'azure', title: 'DevOps Practices', category: 'Infrastructure as code · CI/CD',
    description: 'A hands-on DevOps practice repository covering Azure infrastructure as code, Docker and Compose, Kubernetes deployments, and documented CI/CD and GitOps workflows.',
    tools: ['Azure', 'Terraform', 'ARM templates', 'Docker', 'Docker Compose', 'Azure DevOps', 'ACR', 'Kubernetes / AKS', 'ArgoCD'],
    source: 'https://github.com/Zamam03/Microsoft-Azure',
  },
  {
    id: 'logbook', title: 'Digital Logbook', category: 'Planning platform · team project',
    description: 'A team-built planning app for organising projects and entries through Kanban, calendar and timeline views, with an API gateway and four backend services.',
    contribution: 'Architecture planning, containerization and deployments.',
    tools: ['React', 'TypeScript', 'Vite', 'Node.js', 'Express', 'Supabase', 'PostgreSQL', 'Docker', 'Docker Compose', 'Render'],
    source: 'https://github.com/logb945/Digital-Logbook',
    live: 'https://digital-logbook-dhtq.onrender.com',
    liveLabel: 'Open app',
  },
  {
    id: 'thesis', title: 'Thesis of the Dead', category: '3D browser game · team project',
    description: 'Three chapters of survival, checkpointed puzzles and combat, following a student through the Freshman Woods, Sophomore Room and a final encounter with the Dean.',
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
