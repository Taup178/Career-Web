import test from 'node:test';
import assert from 'node:assert/strict';
import { ROOT, HOME, completeCommand, runShell, manuals } from '../shell.ts';

const state = { cwd: ROOT, history: [], unlocked: false, theme: 'orbit' };

test('directory traversal resolves parent, sibling, absolute and dot paths', () => {
  const parent = runShell('cd ../', state);
  assert.equal(parent.cwd, HOME);
  const listing = runShell('ls', { ...state, cwd: parent.cwd });
  assert.match(listing.text, /Thesis_of_the_dead\//);
  const sibling = runShell('cd Thesis_of_the_dead', { ...state, cwd: HOME });
  assert.equal(sibling.cwd, HOME + '/Thesis_of_the_dead');
  assert.equal(sibling.action, 'open thesis');
  assert.match(runShell('cat README.md', { ...state, cwd: sibling.cwd }).text, /Three.js/);
  assert.equal(runShell('cd ../Career-Web/./work/..', { ...state, cwd: sibling.cwd }).cwd, ROOT);
  assert.equal(runShell('cd /etc', state).cwd, undefined);
});

test('help stays grouped and each advertised command resolves', () => {
  assert.deepEqual(runShell('help', state), { view: 'help', subject: undefined });
  for (const [group, page] of Object.entries(manuals)) {
    assert.equal(runShell('help ' + group, state).subject, group);
    for (const [command] of page.commands) {
      const result = runShell(command, state);
      assert.ok(!result.text?.includes('command not found'), command);
    }
  }
});

test('completion understands current paths and preserves project filename case', () => {
  assert.deepEqual(completeCommand('cd Th', HOME), ['cd Thesis_of_the_dead']);
  assert.deepEqual(completeCommand('cat pack', HOME + '/Thesis_of_the_dead'), ['cat package.json']);
  assert.deepEqual(completeCommand('theme n', ROOT), ['theme nebula']);
});

test('echo and history preserve literal input including markup', () => {
  assert.equal(runShell('echo Hello WORLD', state).text, 'Hello WORLD');
  assert.equal(runShell('echo "<img src=x onerror=alert(1)>"', state).text, '<img src=x onerror=alert(1)>');
  assert.match(runShell('history', { ...state, history: ['echo <b>hi</b>'] }).text, /echo <b>hi<\/b>/);
});

test('unknown names cannot resolve to JavaScript prototype properties', () => {
  for (const command of ['constructor', '__proto__', 'help constructor', 'help __proto__']) {
    const result = runShell(command, state);
    assert.equal(result.view, undefined);
    assert.equal(typeof result.text, 'string');
  }
});

test('classified discovery respects access and does not run a real shell', () => {
  assert.match(runShell('matrix', state).text, /locked/);
  assert.match(runShell('ls -a', state).text, /\.mission/);
  assert.match(runShell('cat .mission', state).text, /sudo make coffee/);
  assert.equal(runShell('sudo make coffee', state).action, 'unlock');
  assert.equal(runShell('matrix', { ...state, unlocked: true }).action, 'matrix');
  assert.match(runShell('rm -rf /', state).text, /does not execute/);
});

test('Thesis actions expose verified project and hosted-play links', () => {
  assert.equal(runShell('open thesis', state).subject, 'thesis');
  assert.equal(runShell('play thesis', state).view, 'links');
  assert.equal(runShell('get projects', state).view, 'projects');
});
