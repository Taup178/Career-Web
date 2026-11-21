import React, { useCallback, useEffect, useState } from 'react';
import Terminal from './Terminal';
import BirdGame from './BirdGame';
import SnakeGame from './SnakeGame';
import PacmanGame from './PacmanGame';
import HireMeModal from './HireMeModal';
import MatrixOverlay from './MatrixOverlay';
import MatrixNotificationModal from './MatrixNotificationModal';
import IdentityBadge from './IdentityBadge';
import ThesisProjectVisual from './ThesisProjectVisual';
import DigitalLogbookVisual from './DigitalLogbookVisual';
import { StockvelVisual, DevOpsVisual } from './ProjectVisuals';
import Modal from './Modal';
import ViewSwitch from './ViewSwitch';
import ThemePicker from './ThemePicker';
import AppearanceMenu from './AppearanceMenu';
import { isTheme, readPreference, savePreference, projects, profile } from './portfolio';
import type { ProjectId, Theme } from './portfolio';
import { GameState } from './types';

const sections = [
  { id: 'home', label: 'Start' },
  { id: 'work', label: 'Projects' },
  { id: 'capabilities', label: 'Skills' },
  { id: 'about', label: 'About' },
  { id: 'playground', label: 'Arcade' },
  { id: 'contact', label: 'Contact' },
];

const devopsProject = projects.find(project => project.id === 'azure')!;
const logbookProject = projects.find(project => project.id === 'logbook')!;
const projectVisuals: Record<ProjectId, React.ComponentType> = {
  stockvel: StockvelVisual,
  azure: DevOpsVisual,
  logbook: DigitalLogbookVisual,
  thesis: ThesisProjectVisual,
};

const foundationTools = ['Python', 'Java', 'C++', 'SQL', 'Node.js', 'Firebase'];

const capabilities = [
  {
    label: '01 / INFRASTRUCTURE',
    title: 'Cloud infrastructure',
    description: 'Defining repeatable cloud environments with infrastructure as code.',
    tools: ['Microsoft Azure', 'Terraform'],
    command: 'terraform plan',
    icon: 'M7 17H6a4 4 0 0 1-.5-8A6.5 6.5 0 0 1 18 8a4.5 4.5 0 0 1 0 9h-1M12 13v8m-3-3 3 3 3-3',
  },
  {
    label: '02 / AUTOMATION',
    title: 'Delivery automation',
    description: 'Connecting code, builds and deployment through repeatable CI/CD workflows.',
    tools: ['GitHub Actions', 'Azure DevOps'],
    command: 'gh workflow run',
    icon: 'M4 7h13m-4-4 4 4-4 4M20 17H7m4-4-4 4 4 4',
  },
  {
    label: '03 / RUNTIME',
    title: 'Containers & runtime',
    description: 'Packaging services to run consistently across local and cloud environments.',
    tools: ['Docker', 'Kubernetes', 'Linux'],
    command: 'docker compose up',
    icon: 'm12 3 9 5v9l-9 5-9-5V8l9-5Zm0 10 9-5M12 13 3 8m9 5v9M7.5 5.5l9 5',
  },
];

const ArrowIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const ExternalIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M11 4h5v5M16 4l-8 8M14 11v5H4V6h5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = readPreference('zm-theme');
    // Replace the legacy Orbit default once, then preserve subsequent choices.
    const legacyOrbit = saved === 'orbit' && readPreference('zm-theme-default') !== 'solar';
    return isTheme(saved) && !legacyOrbit ? saved : 'solar';
  });
  const [motion, setMotion] = useState(() => readPreference('zm-motion') !== 'off');
  const [preview, setPreview] = useState<ProjectId>('stockvel');
  const [mobilePreview, setMobilePreview] = useState(false);
  const [compactWorkspace, setCompactWorkspace] = useState(() => window.matchMedia('(max-width: 820px)').matches);
  const [pipelineRun, setPipelineRun] = useState(0);
  const [gameState, setGameState] = useState<GameState>(GameState.None);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHireMe, setShowHireMe] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [showMatrixNotification, setShowMatrixNotification] = useState(false);
  const [matrixUnlocked, setMatrixUnlocked] = useState(() => readPreference('zm-matrix') === 'unlocked');
  const [activeSection, setActiveSection] = useState('home');
  const selectedProject = projects.find(project => project.id === preview)!;
  const SelectedProjectVisual = projectVisuals[preview];

  const changeView = useCallback((view: 'portfolio' | 'terminal') => {
    setMenuOpen(false);
    if (view === 'terminal') setMobilePreview(false);
    setTerminalOpen(view === 'terminal');
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 820px)');
    const sync = () => setCompactWorkspace(media.matches);
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    savePreference('zm-theme', theme);
    savePreference('zm-theme-default', 'solar');
  }, [theme]);
  useEffect(() => { savePreference('zm-motion', motion ? 'on' : 'off'); }, [motion]);
  useEffect(() => {
    if (!terminalOpen && !showHireMe && !showMatrix && gameState === GameState.None) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [terminalOpen, showHireMe, showMatrix, gameState]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: '-30% 0px -55%', threshold: [0.05, 0.25, 0.6] },
    );
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        if (showHireMe || showMatrix || gameState !== GameState.None) return;
        event.preventDefault();
        setMenuOpen(false);
        setMobilePreview(false);
        setTerminalOpen(value => !value);
      }
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, showHireMe, showMatrix]);

  const goTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: !motion || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    setMenuOpen(false);
  }, [motion]);

  const handleCommand = useCallback((command: string) => {
    const routes: Record<string, string> = {
      'open work': 'work',
      'open stack': 'capabilities',
      'open about': 'about',
      'open contact': 'contact',
      'home': 'home', 'open play': 'playground',
    };
    if (routes[command]) { goTo(routes[command]); setTerminalOpen(false); }
    if (command === 'exit') setTerminalOpen(false);
    if (command === 'play bird') { setGameState(GameState.Bird); setTerminalOpen(false); }
    if (command === 'play snake') { setGameState(GameState.Snake); setTerminalOpen(false); }
    if (command === 'play pacman') { setGameState(GameState.Pacman); setTerminalOpen(false); }
    if (command.startsWith('stop ')) setGameState(GameState.None);
    if (command === 'hire me') setShowHireMe(true);
    if (command === 'matrix' && matrixUnlocked) setShowMatrix(true);
    const project = projects.find(project => command === 'open ' + project.id);
    if (project) { setPreview(project.id); setMobilePreview(true); }
    if (command === 'motion off') setMotion(false);
    if (command === 'motion on') setMotion(true);
    if (command === 'unlock') { setMatrixUnlocked(true); savePreference('zm-matrix', 'unlocked'); }
    if (command === 'theme orbit') setTheme('orbit');
    if (command === 'theme nebula') setTheme('nebula');
    if (command === 'theme solar') setTheme('solar');
  }, [goTo, matrixUnlocked]);

  const unlockMatrix = useCallback(() => {
    setShowMatrixNotification(true);
    setMatrixUnlocked(true);
    savePreference('zm-matrix', 'unlocked');
  }, []);

  const renderGame = () => {
    const props = {
      stopGame: () => setGameState(GameState.None),
      onMatrixNotification: unlockMatrix,
      isNotificationVisible: showMatrixNotification,
    };
    if (gameState === GameState.Bird) return <BirdGame {...props} />;
    if (gameState === GameState.Snake) return <SnakeGame {...props} />;
    if (gameState === GameState.Pacman) return <PacmanGame {...props} />;
    return null;
  };

  return (
    <div className={`site-shell theme-${theme} ${motion ? '' : 'motion-paused'}`}>
      <a className="skip-link" href="#work">Skip to projects</a>

      {showHireMe && <HireMeModal onClose={() => setShowHireMe(false)} />}
      {showMatrix && <MatrixOverlay motion={motion} onClose={() => setShowMatrix(false)} />}
      {showMatrixNotification && <MatrixNotificationModal onClose={() => setShowMatrixNotification(false)} />}

      {gameState !== GameState.None && (
        <Modal open onClose={() => setGameState(GameState.None)} className="game-modal" label="Portfolio arcade game">
          <div className="game-stage">{renderGame()}</div>
        </Modal>
      )}

      <header className="topbar">
        <button className="brand" onClick={() => goTo('home')} aria-label="Go to top">
          <span className="brand-mark">ZM</span>
          <span className="brand-copy"><strong>Zamokuhle Maziya</strong><small>DevOps · Cloud · Software</small></span>
        </button>

        <nav id="main-navigation" className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {sections.slice(1).map(section => (
            <button key={section.id} onClick={() => goTo(section.id)} aria-current={activeSection === section.id ? 'location' : undefined} className={activeSection === section.id ? 'active' : ''}>
              {section.label}
            </button>
          ))}
        </nav>

        <div className="top-actions">
          <ThemePicker theme={theme} onChange={setTheme} />
          <ViewSwitch active="portfolio" onChange={changeView} />
          <button className="menu-trigger" onClick={() => setMenuOpen(value => !value)} aria-controls="main-navigation" aria-expanded={menuOpen} aria-label="Toggle menu">{menuOpen ? 'Close ×' : 'Menu ☰'}</button>
        </div>
      </header>

      <main>
        <section id="home" className="hero section-pad">
          <div className="hero-copy reveal">
            <div className="eyebrow"><span className="status-dot" /> Open to junior &amp; graduate roles</div>
            <h1>I turn fragile releases into <em>calm, repeatable systems.</em></h1>
            <p className="hero-intro">Computer Science finalist building cloud infrastructure, delivery automation and dependable software.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => goTo('work')}>View projects <ArrowIcon /></button>
              <button className="text-button" onClick={() => changeView('terminal')}><span aria-hidden="true">&gt;_</span> Open terminal</button>
            </div>
            <button className="brief-trigger" onClick={() => setShowHireMe(true)}>30-second brief <span>↗</span></button>
          </div>

          <div className="hero-visual reveal delay-1" aria-label="Animated deployment system diagram">
            <div className="deck-glow" />
            <div className="control-deck" key={pipelineRun}>
              <div className="deck-header">
                <div><span className="deck-kicker">DEPLOYMENT SIMULATION</span><strong>release/main</strong></div>
                <button className="healthy" onClick={() => setPipelineRun(value => value + 1)}><i /> REPLAY ↻</button>
              </div>
              <div className="pipeline">
                <div className="pipeline-track" />
                {['Commit', 'Build', 'Verify', 'Ship'].map((item, index) => (
                  <div className="pipeline-node" key={item} style={{ '--delay': `${index * 0.55}s` } as React.CSSProperties}>
                    <span>{index < 3 ? '✓' : '↑'}</span><strong>{item}</strong><small>{index === 0 ? 'a81c2f' : index === 1 ? '00:42' : index === 2 ? '18/18' : 'prod'}</small>
                  </div>
                ))}
              </div>
              <div className="deck-lower">
                <div className="metric-panel">
                  <div className="metric-heading"><span>BUILD HISTORY</span><strong>10</strong></div>
                  <div className="bars">{[36, 52, 44, 70, 62, 78, 72, 90, 82, 96].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div>
                </div>
                <div className="log-panel">
                  <span className="log-title">activity.log</span>
                  <code><i>14:03</i> image pushed</code><code><i>14:04</i> pods ready <b>3/3</b></code><code><i>14:04</i> health check <b>200</b></code><div className="log-cursor">_</div>
                </div>
              </div>
              <div className="deck-footer"><span>AZURE</span><span>KUBERNETES</span><span>GITHUB ACTIONS</span><span>DOCKER</span></div>
            </div>
            <IdentityBadge />
          </div>
        </section>

        <section id="work" className="work-section section-pad">
          <figure className="profile-intro">
            <div className="profile-photo"><img src="/zamokuhle-maziya.jpg" alt={profile.name} width="144" height="144" loading="lazy" decoding="async" /></div>
            <figcaption>
              <strong>{profile.name}</strong>
              <p>DevOps &amp; Cloud · Johannesburg</p>
            </figcaption>
          </figure>
          <div className="section-heading">
            <div><span className="section-number">02 / PROJECTS</span><h2>Selected <em>work.</em></h2></div>
          </div>
          <nav className="project-jump-links" aria-label="Jump to a project">
            {projects.map((project, index) => <a key={project.id} href={`#${project.id}-project`}><span>0{index + 1}</span>{project.title}<span aria-hidden="true">↓</span></a>)}
          </nav>

          <article id="stockvel-project" className="project-feature stockvel-feature">
            <div className="project-copy">
              <span className="project-index">01 / CLOUD MICROSERVICES</span><h3>Stockvel-Pro</h3>
              <p className="project-lead">Community finance, built with independent services behind a single API gateway.</p>
              <div className="project-facts">
                <div><span>SERVICES</span><strong>5 microservices</strong></div><div><span>DELIVERY</span><strong>GitHub Actions</strong></div><div><span>RUNTIME</span><strong>Docker + Kubernetes</strong></div>
              </div>
              <a className="project-link" href="https://github.com/Zamam03/Stockvel-Microservice" target="_blank" rel="noreferrer">View repository <ExternalIcon /></a>
            </div>

            <StockvelVisual />
          </article>

          <article id="azure-project" className="project-feature azure-feature">
            <DevOpsVisual />
            <div className="project-copy"><span className="project-index">02 / INFRASTRUCTURE &amp; DELIVERY</span><h3>{devopsProject.title}</h3>
              <p className="project-lead">{devopsProject.description}</p>
              <div className="tool-ribbon">{devopsProject.tools.map(tool => <span key={tool}>{tool}</span>)}</div>
              <a className="project-link" href={devopsProject.source} target="_blank" rel="noreferrer">View repository <ExternalIcon /></a>
            </div>
          </article>

          <article id="logbook-project" className="project-feature logbook-feature">
            <DigitalLogbookVisual />
            <div className="project-copy">
              <span className="project-index">03 / PLANNING PLATFORM · TEAM PROJECT</span>
              <h3>{logbookProject.title}</h3>
              <p className="project-lead">{logbookProject.description}</p>
              <div className="project-contribution"><span>MY CONTRIBUTION</span><strong>{logbookProject.contribution}</strong></div>
              <div className="project-actions">
                <a className="project-link play-link" href={logbookProject.live} target="_blank" rel="noreferrer">{logbookProject.liveLabel} <ArrowIcon /></a>
                <a className="project-link" href={logbookProject.source} target="_blank" rel="noreferrer">View source <ExternalIcon /></a>
              </div>
              <div className="tool-ribbon">{logbookProject.tools.map(tool => <span key={tool}>{tool}</span>)}</div>
            </div>
          </article>

          <article id="thesis-project" className="project-feature thesis-feature">
            <ThesisProjectVisual />
            <div className="project-copy">
              <span className="project-index">04 / 3D BROWSER GAME · TEAM PROJECT</span>
              <h3>Thesis of<br />the Dead</h3>
              <p className="project-lead">Survive a degree overrun by zombies, from Freshman Woods to a final showdown with the Dean.</p>
              <div className="project-facts">
                <div><span>ENGINE</span><strong>Three.js + WebGL</strong></div>
                <div><span>EXPERIENCE</span><strong>3 chapters + bosses</strong></div>
                <div><span>SYSTEMS</span><strong>Combat, AI, shaders</strong></div>
              </div>
              <div className="project-actions">
                <a className="project-link play-link" href="https://wmc.ms.wits.ac.za/students/sgroup3911/index.html" target="_blank" rel="noreferrer">Play live <ArrowIcon /></a>
                <a className="project-link" href="https://github.com/Taup178/Thesis_of_the_dead" target="_blank" rel="noreferrer">View source <ExternalIcon /></a>
              </div>
              <div className="tool-ribbon"><span>THREE.JS</span><span>JAVASCRIPT</span><span>GLSL</span><span>VITE</span><span>WEB AUDIO</span><span>GLTF</span></div>
            </div>
          </article>
        </section>

        <section id="capabilities" className="capabilities-section section-pad" aria-labelledby="capabilities-title">
          <div className="capabilities-heading">
            <span className="section-number">03 / CAPABILITIES</span>
            <h2 id="capabilities-title">Build. Automate. <em>Deploy.</em></h2>
          </div>
          <div className="capability-grid">
            {capabilities.map(capability => <article className="cap-card" key={capability.label}>
              <div className="cap-card-header">
                <span className="cap-number">{capability.label}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={capability.icon} /></svg>
              </div>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
              <ul className="cap-tools" aria-label={`${capability.title} tools`}>{capability.tools.map(tool => <li key={tool}>{tool}</li>)}</ul>
              <div className="cap-command"><span aria-hidden="true">$</span><code>{capability.command}</code></div>
            </article>)}
            <article className="cap-card wide">
              <div><h3>Software foundations</h3><p>Computer Science fundamentals and backend development.</p></div>
              <ul className="stack-cloud" aria-label="Software foundation tools">{foundationTools.map(tool => <li key={tool}>{tool}</li>)}</ul>
            </article>
          </div>
        </section>

        <section id="about" className="about-section section-pad">
          <div className="about-statement"><span className="section-number">04 / ABOUT</span><blockquote>Turning a messy process into a <em>system people can trust.</em></blockquote></div>
          <div className="about-grid">
            <div className="about-copy"><p>I’m a final-year Computer Science student at the University of the Witwatersrand in Johannesburg.</p><p>I enjoy the work between writing software and running it well: planning services, automating delivery and making systems easier to maintain.</p><button className="text-button" onClick={() => setShowHireMe(true)}>Read my brief <ArrowIcon /></button></div>
            <div className="timeline">
              <div><span>NOW</span><i /><section><small>UNIVERSITY OF THE WITWATERSRAND</small><strong>BSc Computer Science</strong><p>Final-year student · Johannesburg</p></section></div>
              <div><span>FOUNDATION</span><i /><section><small>NJEYEZA SECONDARY SCHOOL</small><strong>National Senior Certificate</strong><p>Matriculated with distinction</p></section></div>
            </div>
          </div>
        </section>

        <section id="playground" className="playground-section section-pad">
          <div className="playground-copy"><span className="section-number">05 / AFTER HOURS</span><h2>A little <em>play.</em></h2><p>Three arcade classics, built for the browser.</p></div>
          <div className="arcade-grid">
            <button className="arcade-card bird-card" type="button" onClick={() => setGameState(GameState.Bird)} aria-label="Play Flappy Bird">
              <span className="arcade-art"><img src="/arcade/bird.svg" alt="" width="480" height="360" loading="lazy" decoding="async" /></span>
              <span className="arcade-card-copy"><span><small>01 / REFLEX</small><strong>Flappy Bird</strong></span><span className="arcade-play"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3 8 5-8 5Z" fill="currentColor" /></svg>Play</span></span>
            </button>
            <button className="arcade-card snake-card" type="button" onClick={() => setGameState(GameState.Snake)} aria-label="Play Cyber Snake">
              <span className="arcade-art"><img src="/arcade/snake.svg" alt="" width="480" height="360" loading="lazy" decoding="async" /></span>
              <span className="arcade-card-copy"><span><small>02 / STRATEGY</small><strong>Cyber Snake</strong></span><span className="arcade-play"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3 8 5-8 5Z" fill="currentColor" /></svg>Play</span></span>
            </button>
            <button className="arcade-card pacman-card" type="button" onClick={() => setGameState(GameState.Pacman)} aria-label="Play Cyber Pac-Man">
              <span className="arcade-art"><img src="/arcade/pacman.svg" alt="" width="480" height="360" loading="lazy" decoding="async" /></span>
              <span className="arcade-card-copy"><span><small>03 / CLASSIC</small><strong>Cyber Pac-Man</strong></span><span className="arcade-play"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3 8 5-8 5Z" fill="currentColor" /></svg>Play</span></span>
            </button>
          </div>
        </section>

        <section id="contact" className="contact-section section-pad">
          <div className="contact-orbit"><span>AVAILABLE</span><i>✦</i><span>JOHANNESBURG</span><i>✦</i></div>
          <span className="section-number">06 / LET’S CONNECT</span><h2>Have a system to improve<br />or a team to grow?</h2>
          <a className="contact-email" href="mailto:zamokuhlemaziya944@gmail.com">zamokuhlemaziya944@gmail.com <ArrowIcon /></a>
          <div className="contact-bottom"><p>Available for junior and graduate roles in DevOps, cloud and software engineering.</p><div className="social-links"><a href="https://linkedin.com/in/zamokuhle-maziya" target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a><a href={profile.github} target="_blank" rel="noreferrer">GitHub <span>↗</span></a></div></div>
        </section>
      </main>

      <footer>
        <span>© {new Date().getFullYear()} ZAMOKUHLE MAZIYA</span>
        <AppearanceMenu theme={theme} motion={motion} onThemeChange={setTheme} onMotionChange={setMotion} />
        <button onClick={() => goTo('home')}>BACK TO TOP ↑</button>
      </footer>

      <Modal open={terminalOpen} onClose={() => setTerminalOpen(false)} className="terminal-layer" label="Command workspace">
        <div className="command-workspace">
          <div className="workspace-header">
            <div className="workspace-brand"><span className="status-dot" /><strong>ZM—OS</strong><small>ESC TO RETURN</small></div>
            <div className="workspace-controls"><ThemePicker theme={theme} onChange={setTheme} /><ViewSwitch active="terminal" onChange={changeView} /></div>
          </div>
          <div className="workspace-mobile-tabs" role="group" aria-label="Terminal workspace panel"><button onClick={() => setMobilePreview(false)} aria-pressed={!mobilePreview}>Command line</button><button onClick={() => setMobilePreview(true)} aria-pressed={mobilePreview}>Project visuals</button></div>
          <section className={'command-preview ' + (mobilePreview ? 'mobile-active' : '')} aria-label="Project visual display">
            <nav className="preview-tabs" aria-label="Choose a project">{projects.map(project => <button key={project.id} onClick={() => setPreview(project.id)} aria-pressed={preview === project.id}>{project.title}</button>)}</nav>
            <div className="preview-stage">{terminalOpen && <SelectedProjectVisual />}</div>
            <div className="preview-description"><small>{selectedProject.category}</small><h2>{selectedProject.title}</h2><p>{selectedProject.description}</p>
              {'contribution' in selectedProject && <div className="project-contribution"><span>MY CONTRIBUTION</span><strong>{selectedProject.contribution}</strong></div>}
              <div className="tool-ribbon">{selectedProject.tools.map(tool => <span key={tool}>{tool}</span>)}</div>
              <div className="project-actions"><a className="project-link" href={selectedProject.source} target="_blank" rel="noreferrer">View source ↗</a>{'live' in selectedProject && <a className="project-link" href={selectedProject.live} target="_blank" rel="noreferrer">{selectedProject.liveLabel} ↗</a>}</div>
            </div>
          </section>
          <div className={'workspace-terminal ' + (!mobilePreview ? 'mobile-active' : '')}>
            <Terminal active={terminalOpen && (!compactWorkspace || !mobilePreview)} theme={theme} onCommand={handleCommand} isMatrixCommandUnlocked={matrixUnlocked} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
