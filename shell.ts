// A browser-only portfolio shell. Commands never execute on a host machine.
import { projects, profile } from './portfolio.ts';

export const HOME = '/home/visitor';
export const ROOT = `${HOME}/Career-Web`;
const thesis = `${HOME}/Thesis_of_the_dead`;
export type ShellState = { cwd: string; history: string[]; unlocked: boolean; theme: string };
export type ShellResult = {
  text?: string; action?: string; cwd?: string; clear?: boolean;
  view?: 'help' | 'projects' | 'profile' | 'themes' | 'neofetch' | 'links';
  subject?: string;
};

export const manuals: Record<string, { title: string; commands: [string, string][] }> = {
  nav: { title: 'Find your way', commands: [
    ['home', 'Return to the opening scene'], ['open work', 'Browse all three projects'],
    ['open stockvel', 'Explore the microservices map'], ['open azure', 'Inspect the cloud learning lab'],
    ['open thesis', 'Inspect Thesis of the Dead'], ['open about', 'Education and background'],
    ['open stack', 'Technical capabilities'], ['open contact', 'Email and social links'],
    ['cd ../', 'Explore the virtual project folders'],
  ] },
  profile: { title: 'Meet the engineer', commands: [
    ['whoami', 'A short introduction'], ['get projects', 'Project index and links'],
    ['get skills', 'Technical toolkit'], ['get education', 'Academic background'],
    ['get contact', 'Ways to connect'], ['brief', 'The 30-second recruiter brief'],
    ['copy email', 'Copy the contact address'],
  ] },
  system: { title: 'Shell utilities', commands: [
    ['ls', 'List the current directory'], ['pwd', 'Print the working directory'],
    ['cat README.md', 'Read a virtual file'], ['tree', 'Show the project directory tree'],
    ['neofetch', 'Display the system identity'], ['status', 'Inspect this browser session'],
    ['date', 'Local system time'], ['history', 'Commands from this session'],
    ['echo Hello World', 'Print text, preserving case'], ['clear', 'Clear output · Ctrl+L'],
    ['exit', 'Return to the portfolio view'],
  ] },
  arcade: { title: 'Off-duty experiments', commands: [
    ['play bird', 'Space or tap to flap'], ['play snake', 'Arrow keys or touch controls'],
    ['play pacman', 'A classic maze challenge'], ['play thesis', 'Open the full 3D game in a new tab'],
    ['scores', 'Your locally stored arcade records'], ['fortune', 'A small transmission from mission control'],
  ] },
  themes: { title: 'Choose your atmosphere', commands: [
    ['theme orbit', 'Lime light · orbital control'], ['theme nebula', 'Violet and cyan · deep space'],
    ['theme solar', 'Amber light · solar station'], ['motion off', 'Pause decorative motion'],
    ['motion on', 'Resume decorative motion (respects your OS setting)'],
  ] },
};

const directories = [HOME, ROOT, thesis, ...['work', 'stack', 'about', 'play', 'contact'].map(x => `${ROOT}/${x}`)];
const files: Record<string, string> = {
  [`${ROOT}/README.md`]: 'ZM-OS / portfolio\n\nWelcome to a browser-only shell. Try help nav, neofetch or brief.\nNo commands touch your device.\n\nA signal is hiding in .mission. Try ls -a.',
  [`${ROOT}/.mission`]: 'CLASSIFIED TRANSMISSION\nCuriosity is a useful engineering skill.\nAccess phrase: sudo make coffee\nBonus channel: matrix',
  [`${ROOT}/contact.txt`]: `${profile.name}\n${profile.email}\n${profile.location}\n${profile.linkedin}\n${profile.github}`,
  [`${thesis}/README.md`]: `${projects.find(project => project.id === 'thesis')!.title}\n\n${projects.find(project => project.id === 'thesis')!.description}\n\nTools: ${projects.find(project => project.id === 'thesis')!.tools.join(', ')}\n\nType open thesis for the visual showcase or play thesis for the hosted game.\nThis virtual folder is a project summary, not access to the source filesystem.`,
  [`${thesis}/package.json`]: JSON.stringify({ name: 'thesis-of-the-dead', dependencies: { three: '^0.170.0' }, devDependencies: { vite: '^6.0.0' }, scripts: { dev: 'vite', build: 'vite build', test: 'node --test' } }, null, 2),
};

