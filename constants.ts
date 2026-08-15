
export const terminalResponses: { [key: string]: string } = {
  'get education': `
    <span class="px-3 py-1 text-sm font-bold uppercase tracking-wider rounded bg-[#d4a657]/30 text-[#d4a657] border border-[#d4a657]/50 inline-block">EDUCATION</span><br>
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
    <span class="italic font-bold uppercase text-[#d4a657]">Bsc in Computer Science</span><br>
    University of the Witwatersrand <br>
    • Final Year Student<br><br>

    <span class="italic font-bold uppercase text-[#d4a657]">National Senior Certificate</span><br>
    Njeyeza Secondary School
    • Matriculated with Distinction<br>
  `,
  'get skills': `
    <span class="px-3 py-1 text-sm font-bold uppercase tracking-wider rounded bg-[#d4a657]/30 text-[#d4a657] border border-[#d4a657]/50 inline-block">TECHNICAL SKILLS</span><br>
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
    <span class="italic font-bold uppercase text-[#d4a657]">Programming Languages:</span> Python, Java, C++, JavaScript, SQL<br>
    <span class="italic font-bold uppercase text-[#d4a657]">Cloud Platforms:</span> Microsoft Azure, Firebase, Render<br>
    <span class="italic font-bold uppercase text-[#d4a657]">Containers:</span> Docker, Docker Compose, Kubernetes<br>
    <span class="italic font-bold uppercase text-[#d4a657]">Infrastructure as Code:</span> Terraform, Kubernetes YAML<br>
    <span class="italic font-bold uppercase text-[#d4a657]">CI/CD:</span> GitHub Actions, Azure DevOps<br>
    <span class="italic font-bold uppercase text-[#d4a657]">Version Control:</span> Git, GitHub<br>
    <span class="italic font-bold uppercase text-[#d4a657]">Operating Systems:</span> Linux, Windows
  `,

  'get projects': `
    <span class="px-3 py-1 text-sm font-bold uppercase tracking-wider rounded bg-[#d4a657]/30 text-[#d4a657] border border-[#d4a657]/50 inline-block">PROJECTS</span><br>
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
    <span class="italic font-bold uppercase text-[#d4a657]">Stockvel-Pro Microservice Platform</span>
    <a href="https://github.com/Zamam03/Stockvel-Microservice" target="_blank" class="text-[#d4a657] hover:underline ml-2">[GitHub]</a><br>
    • Designed and implemented a cloud-based microservices platform with an API Gateway and five backend services for auth, payments, meetings, analytics, and stockvel management.<br>
    • Developed GitHub Actions workflows to automate builds and deployments of the React frontend to Firebase Hosting and backend services to Render.<br>
    • Containerized backend services using Docker and Docker Compose for consistent development and deployment environments.<br>
    • Created Kubernetes Deployment, Service, ConfigMap, and Secret manifests for container orchestration.<br>
    • Integrated Firebase Authentication and Firestore with REST APIs built using Node.js and Express.<br>
    • Implemented environment-based configuration management and health checks to improve deployment reliability.<br>
    <span class="italic font-bold uppercase text-[#d4a657]">Technologies:</span> Node.js, Express, React, Firebase, Docker, Docker Compose, Kubernetes, GitHub Actions, Render.<br><br>

    <span class="italic font-bold uppercase text-[#d4a657]">DevOps Principles (Continuous Learning)</span>
    <a href="https://github.com/Zamam03/Microsoft-Azure" target="_blank" class="text-[#d4a657] hover:underline ml-2">[GitHub]</a><br>
    • Built Docker images for containerized applications.<br>
    • Stored container images in Azure Container Registry (ACR).<br>
    • Deployed applications using Kubernetes manifests.<br>
    • Explored GitOps deployment workflows using ArgoCD.<br>
    <span class="italic font-bold uppercase text-[#d4a657]">Technologies:</span> Azure, Docker, Kubernetes, Azure Container Registry, ArgoCD.
  `,
  'get contact': `
    <span class="px-3 py-1 text-sm font-bold uppercase tracking-wider rounded bg-[#d4a657]/30 text-[#d4a657] border border-[#d4a657]/50 inline-block">CONTACT INFORMATION</span><br>
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
    <span class="italic font-bold uppercase text-[#d4a657]">Email:</span> zamokuhlemaziya944@gmail.com<br>
    <span class="italic font-bold uppercase text-[#d4a657]">LinkedIn:</span> linkedin.com/in/zamokuhle-maziya<br>
    <span class="italic font-bold uppercase text-[#d4a657]">GitHub:</span> github.com/ZamokuhleMaziya<br>
    <span class="italic font-bold uppercase text-[#d4a657]">Location:</span> Johannesburg, South Africa<br><br>

    <span class="text-gray-400">Feel free to reach out for DevOps roles or collaborations!</span>
  `,
  'help': `
    <span class="px-3 py-1 text-sm font-bold uppercase tracking-wider rounded bg-[#d4a657]/30 text-[#d4a657] border border-[#d4a657]/50 inline-block">AVAILABLE COMMANDS</span><br>
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
    • <span class="px-2 py-0.5 bg-blue-900/40 text-blue-300 rounded border border-blue-500/30 font-mono text-sm">get education</span> - View educational background<br>
    • <span class="px-2 py-0.5 bg-blue-900/40 text-blue-300 rounded border border-blue-500/30 font-mono text-sm">get skills</span> - See technical skills<br>
    • <span class="px-2 py-0.5 bg-blue-900/40 text-blue-300 rounded border border-blue-500/30 font-mono text-sm">get projects</span> - Explore key projects<br>
    • <span class="px-2 py-0.5 bg-blue-900/40 text-blue-300 rounded border border-blue-500/30 font-mono text-sm">get contact</span> - Get contact information<br>
    • <span class="px-2 py-0.5 bg-purple-900/40 text-purple-300 rounded border border-purple-500/30 font-mono text-sm">hire me</span> - View reasons to hire me<br>
    • <span class="px-2 py-0.5 bg-cyan-900/40 text-cyan-300 rounded border border-cyan-500/30 font-mono text-sm">play bird</span> - Start Flappy Bird game<br>
    • <span class="px-2 py-0.5 bg-cyan-900/40 text-cyan-300 rounded border border-cyan-500/30 font-mono text-sm">stop bird</span> - Stop the game<br>
    • <span class="px-2 py-0.5 bg-green-900/40 text-green-300 rounded border border-green-500/30 font-mono text-sm">play snake</span> - Start Snake game<br>
    • <span class="px-2 py-0.5 bg-green-900/40 text-green-300 rounded border border-green-500/30 font-mono text-sm">stop snake</span> - Stop Snake game<br>
    • <span class="px-2 py-0.5 bg-yellow-900/40 text-yellow-300 rounded border border-yellow-500/30 font-mono text-sm">play pacman</span> - Start Pac-Man game<br>
    • <span class="px-2 py-0.5 bg-yellow-900/40 text-yellow-300 rounded border border-yellow-500/30 font-mono text-sm">stop pacman</span> - Stop Pac-Man game<br>
    • <span class="px-2 py-0.5 bg-emerald-900/40 text-emerald-300 rounded border border-emerald-500/30 font-mono text-sm">start animation</span> - Make elements move<br>
    • <span class="px-2 py-0.5 bg-emerald-900/40 text-emerald-300 rounded border border-emerald-500/30 font-mono text-sm">stop animation</span> - Stop automatic animation<br>
    • <span class="px-2 py-0.5 bg-gray-700/40 text-gray-300 rounded border border-gray-500/30 font-mono text-sm">help</span> - Show this help menu<br>
    • <span class="px-2 py-0.5 bg-gray-700/40 text-gray-300 rounded border border-gray-500/30 font-mono text-sm">clear</span> - Clear the terminal<br>
  `,
  'start animation': `
    <span class="text-green-400">ANIMATION ACTIVATED</span><br>
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
    The name tag and background elements are now dancing!<br>
    Type <strong>stop animation</strong> to end the show.
  `,
  'stop animation': `
    <span class="text-yellow-400">ANIMATION STOPPED</span><br>
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
    Everything has returned to normal.
  `,
  'play bird': `
    <span class="text-cyan-400">FLAPPY BIRD ACTIVATED</span><br>
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
    Use <strong>SPACEBAR</strong> to flap!<br>
    Type <strong>stop bird</strong> to exit.
  `,
  'stop bird': `
    <span class="text-cyan-400">BIRD STOPPED</span><br>
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
    Hope you had fun!
  `,
  'play snake': `
    <span class="text-green-400">SNAKE GAME ACTIVATED</span><br>
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
    Use <strong>ARROW KEYS</strong> to move!<br>
    Type <strong>stop snake</strong> to exit.
  `,
  'stop snake': `
    <span class="text-green-400">SNAKE STOPPED</span><br>
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
    Hope you had fun!
  `,
  'play pacman': `
    <span class="text-yellow-400">PAC-MAN GAME ACTIVATED</span><br>
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
    Use <strong>ARROW KEYS</strong> or <strong>WASD</strong> to navigate!<br>
    Type <strong>stop pacman</strong> to exit.
  `,
  'stop pacman': `
    <span class="text-yellow-400">PAC-MAN STOPPED</span><br>
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
    Hope you had fun!
  `,
  'hire me': `
    <span class="text-purple-400">HIRE ME PRESENTATION</span><br>
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
    Showing why you should hire me...
  `,
  'matrix': `
    <span class="text-green-400">ACTIVATING MATRIX MODE...</span><br>
    <span class="text-green-500">01001001 01001110 01001001 01010100 00100000 01010011 01000101 01010001 01010101 01000101 01001110 01000011 01000101</span>
  `
};

