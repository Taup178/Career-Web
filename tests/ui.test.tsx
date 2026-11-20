import test from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';

test('portfolio navigation, project workspace, themes and shell interactions', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost:3000', pretendToBeVisual: true });
  const { window } = dom;
  for (const [key, value] of Object.entries({ window, document: window.document, navigator: window.navigator, HTMLElement: window.HTMLElement, localStorage: window.localStorage, IS_REACT_ACT_ENVIRONMENT: true })) {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  const compactListeners = new Set<() => void>();
  let compact = false;
  window.matchMedia = ((query: string) => ({ get matches() { return query === '(max-width: 820px)' && compact; }, addEventListener(_event: string, callback: () => void) { compactListeners.add(callback); }, removeEventListener(_event: string, callback: () => void) { compactListeners.delete(callback); } })) as any;
  let scrolledTo = '';
  window.HTMLElement.prototype.scrollIntoView = function () { scrolledTo = this.id; };
  window.HTMLElement.prototype.getClientRects = function () { return this.closest('[hidden]') ? [] as any : [{ width: 200, height: 60 }] as any; };
  const observed = new Map<Element, IntersectionObserverCallback>();
  Object.defineProperty(globalThis, 'IntersectionObserver', { configurable: true, value: class {
    constructor(private callback: IntersectionObserverCallback) {}
    observe(element: Element) { observed.set(element, this.callback); }
    disconnect() {}
  } });
  Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, value: class { callback: Function; constructor(callback: Function) { this.callback = callback; } observe() { this.callback([{ contentRect: { width: 600, height: 600 } }]); } disconnect() {} } });
  Object.defineProperty(globalThis, 'requestAnimationFrame', { configurable: true, value: () => 1 });
  Object.defineProperty(globalThis, 'cancelAnimationFrame', { configurable: true, value: () => {} });
  window.HTMLCanvasElement.prototype.getContext = (() => new Proxy({}, { get(_target, name) { if (String(name).startsWith('create')) return () => ({ addColorStop() {} }); return () => {}; }, set() { return true; } })) as any;
  const { createRoot } = await import('react-dom/client');
  const { default: App } = await import('../App');
  const root = createRoot(window.document.getElementById('root')!);
  const click = async (element: Element | null) => { assert.ok(element, 'click target exists'); await act(async () => { element.dispatchEvent(new window.MouseEvent('click', { bubbles: true })); }); };
  const chooseTheme = async (selector: string, theme: string) => {
    const select = document.querySelector<HTMLSelectElement>(selector);
    assert.ok(select, 'theme selector exists');
    await act(async () => {
      select.value = theme;
      select.dispatchEvent(new window.Event('change', { bubbles: true }));
    });
    assert.ok(document.querySelector('.site-shell.theme-' + theme), 'theme changes on the page');
    assert.equal(window.localStorage.getItem('zm-theme'), theme, 'theme preference persists');
    for (const picker of document.querySelectorAll<HTMLSelectElement>('.theme-picker select')) {
      assert.equal(picker.value, theme, 'both view headers reflect the same theme');
    }
  };
  const command = async (value: string) => {
    const input = window.document.querySelector<HTMLInputElement>('#shell-input')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!.call(input, value);
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
    });
    await act(async () => { input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
  };
  const key = async (key: string, extras = {}) => {
    await act(async () => { window.document.querySelector('#shell-input')!.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, ...extras })); });
  };
  try {
    window.localStorage.setItem('zm-theme', 'orbit');
    await act(async () => { root.render(<App />); });
    assert.ok(document.querySelector('.site-shell.theme-solar'), 'the legacy saved Orbit default migrates to Solar');
    assert.equal(document.querySelector<HTMLSelectElement>('.topbar .theme-picker select')!.value, 'solar');
    assert.equal(window.localStorage.getItem('zm-theme'), 'solar');
    assert.equal(window.document.querySelectorAll('main section[id]').length, 6);
    assert.deepEqual(Array.from(document.querySelectorAll('#work article')).map(element => element.id), ['stockvel-project', 'azure-project', 'logbook-project', 'thesis-project']);
    assert.deepEqual(Array.from(document.querySelectorAll('.project-jump-links a')).map(element => element.getAttribute('href')), ['#stockvel-project', '#azure-project', '#logbook-project', '#thesis-project']);
    assert.match(document.querySelector('#logbook-project .project-index')!.textContent!, /^03/);
    assert.match(document.querySelector('#thesis-project .project-index')!.textContent!, /^04/);
    assert.match(document.querySelector('#logbook-project .project-contribution')!.textContent!, /Architecture planning, containerization and deployments/);
    const stockvel = document.querySelector<HTMLElement>('#stockvel-project .project-preview')!;
    await click(stockvel.querySelector('.system-services button:nth-child(2)'));
    assert.equal(stockvel.querySelector('.system-services [aria-pressed=true]')!.textContent, 'Payments');
    assert.match(stockvel.querySelector('.preview-inspector')!.textContent!, /\/payments.*Payment workflows/);
    const observeStockvel = (isIntersecting: boolean) => observed.get(stockvel)!([{
      target: stockvel, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0,
      boundingClientRect: stockvel.getBoundingClientRect(), intersectionRect: stockvel.getBoundingClientRect(), rootBounds: null, time: 0,
    }], {} as IntersectionObserver);
    await act(async () => { observeStockvel(false); });
    assert.equal(stockvel.dataset.active, 'false', 'offscreen previews pause ambient animations');
    await act(async () => { observeStockvel(true); });
    assert.equal(stockvel.dataset.active, 'true', 'visible previews resume ambient animations');
    await click(document.querySelector('#azure-project .delivery-nodes button:nth-child(3)'));
    assert.equal(document.querySelector('#azure-project .delivery-nodes [aria-pressed=true] strong')!.textContent, 'Automate');
    assert.match(document.querySelector('#azure-project .delivery-code')!.textContent!, /azure-pipelines.yml.*PushToACR/);
    assert.match(document.querySelector('#azure-project .delivery-detail')!.textContent!, /Azure DevOps \+ ACR/);
    assert.equal(document.querySelectorAll('#azure-project .delivery-nodes .is-complete').length, 2);
    const logbook = document.querySelector('#logbook-project')!;
    await click(logbook.querySelector('.logbook-selection button'));
    assert.equal(logbook.querySelector<HTMLElement>('.logbook-task')!.style.getPropertyValue('--column'), '1');
    assert.match(logbook.querySelector('.logbook-selection button')!.getAttribute('aria-label')!, /Architecture plan to Complete/);
    await click(document.querySelector('#logbook-project .logbook-view-switch button:nth-child(2)'));
    assert.ok(document.querySelector('#logbook-project .logbook-calendar'));
    await click(logbook.querySelector('.logbook-calendar > div:nth-child(3) button'));
    assert.equal(logbook.querySelector('.logbook-selection strong')!.textContent, 'Container setup');
    await click(document.querySelector('#logbook-project .logbook-view-switch button:nth-child(3)'));
    assert.ok(document.querySelector('#logbook-project .logbook-timeline'));
    assert.equal(logbook.querySelector('.logbook-timeline button[aria-pressed=true] > span')!.textContent, 'Build', 'task selection persists across views');
    await click(logbook.querySelector('.logbook-selection button'));
    assert.match(logbook.querySelector('.logbook-bottom')!.textContent!, /2 \/ 3 complete/);
    await click(logbook.querySelector('.logbook-view-switch button:first-child'));
    assert.equal(logbook.querySelectorAll<HTMLElement>('.logbook-task')[1].style.getPropertyValue('--column'), '2', 'task status persists when returning to the board');
    assert.equal(window.document.querySelector('.topbar [data-view="portfolio"]')!.getAttribute('aria-pressed'), 'true');
    await click(window.document.querySelector('.menu-trigger'));
    assert.equal(window.document.querySelector('.menu-trigger')!.getAttribute('aria-expanded'), 'true');
    await click(window.document.querySelector('.main-nav button'));
    assert.equal(scrolledTo, 'work');
    assert.equal(window.document.querySelector('.menu-trigger')!.getAttribute('aria-expanded'), 'false');
    assert.ok(window.document.querySelector('a[href="https://wmc.ms.wits.ac.za/students/sgroup3911/index.html"]'));
    await click(window.document.querySelector('.chapter-switcher button:nth-child(2)'));
    assert.ok(window.document.querySelector('.chapter-room'));
    assert.equal(document.querySelector('#thesis-project .cinema-caption strong')!.textContent, 'Sophomore Room');
    await click(document.querySelector('#thesis-project .chapter-switcher button:nth-child(3)'));
    assert.ok(document.querySelector('#thesis-project .chapter-final'));
    assert.equal(document.querySelector('#thesis-project .cinema-caption strong')!.textContent, 'Final Encounter');
    for (const theme of ['nebula', 'solar', 'orbit', 'nebula']) {
      await chooseTheme('.topbar .theme-picker select', theme);
    }
    const appearance = document.querySelector<HTMLDetailsElement>('.appearance-menu')!;
    const appearanceToggle = appearance.querySelector('summary')!;
    await click(appearanceToggle);
    assert.equal(appearance.open, true);
    await click(appearanceToggle);
    assert.equal(appearance.open, false, 'clicking the panel heading again collapses it');
    await click(appearanceToggle);
    await act(async () => { document.querySelector('h1')!.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true })); });
    assert.equal(appearance.open, false, 'clicking outside dismisses the panel');
    await click(appearanceToggle);
    await click(appearance.querySelector('[aria-label="Close appearance settings"]'));
    assert.equal(appearance.open, false, 'the explicit close control collapses the panel');
    assert.equal(document.activeElement, appearanceToggle);
    await click(appearanceToggle);
    await act(async () => { appearanceToggle.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
    assert.equal(appearance.open, false, 'Escape dismisses the panel');
    await click(appearanceToggle);
    await act(async () => { document.querySelector<HTMLSelectElement>('.topbar .theme-picker select')!.focus(); });
    assert.equal(appearance.open, false, 'moving focus outside dismisses the panel');
    await click(appearanceToggle);
    await click(appearance.querySelector('[role="group"] button:nth-child(3)'));
    assert.equal(appearance.open, false, 'selecting a footer theme collapses the panel');
    assert.equal(window.localStorage.getItem('zm-theme'), 'solar');
    await click(appearanceToggle);
    await click(appearance.querySelector('.motion-setting'));
    assert.equal(appearance.open, false, 'changing animation settings collapses the panel');
    assert.ok(document.querySelector('.motion-paused'));
    assert.equal(window.localStorage.getItem('zm-motion'), 'off');
    await click(appearanceToggle);
    assert.equal(appearance.querySelector('.motion-setting')!.textContent, 'Resume animations');
    await click(appearance.querySelector('.motion-setting'));
    assert.equal(appearance.open, false);
    assert.equal(document.querySelector('.motion-paused'), null);
    assert.equal(window.localStorage.getItem('zm-motion'), 'on');
    await click(window.document.querySelector('.brief-trigger'));
    assert.match(window.document.querySelector('.recruiter-brief')!.textContent!, /BSc Computer Science/);
    assert.deepEqual(Array.from(document.querySelectorAll('.brief-columns a strong')).map(element => element.textContent), ['Stockvel-Pro ↗', 'DevOps Practices ↗', 'Digital Logbook ↗', 'Thesis of the Dead ↗']);
    assert.match(document.querySelector('.recruiter-brief')!.textContent!, /Architecture planning, containerization and deployments/);
    await click(window.document.querySelector('[aria-label="Close recruiter brief"]'));
    const terminalToggle = document.querySelector<HTMLButtonElement>('.topbar [data-view="terminal"]')!;
    terminalToggle.focus();
    await click(terminalToggle);
    assert.equal(window.document.querySelector('.workspace-header [data-view="terminal"]')!.getAttribute('aria-pressed'), 'true');
    assert.ok(window.document.querySelector('.preview-stage .architecture-card'));
    assert.deepEqual(Array.from(document.querySelectorAll('.preview-tabs button')).map(element => element.textContent), ['Stockvel-Pro', 'DevOps Practices', 'Digital Logbook', 'Thesis of the Dead']);
    await command('get contact');
    assert.equal(window.document.querySelector('.terminal-layer')!.hasAttribute('hidden'), false, 'reading contact details stays in terminal');
    await command('get projects');
    assert.deepEqual(Array.from(document.querySelectorAll('.term-projects h3')).map(element => element.textContent), ['Stockvel-Pro', 'DevOps Practices', 'Digital Logbook', 'Thesis of the Dead']);
    await command('help');
    assert.equal(window.document.querySelectorAll('.term-help-grid button').length, 5);
    await command('cd ../');
    await command('cd Thesis_of_the_dead');
    await command('pwd');
    assert.match(window.document.querySelector('.terminal-output')!.textContent!, /\/home\/visitor\/Thesis_of_the_dead/);
    await command('open logbook');
    assert.ok(document.querySelector('.preview-stage .logbook-visual'));
    assert.ok(document.querySelector('.preview-stage .logbook-board'));
    assert.match(document.querySelector('.preview-description')!.textContent!, /Architecture planning, containerization and deployments/);
    assert.ok(document.querySelector('.preview-description a[href="https://github.com/logb945/Digital-Logbook"]'));
    assert.equal(document.querySelector('.preview-description a[href="https://digital-logbook-dhtq.onrender.com"]')!.textContent, 'Open app ↗');
    assert.match(document.querySelector('.terminal-line:last-child')!.textContent!, /My contribution:/);
    await click(document.querySelector('.preview-stage .logbook-view-switch button:nth-child(2)'));
    assert.ok(document.querySelector('.preview-stage .logbook-calendar'));
    await command('open devops');
    assert.ok(window.document.querySelector('.preview-stage .azure-visual'));
    await command('echo <img src=x onerror=alert(1)>');
    await command('history');
    assert.equal(window.document.querySelectorAll('.terminal-output img').length, 0);
    assert.match(window.document.querySelector('.terminal-output')!.textContent!, /<img src=x/);
    await key('ArrowUp');
    assert.equal(window.document.querySelector<HTMLInputElement>('#shell-input')!.value, 'history');
    await key('ArrowDown');
    assert.equal(window.document.querySelector<HTMLInputElement>('#shell-input')!.value, '');
    await command('theme solar');
    assert.ok(window.document.querySelector('.theme-solar'));
    assert.equal(document.querySelector<HTMLSelectElement>('.workspace-header .theme-picker select')!.value, 'solar', 'shell theme command updates the visible picker');
    await click(window.document.querySelector('.workspace-header [data-view="portfolio"]'));
    assert.equal(window.document.querySelector('.terminal-layer')!.hasAttribute('hidden'), true);
    assert.equal(document.body.style.overflow, '');
    assert.equal(document.activeElement, terminalToggle, 'switching back restores focus to the original terminal button');
    await click(window.document.querySelector('.topbar [data-view="terminal"]'));
    assert.match(window.document.querySelector('.terminal-output')!.textContent!, /echo <img/);
    await act(async () => { compact = true; compactListeners.forEach(callback => callback()); });
    await click(window.document.querySelector('.workspace-mobile-tabs button:nth-child(2)'));
    assert.ok(window.document.querySelector('.command-preview.mobile-active'));
    await click(window.document.querySelector('.workspace-header [data-view="portfolio"]'));
    await click(window.document.querySelector('.topbar [data-view="terminal"]'));
    assert.ok(window.document.querySelector('.workspace-terminal.mobile-active'), 'reopening always reveals the command line on mobile');
    await chooseTheme('.workspace-header .theme-picker select', 'orbit');
    await chooseTheme('.workspace-header .theme-picker select', 'nebula');
    await command('open thesis');
    assert.ok(window.document.querySelector('.command-preview.mobile-active .thesis-screen'));
    const sceneIds = Array.from(document.querySelectorAll('.cinema-scene [id]')).map(element => element.id);
    assert.equal(new Set(sceneIds).size, sceneIds.length, 'portfolio and terminal scenes use unique SVG references');
    assert.equal(window.document.querySelector('.preview-description a:last-child')!.getAttribute('href'), 'https://wmc.ms.wits.ac.za/students/sgroup3911/index.html');
    await click(window.document.querySelector('.workspace-mobile-tabs button:first-child'));
    await command('open work');
    assert.equal(window.document.querySelector('.terminal-layer')!.hasAttribute('hidden'), true);
    assert.equal(scrolledTo, 'work');
    await act(async () => { window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })); });
    assert.equal(window.document.querySelector('.terminal-layer')!.hasAttribute('hidden'), false);
    await act(async () => { window.document.querySelector<HTMLInputElement>('#shell-input')!.focus(); });
    await key('Escape');
    assert.equal(window.document.querySelector('.terminal-layer')!.hasAttribute('hidden'), true);
    await click(window.document.querySelector('.topbar [data-view="terminal"]'));
    await command('clear');
    assert.equal(window.document.querySelectorAll('.terminal-line').length, 0);
    await command('sudo make coffee');
    await command('matrix');
    assert.match(window.document.body.textContent!, /MATRIX MODE ACTIVE/);
    await click(window.document.querySelector('.matrix-exit'));
    await click(window.document.querySelector('.workspace-header [data-view="portfolio"]'));
    for (const index of [1, 2, 3]) {
      await click(window.document.querySelector('.arcade-grid button:nth-child(' + index + ')'));
      assert.ok(window.document.querySelector('.game-stage canvas'));
      await click(window.document.querySelector('.game-close'));
    }
    await chooseTheme('.topbar .theme-picker select', 'orbit');
    await act(async () => { root.render(<App key="return-visit" />); });
    assert.ok(document.querySelector('.site-shell.theme-orbit'), 'an Orbit choice made after migration still persists');
    window.localStorage.removeItem('zm-theme');
    window.localStorage.removeItem('zm-theme-default');
    await act(async () => { root.render(<App key="first-visit" />); });
    assert.ok(document.querySelector('.site-shell.theme-solar'), 'new visitors start in Solar');
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
  }
});