export function resolvePath(cwd: string, input: string) {
  const path = input.startsWith('~') ? HOME + input.slice(1) : input.startsWith('/') ? input : `${cwd}/${input}`;
  const parts: string[] = [];
  for (const part of path.split('/')) {
    if (part === '..') parts.pop();
    else if (part && part !== '.') parts.push(part);
  }
  return '/' + parts.join('/');
}

export function runShell(raw: string, state: ShellState): ShellResult {
  const input = raw.trim();
  const lower = input.toLowerCase().replace(/\s+/g, ' ');
  const tokens = lower.split(' ');
  const alias: Record<string, string> = { projects: 'get projects', skills: 'get skills', contact: 'get contact', education: 'get education', cls: 'clear', 'hire me': 'brief', 'sudo hire zamokuhle': 'brief', 'open projects': 'open work', 'cd work': 'open work', 'cd stack': 'open stack', 'cd about': 'open about', 'cd play': 'open play', 'cd contact': 'open contact' };
  if (Object.hasOwn(alias, lower)) return runShell(alias[lower], state);
  if (lower === 'clear') return { clear: true };
  if (lower === 'exit' || lower === 'logout') return { action: 'exit' };
  if (tokens[0] === 'help' || tokens[0] === 'man') {
    const group = tokens[1];
    if (!group || Object.hasOwn(manuals, group)) return { view: 'help', subject: group };
    return { text: `No manual group “${group}”. Choose nav, profile, system, arcade or themes.` };
  }
  if (lower === 'pwd') return { text: state.cwd };
  if (tokens[0] === 'cd') {
    const target = resolvePath(state.cwd, input.slice(2).trim() || '~');
    if (!directories.includes(target)) return { text: `cd: ${input.slice(3)}: No such directory. Try ls.` };
    return { cwd: target, action: target === thesis ? 'open thesis' : undefined };
  }
  if (tokens[0] === 'ls') {
    if (tokens.slice(1).some(x => !['-a', '-la', '-al', '-l'].includes(x))) return { text: 'Usage: ls [-a | -l | -la]' };
    const hidden = lower.includes('a');
    const entries = [...directories.filter(x => x !== state.cwd).map(x => [x, 'directory']), ...Object.keys(files).map(x => [x, 'file'])]
      .filter(([path]) => path.slice(0, path.lastIndexOf('/')) === state.cwd)
      .filter(([path]) => hidden || !path.split('/').at(-1)!.startsWith('.'));
    return { text: entries.map(([path, type]) => `${lower.includes('l') ? (type === 'directory' ? 'drwxr-xr-x  ' : '-rw-r--r--  ') : ''}${path.split('/').at(-1)}${type === 'directory' ? '/' : ''}`).join('\n') || '(empty virtual directory)' };
  }
  if (tokens[0] === 'cat') {
    const target = resolvePath(state.cwd, input.slice(3).trim());
    return { text: files[target] ?? `cat: ${input.slice(4)}: No such file. Try ls.` };
  }
  if (lower === 'tree') return { text: 'visitor/\n├── Career-Web/\n│   ├── work/\n│   ├── stack/\n│   ├── about/\n│   ├── play/\n│   ├── contact/\n│   ├── contact.txt\n│   └── README.md\n└── Thesis_of_the_dead/\n    ├── README.md\n    └── package.json' };
  if (tokens[0] === 'echo') return { text: input.slice(4).trimStart().replace(/^(["'])(.*)\1$/, '$2') };
  if (lower === 'history') return { text: [...state.history, input].map((x, i) => `${String(i + 1).padStart(3)}  ${x}`).join('\n') };
  if (lower === 'date') return { text: new Date().toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'long' }) };
  if (lower === 'uname -a') return { text: 'ZM-OS · browser portfolio shell · React / TypeScript / Vite\nA simulated shell, running entirely in your browser.' };
  if (lower === 'whoami') return { view: 'profile', subject: 'about' };
  if (lower === 'neofetch') return { view: 'neofetch' };
  if (lower === 'status' || lower === 'scores') return { action: lower };
  if (lower === 'brief') return { action: 'hire me', text: 'Opening the recruiter brief.' };
  if (lower === 'copy email') return { action: 'copy email' };
  if (lower === 'home') return { cwd: ROOT, action: 'home' };
  if (lower === 'get projects') return { view: 'projects', action: 'get projects' };
  if (['get skills', 'get education', 'get contact'].includes(lower)) return { view: 'profile', subject: lower.slice(4), action: lower };
  if (tokens[0] === 'open') {
    const name = tokens[1];
    if (['work', 'stack', 'about', 'contact', 'play'].includes(name)) return { cwd: `${ROOT}/${name}`, action: lower, text: `Opened the ${name} section in Portfolio view.` };
    if (projects.some(p => p.id === name)) return { action: lower, view: 'projects', subject: name };
  }
  if (tokens[0] === 'theme') {
    if (!tokens[1]) return { view: 'themes' };
    if (['orbit', 'nebula', 'solar'].includes(tokens[1])) return { action: lower, text: `Atmosphere: ${tokens[1]}. Preference saved on this device.` };
    return { text: 'Available themes: orbit, nebula, solar. Try help themes.' };
  }
  if (['motion off', 'motion on'].includes(lower)) return { action: lower, text: lower === 'motion off' ? 'Decorative motion paused.' : 'Decorative motion enabled, subject to your system preference.' };
  if (['play bird', 'play snake', 'play pacman'].includes(lower)) return { action: lower };
  if (lower === 'play thesis') return { view: 'links', subject: 'thesis', text: 'Launch the hosted game below. Best played on a desktop with keyboard and mouse.' };
  if (lower === 'matrix') return state.unlocked ? { action: 'matrix' } : { text: 'Access locked. Earn an arcade milestone, or inspect the hidden mission file.' };
  if (lower === 'sudo make coffee') return { action: 'unlock', text: '  ( (\n   ) )\n .----.\n |    |]  Coffee compiled successfully.\n  `--’\n\nClassified channel unlocked. Try matrix.' };
  if (lower === 'fortune') return { text: ['Automate the repetition. Keep the curiosity.', 'A good log message is a gift to your future self.', 'Small, reversible changes make brave experiments possible.'][Math.floor(Math.random() * 3)] };
  if (lower === 'sudo' || lower.startsWith('sudo ')) return { text: 'No root access in this browser shell. Curiosity is welcome, though. Try ls -a.' };
  if (['rm', 'curl', 'wget', 'ssh', 'npm', 'apt'].includes(tokens[0])) return { text: 'This portfolio simulates a small Linux shell. It does not execute programs or change files on your device. Try help system.' };
  const suggestion = commandNames.find(x => x.startsWith(tokens[0]));
  return { text: `bash: ${input}: command not found\n${suggestion ? `Try “${suggestion}” or help.` : 'Type help to browse the command groups.'}` };
}

export const commandNames = [...new Set([
  'help', ...Object.keys(manuals).map(x => `help ${x}`),
  ...Object.values(manuals).flatMap(x => x.commands.map(([cmd]) => cmd)),
  'ls -a', 'ls -la', 'cd Thesis_of_the_dead', 'cd Career-Web', 'cd ~', 'cd ..', 'cd ../',
  'cat contact.txt', 'cat .mission', 'cat package.json', 'uname -a', 'theme',
])];

export function completeCommand(input: string, cwd: string) {
  if (input.startsWith('cd ') || input.startsWith('cat ')) {
    const cmd = input.slice(0, input.indexOf(' '));
    const partial = input.slice(cmd.length + 1);
    const parent = partial.includes('/') ? partial.slice(0, partial.lastIndexOf('/') + 1) : '';
    const parentPath = resolvePath(cwd, parent || '.');
    const candidates = cmd === 'cd' ? directories : Object.keys(files);
    return candidates.filter(x => x.slice(0, x.lastIndexOf('/')) === parentPath)
      .map(x => `${cmd} ${parent}${x.split('/').at(-1)}`)
      .filter(x => x.toLowerCase().startsWith(input.toLowerCase()));
  }
  return commandNames.filter(x => x.toLowerCase().startsWith(input.toLowerCase()));
}