export const hireMeSlides = [
    {
        url: 'https://dl.dropboxusercontent.com/scl/fi/3xla38mr6xsxoqtixwey3/Artificial-Intelligence-Chatbot.json?rlkey=7uyra2thvhad6fvg3bg3hjrfu&st=svlakgp3&dl=0',
        text: 'I streamline DevOps processes to boost efficiency and scalability.'
    },
    {
        url: 'https://dl.dropboxusercontent.com/scl/fi/svxa2hrvrjgab4o77fahr/Designer.json?rlkey=4srjateuuuo5b4m2delhrf03n&st=hksdm1cl&dl=0',
        text: 'I design intuitive dashboards that make DevOps collaboration seamless.'
    },
    {
        url: 'https://dl.dropboxusercontent.com/scl/fi/0y0k15li4ikrhiigdsb2v/Man-checking-marketing-strategy.json?rlkey=fcryr8sfipiryo2qsxfexb2kp&st=7vhrhwml&dl=0',
        text: 'I create strategies that drive continuous DevOps improvement and growth.'
    },
    {
        url: 'https://dl.dropboxusercontent.com/scl/fi/ua3ihvvoc5h907l44xxa6/Meditation.json?rlkey=r38sf86zt2bs3mfk54ie6az7p&st=qpk8asnj&dl=0',
        text: 'I stay focused under pressure, delivering reliable DevOps solutions.'
    },
    {
        url: 'https://dl.dropboxusercontent.com/scl/fi/5ew9ur08g5pwklr11lfiu/Meeting-Time.json?rlkey=ahkrpz4mdml8dc52am6rza3vs&st=wwufwfjl&dl=0',
        text: 'I align DevOps workflows with business goals through clear communication.'
    },
    {
        url: 'https://dl.dropboxusercontent.com/scl/fi/04owiiwchvlyezkfi1k16/Sandy-Loading.json?rlkey=uhwewb8pa5lmh7qtovr9ez606&st=st683zid&dl=0',
        text: 'I deliver DevOps projects on time without compromising quality.'
    },
    {
        url: 'https://dl.dropboxusercontent.com/scl/fi/xo9eonp529xixrjwybe4m/Search.json?rlkey=cbej12kfs20v6accmy7j4enm2&st=3717sk08&dl=0',
        text: 'I implement modern DevOps tools to optimize workflows and security.'
    },
    {
        url: 'https://dl.dropboxusercontent.com/scl/fi/1ng5nuq26p3aipx0crf33/timeline.json?rlkey=encgl7b3vbq5gt4ht8fvgwa23&st=lz7e0j00&dl=0',
        text: 'I manage timelines effectively, ensuring continuous delivery cycles.'
    },
    {
        url: 'https://dl.dropboxusercontent.com/scl/fi/40mtrwk9d9fq7ilc2duml/Businessman-looking-for-career-opportunities.json?rlkey=9352y8ti18hz8xtjq9u9y6mpu&st=w8o90gw6&dl=0',
        text: 'I bring DevOps expertise and strong work ethics to fuel company growth.'
    }
];

