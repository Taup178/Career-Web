export const profile = {
  name: 'Zamokuhle Maziya',
  email: 'zamokuhlemaziya944@gmail.com',
  location: 'Johannesburg, South Africa',
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
    id: 'azure', title: 'Azure & GitOps Lab', category: 'Continuous learning',
    description: 'Exploring container image builds, Azure Container Registry, Kubernetes manifests and GitOps delivery with ArgoCD.',
    tools: ['Azure', 'Docker', 'ACR', 'Kubernetes', 'ArgoCD'],
    source: 'https://github.com/Zamam03/Microsoft-Azure',
  },
  {
    id: 'thesis', title: 'Thesis of the Dead', category: '3D browser game · team project',
    description: 'Three chapters of survival, checkpointed puzzles and combat, following a student through the Freshman Woods, Sophomore Room and a final encounter with the Dean.',
    tools: ['JavaScript', 'Three.js', 'WebGL', 'GLSL', 'Vite', 'GLTF', 'Web Audio', 'Node.js tests'],
    source: 'https://github.com/Taup178/Thesis_of_the_dead',
    live: 'https://wmc.ms.wits.ac.za/students/sgroup3911/index.html',
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
