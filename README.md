# Zamokuhle Maziya / ZM-OS

A React + TypeScript portfolio with a visual project workspace and a simulated Linux shell.

## Run locally

Use Node.js 22.12+ (Node.js 24 recommended).

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite (normally http://localhost:3000).

```sh
npm test
npm run typecheck
npm run build
npm run preview
```

The build produces a static site in `dist/`. Tailwind utilities are compiled locally; there is no runtime Tailwind CDN or Lottie dependency. Google Fonts are optional, with system fallbacks.

## Explore

- The fixed header keeps **Portfolio / Terminal** visible, including on phones. Switching back preserves your page position and terminal session.
- Solar is the default theme for visitors without a saved choice. The labelled **Theme** selector in both view headers switches between Orbit, Nebula and Solar, including on phones. **Appearance** in the footer also offers the themes and animation pause control. Both preferences persist locally, and reduced-motion system preferences are respected.
- The identity badge swings gently with its lanyard. Pause or resume it with the animation control in **Appearance**; reduced-motion preferences are respected. Drag the badge, or focus it and use arrow keys. Enter resets it.
- The footer **Appearance** panel closes when you select an option, click outside, move focus away, press Escape, click its close button, or toggle the heading again.
- Open the 30-second recruiter brief from the hero.
- Open the terminal using the view switch, hero button or Ctrl/⌘+K. Return with **Portfolio** or Escape. On desktop, projects appear to the left of the terminal. On small screens, use the Command line / Project visuals buttons; reopening always shows the command line.
- Project jump links lead to Stockvel-Pro, DevOps Practices, Digital Logbook, then Thesis of the Dead. This order is shared by the portfolio, terminal and recruiter brief.
- `get` commands display details inside the terminal; `open work`, `open stack`, `open about`, `open contact` and `open play` take you to the corresponding portfolio section.
- Select chapters in the Thesis illustration, services in the Stockvel diagram, or stages in the Azure flow.

```text
help                  # Five small command groups
help nav              # Navigation commands
help profile          # Skills, education, contact and recruiter brief
help system           # Shell utilities
help arcade           # Games and records
help themes           # Atmosphere and motion controls
open thesis           # Visual project display
open devops           # Infrastructure, containers, CI/CD and GitOps practices
open logbook          # Team planning app, visuals and my contribution
play thesis           # Direct link to the hosted game
cd ../
ls
cd Thesis_of_the_dead
cat README.md
neofetch
```

Use ↑/↓ for history, Tab for contextual completion, Ctrl+L to clear and Ctrl+C to cancel the current input. Shift+Tab leaves the input normally. Closing the workspace preserves the session until reload. The filesystem is virtual: no commands execute on the host or expose real files. Curious visitors can find an additional channel through `ls -a` or arcade milestones.

## Content and visuals

`portfolio.ts` contains shared project links, tools and contact details. Thesis of the Dead is credited as a team project. Its tools were checked against the sibling source checkout's package manifest, shaders, loaders, audio and test code. The hosted play URL is https://wmc.ms.wits.ac.za/students/sgroup3911/index.html and source is https://github.com/Taup178/Thesis_of_the_dead.

DevOps Practices links to https://github.com/Zamam03/Microsoft-Azure. Its summary and practice map reflect the repository's Terraform and ARM templates, Docker/Compose voting app, Kubernetes examples and documented Azure DevOps/ACR/ArgoCD workflow. `open azure` remains available alongside `open devops`.

Digital Logbook is the third project and is credited as a team project. My contribution was architecture planning, containerization and deployments. Its repository is https://github.com/logb945/Digital-Logbook and its hosted frontend is https://digital-logbook-dhtq.onrender.com. Tools and architecture were checked against the README, frontend and API gateway package manifests, Dockerfiles and repository tree. The Kanban, calendar and timeline display is an illustrative preview with sample entries, separate from the live app.

The chapter scenes are CSS illustrations, labelled accordingly; they are not screenshots or an embedded copy of the full game. The hero deployment board is a labelled simulation. `status` reports local browser values, not external service health.

## Verification

Shell tests cover navigation, completion, manuals, literal input, project actions and secret discovery. DOM interaction tests cover project ordering, view switching, mobile workspace state, focus restoration, keyboard shortcuts, theme persistence, recruiter brief, project previews, terminal history, safe rendering and opening all three arcade games. They do not replace visual or gameplay QA in a real browser.