export const birdFacts = [
    "Birds are descendants of dinosaurs!",
    "The bee hummingbird is the smallest bird in the world.",
    "Penguins are birds that cannot fly but are excellent swimmers.",
    "Some birds can see ultraviolet light.",
    "The wandering albatross has the largest wingspan of any bird.",
    "Owls can rotate their heads up to 270 degrees.",
    "Flamingos get their pink color from the food they eat.",
    "The fastest bird is the peregrine falcon, diving at over 240 mph.",
    "The Arctic tern migrates the farthest, traveling up to 44,000 miles yearly.",
    "The common swift can stay airborne for up to 10 months without landing."
];

export const snakeFacts = [
    "Snakes smell with their tongues.",
    "There are over 3,000 species of snakes.",
    "Snakes can dislocate their jaws to eat prey larger than their heads.",
    "The reticulated python is the longest snake in the world.",
    "The black mamba is the fastest snake, slithering up to 12 mph (20 km/h).",
    "Pit vipers (like rattlesnakes) have heat-sensing pits to detect warm-blooded prey.",
    "Snakes are found on every continent except Antarctica.",
    "The paradise flying snake flattens its body to glide between trees.",
    "Snakes have been around for over 100 million years, evolving from lizards.",
    "The green anaconda is the heaviest snake, weighing over 500 lbs (227 kg)."
];

export const pacmanFacts = [
    "Pac-Man was created by Toru Iwatani in 1980.",
    "The original name was Puck Man, derived from the Japanese phrase 'Paku paku' (munch munch).",
    "Each ghost has distinct AI behavior: Blinky chases, Pinky targets ahead, Inky ambushes, Clyde wanders.",
    "Pac-Man is the highest-grossing arcade game of all time.",
    "The maximum possible score in Pac-Man is 3,333,360 points.",
    "Billy Mitchell was the first player to achieve a perfect Pac-Man score in 1999.",
    "The 256th level contains a famous split-screen glitch due to an 8-bit integer overflow.",
    "Power Pellets make ghosts turn blue and vulnerable for a short duration."
];
