import React, { useCallback, useEffect, useRef, useState } from 'react';
import { completeCommand, manuals, ROOT, runShell } from './shell';
import type { ShellResult } from './shell';
import { profile, projects } from './portfolio';

interface TerminalProps {
  onCommand: (command: string) => void;
  isMatrixCommandUnlocked: boolean;
  active: boolean;
  theme: string;
}
type Entry = { id: number; command?: string; cwd?: string; result: ShellResult };
const shortPath = (cwd: string) => cwd.replace('/home/visitor', '~');

export default function Terminal({ onCommand, isMatrixCommandUnlocked, active, theme }: TerminalProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cwd, setCwd] = useState(ROOT);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLDivElement>(null);
  const id = useRef(0);
  const draft = useRef('');
  const started = useRef(Date.now());

  useEffect(() => {
    if (active) input.current?.focus();
    else if (document.activeElement === input.current) input.current?.blur();
  }, [active]);

  useEffect(() => {
    if (output.current) output.current.scrollTop = output.current.scrollHeight;
  }, [entries, suggestions]);

  const append = useCallback((result: ShellResult) => {
    setEntries(previous => [...previous.slice(-99), { id: id.current++, result }]);
  }, []);

  const run = (raw: string) => {
    if (!raw.trim()) return;
    const result = runShell(raw, { cwd, history, unlocked: isMatrixCommandUnlocked, theme });
    setHistory(previous => [...previous.slice(-199), raw]);
    setHistoryIndex(-1);
    draft.current = '';
    setValue('');
    setSuggestions([]);
    if (result.cwd) setCwd(result.cwd);
    if (result.clear) setEntries([]);
    else setEntries(previous => [...previous.slice(-99), { id: id.current++, command: raw, cwd, result }]);
    if (result.action === 'status') {
      append({ text: [
        'BROWSER SESSION / actual local values',
        'Theme: ' + theme,
        'Session: ' + Math.floor((Date.now() - started.current) / 1000) + ' seconds',
        'Viewport: ' + window.innerWidth + ' × ' + window.innerHeight,
        'Connectivity hint: ' + (navigator.onLine ? 'online' : 'offline'),
        'Projects: ' + projects.length,
        'Shell: simulated, client-side',
        'No remote service health checks are performed.',
      ].join('\n') });
    } else if (result.action === 'scores') {
      const read = (key: string) => { try { return localStorage.getItem(key) || '0'; } catch { return 'unavailable'; } };
      append({ text: 'LOCAL ARCADE RECORDS\nBird    ' + read('bird_highscore') + '\nSnake   ' + read('snake_highscore') + '\nPac-Man ' + read('pacman_highscore') });
    } else if (result.action === 'copy email') {
      navigator.clipboard?.writeText(profile.email).then(
        () => append({ text: 'Email copied: ' + profile.email }),
        () => append({ text: 'Clipboard unavailable. Select and copy: ' + profile.email }),
      );
      if (!navigator.clipboard) append({ text: 'Select and copy: ' + profile.email });
    } else if (result.action) onCommand(result.action);
  };

  const renderResult = (result: ShellResult): React.ReactNode => {
    if (result.view === 'help') {
      const group = result.subject && manuals[result.subject];
      return <div className="term-card">
        <div className="term-card-title"><span>{group ? group.title : 'Command manual'}</span><b>{group ? 'help ' + result.subject : 'help(1)'}</b></div>
        {group ? <div className="term-command-list">{group.commands.map(([command, description]) =>
          <button key={command} onClick={() => run(command)}><b>{command}</b><span>{description}</span></button>
        )}</div> : <>
          <p>Choose a category. Click any command to run it.</p>
          <div className="term-help-grid">{Object.entries(manuals).map(([key, page]) =>
            <button key={key} onClick={() => run('help ' + key)}><b>help {key}</b><small>{page.title}</small></button>
          )}</div>
        </>}
        {isMatrixCommandUnlocked && result.subject === 'arcade' && <button className="term-inline" onClick={() => run('matrix')}>matrix → classified channel</button>}
        <p className="term-tip">↑ ↓ history · Tab complete · Ctrl+L clear · Ctrl+C cancel</p>
      </div>;
    }
    if (result.view === 'projects' || result.view === 'links') {
      return <div className="term-projects">{result.text && <p>{result.text}</p>}
        {projects.filter(project => !result.subject || project.id === result.subject).map(project =>
          <article key={project.id}>
            <small>{project.category}</small><h3>{project.title}</h3>
            <p>{project.description}</p><p className="term-tip">{project.tools.join(' · ')}</p>
            {'contribution' in project && <p><b>My contribution:</b> {project.contribution}</p>}
            <div className="term-project-actions">
              <button onClick={() => run('open ' + project.id)}>Visual preview ↗</button>
              <a href={project.source} target="_blank" rel="noreferrer">Source ↗</a>
              {'live' in project && <a href={project.live} target="_blank" rel="noreferrer">{project.liveLabel} ↗</a>}
            </div>
          </article>
        )}
      </div>;
    }
    if (result.view === 'profile') {
      const content: Record<string, string> = {
        about: profile.name + '\nComputer Science finalist · DevOps & Cloud focus\n' + profile.location + '\n\n' + profile.careerFocus,
        education: 'BSc Computer Science — University of the Witwatersrand\nFinal-year student\n\nNational Senior Certificate — Njeyeza Secondary School\nMatriculated with distinction',
        skills: 'Languages   Python · Java · C++ · JavaScript · SQL\nCloud       Azure · Firebase · Render\nContainers  Docker · Compose · Kubernetes\nIaC         Terraform · Kubernetes YAML\nDelivery    GitHub Actions · Azure DevOps\nTools       Git · GitHub · Linux · Windows',
        contact: profile.email + '\n' + profile.location + '\n\n' + profile.careerFocus,
      };
      return <div className="term-card"><pre>{content[result.subject || 'about']}</pre>
        {result.subject === 'contact' && <div className="term-project-actions"><a href={'mailto:' + profile.email}>Email ↗</a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a></div>}
      </div>;
    }
    if (result.view === 'themes') return <div className="theme-options">{['orbit', 'nebula', 'solar'].map(name =>
      <button key={name} onClick={() => run('theme ' + name)}><i className={'swatch ' + name} />theme {name}{theme === name ? ' ✓' : ''}</button>
    )}</div>;
    if (result.view === 'neofetch') return <div className="neofetch">
      <pre>{'    ╭──────╮\n ╭──╯  ZM  ╰──╮\n │   ◢███◣    │\n │  ◢█████◣   │\n ╰────╮  ╭────╯\n      ╰──╯'}</pre>
      <div><b>visitor@zm-os</b><hr /><span>OS: browser portfolio</span><span>Host: Johannesburg, ZA</span><span>Theme: {theme}</span><span>Stack: React / TypeScript</span><span>Mission: always learning</span><small>● ● ● ● ●</small></div>
    </div>;
    return result.text ? <pre>{result.text}</pre> : null;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') { event.preventDefault(); run(value); }
    if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault();
      if (historyIndex === -1) draft.current = value;
      const next = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(next); setValue(history[history.length - 1 - next]); setSuggestions([]);
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = Math.max(-1, historyIndex - 1);
      setHistoryIndex(next); setValue(next === -1 ? draft.current : history[history.length - 1 - next]); setSuggestions([]);
    }
    if (event.key === 'Tab' && !event.shiftKey && value.trim()) {
      event.preventDefault();
      const matches = completeCommand(value, cwd);
      if (matches.length === 1) { setValue(matches[0]); setSuggestions([]); }
      else setSuggestions(matches.slice(0, 10));
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'l') { event.preventDefault(); setEntries([]); setSuggestions([]); }
    if (event.ctrlKey && event.key.toLowerCase() === 'c' && !window.getSelection()?.toString()) {
      event.preventDefault(); append({ text: value + '^C' }); setValue(''); setSuggestions([]); setHistoryIndex(-1);
    }
  };

  return <div className="terminal-screen">
    <div className="terminal-titlebar"><div className="terminal-dots"><i /><i /><i /></div><span className="terminal-title">visitor@zm-os · browser shell</span><span className="terminal-health"><i /> LOCAL</span></div>
    <div className="terminal-output" ref={output} role="log" aria-live="polite" aria-label="Command output">
      {!entries.length && <div className="terminal-boot"><div><span>ZM—OS</span><b>EXPLORER EDITION</b></div><p>Your shortcut to the person behind the systems.</p><p>Start with <button onClick={() => run('help')}>help</button>, <button onClick={() => run('get projects')}>get projects</button> or <button onClick={() => run('brief')}>brief</button>.</p><small>Simulated Linux shell · runs entirely in your browser</small></div>}
      {entries.map(entry => <div className="terminal-line" key={entry.id}>
        {entry.command && <div className="term-prompt-line"><span>visitor@zm-os</span>:<b>{shortPath(entry.cwd!)}</b>$ {entry.command}</div>}
        {renderResult(entry.result)}
      </div>)}
    </div>
    {suggestions.length > 0 && <div className="term-completions" aria-label="Command suggestions">{suggestions.map(command => <button key={command} onClick={() => { setValue(command); setSuggestions([]); input.current?.focus(); }}>{command}</button>)}</div>}
    <form className="terminal-input-row" onSubmit={event => { event.preventDefault(); run(value); }}>
      <label className="terminal-prompt" htmlFor="shell-input"><b>visitor</b>:<i title={cwd}>{shortPath(cwd)}</i>$</label>
      <input id="shell-input" ref={input} value={value} onChange={event => { setValue(event.target.value); setHistoryIndex(-1); setSuggestions([]); }} onKeyDown={onKeyDown} maxLength={1000} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Terminal command" placeholder="type a command…" />
      <button type="submit" className="terminal-run" aria-label="Run command">↵</button>
    </form>
    <div className="terminal-quick"><span>QUICK EXEC</span>{['help', 'get projects', 'neofetch', 'brief'].map(command => <button key={command} onClick={() => run(command)}>{command}</button>)}</div>
  </div>;
}
