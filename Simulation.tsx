import React, { useRef, useEffect } from 'react';

type Vec3Type = { x: number; y: number; z: number };

// A single Vector3 implementation to avoid class instances in React state
const Vec3 = {
  create: (x = 0, y = 0, z = 0): Vec3Type => ({ x, y, z }),
  add: (v1: Vec3Type, v2: Vec3Type): Vec3Type => ({ x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z }),
  subtract: (v1: Vec3Type, v2: Vec3Type): Vec3Type => ({ x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z }),
  multiply: (v: Vec3Type, s: number): Vec3Type => ({ x: v.x * s, y: v.y * s, z: v.z * s }),
  divide: (v: Vec3Type, s: number): Vec3Type => (s !== 0 ? { x: v.x / s, y: v.y / s, z: v.z / s } : { x: 0, y: 0, z: 0 }),
  length: (v: Vec3Type) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),
  normalize: (v: Vec3Type): Vec3Type => {
    const len = Vec3.length(v);
    return len > 0 ? Vec3.divide(v, len) : { x: 0, y: 0, z: 0 };
  },
};

interface HandwrittenCodeProps {
    top: string;
    left: string;
    rotation: number;
    children: React.ReactNode;
    dark?: boolean;
    light?: boolean;
    isAnimating: boolean;
}

const HandwrittenCode: React.FC<HandwrittenCodeProps> = ({ top, left, rotation, children, dark, light, isAnimating }) => {
    const animationDelay = `${Math.random() * 2}s`;
    const animationDuration = `${3 + Math.random() * 2}s`;

    return (
        <div 
            className={`absolute pointer-events-none transition-transform duration-1000 ease-in-out ${isAnimating ? 'animate-dance' : ''}`}
            style={{ 
                top, 
                left,
                animationDelay: isAnimating ? animationDelay : '0s',
                animationDuration: isAnimating ? animationDuration : '0s',
            }}
        >
            <div
                className={`font-handwritten text-[rgba(91,60,17,0.55)] text-base md:text-xl xl:text-2xl whitespace-pre leading-snug transition-transform duration-500 ease-out ${dark ? 'text-[rgba(91,60,17,0.7)]' : ''} ${light ? 'text-[rgba(91,60,17,0.4)]' : ''}`}
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                {children}
            </div>
        </div>
    );
};

const AcademicDoodle: React.FC<{ top: string; left: string; rotation?: number; isAnimating: boolean; children: React.ReactNode }> = ({ top, left, rotation = 0, isAnimating, children }) => {
    return (
        <div 
            className={`absolute pointer-events-none transition-transform duration-1000 ease-in-out scale-90 md:scale-110 xl:scale-125 origin-top-left ${isAnimating ? 'animate-dance' : ''}`}
            style={{ 
                top, 
                left,
                transform: `rotate(${rotation}deg)`,
                opacity: 0.5,
            }}
        >
            {children}
        </div>
    );
};

const S = 'rgba(91,60,17,0.65)';

const BeakerDoodle = () => (
    <svg width="60" height="85" viewBox="0 0 60 85" fill="none">
        <path d="M18 10 L18 40 L8 72 Q6 80 14 80 L46 80 Q54 80 52 72 L42 40 L42 10 Z" stroke={S} strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
        <line x1="14" y1="10" x2="46" y2="10" stroke={S} strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M12 62 Q30 55 48 62 L52 72 Q50 79 46 79 L14 79 Q10 79 8 72 Z" fill={S} opacity="0.2"/>
        <circle cx="24" cy="68" r="2.5" stroke={S} strokeWidth="1.2" fill="none"/>
        <circle cx="35" cy="65" r="1.8" stroke={S} strokeWidth="1.2" fill="none"/>
        <line x1="18" y1="30" x2="24" y2="30" stroke={S} strokeWidth="1"/>
        <line x1="18" y1="45" x2="24" y2="45" stroke={S} strokeWidth="1"/>
    </svg>
);

const LineGraphDoodle = () => (
    <svg width="100" height="75" viewBox="0 0 110 80" fill="none">
        <line x1="10" y1="70" x2="105" y2="70" stroke={S} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="10" y1="10" x2="10"  y2="70" stroke={S} strokeWidth="1.5" strokeLinecap="round"/>
        <polyline points="10,60 28,45 46,50 64,28 82,32 100,12" stroke={S} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="28" cy="45" r="2.5" fill={S}/>
        <circle cx="64" cy="28" r="2.5" fill={S}/>
        <circle cx="100" cy="12" r="2.5" fill={S}/>
        <text x="20" y="78" fontSize="10" fill={S} fontFamily="Caveat, cursive">Data Metrics</text>
    </svg>
);

const BarChartDoodle = () => (
    <svg width="95" height="75" viewBox="0 0 95 75" fill="none">
        <line x1="8" y1="65" x2="90" y2="65" stroke={S} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8" y1="8"  x2="8"  y2="65" stroke={S} strokeWidth="1.5" strokeLinecap="round"/>
        {([{x:14,h:30},{x:30,h:48},{x:46,h:22},{x:62,h:40},{x:78,h:55}]).map(({x,h},i)=>(
            <rect key={i} x={x} y={65-h} width="12" height={h} fill="none" stroke={S} strokeWidth="1.4" rx="1"/>
        ))}
        <text x="10" y="73" fontSize="10" fill={S} fontFamily="Caveat, cursive">Deployments</text>
    </svg>
);

const MathFormulaDoodle = () => (
    <svg width="130" height="65" viewBox="0 0 130 65" fill="none">
        <text x="4" y="18" fontSize="13" fill={S} fontFamily="Caveat, cursive" fontWeight="bold">E = mc²</text>
        <text x="4" y="36" fontSize="11" fill={S} fontFamily="Caveat, cursive">{'∫ f(x)dx = F(x) + C'}</text>
        <text x="4" y="54" fontSize="10" fill={S} fontFamily="Caveat, cursive">{'O(n log n)'}</text>
    </svg>
);

const FlaskDoodle = () => (
    <svg width="60" height="80" viewBox="0 0 65 90" fill="none">
        <rect x="24" y="8" width="17" height="22" rx="2" stroke={S} strokeWidth="1.5" fill="none"/>
        <rect x="21" y="5" width="23" height="6" rx="2" stroke={S} strokeWidth="1.4" fill="none"/>
        <path d="M24 30 L8 75 Q5 84 14 84 L51 84 Q60 84 57 75 L41 30 Z" stroke={S} strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
        <path d="M12 65 Q32.5 56 53 65 L57 75 Q54 83 51 83 L14 83 Q11 83 8 75 Z" fill={S} opacity="0.2"/>
        <circle cx="28" cy="72" r="2" stroke={S} strokeWidth="1.1" fill="none"/>
        <circle cx="40" cy="69" r="1.5" stroke={S} strokeWidth="1.1" fill="none"/>
    </svg>
);

const BinaryTreeDoodle = () => (
    <svg width="120" height="85" viewBox="0 0 120 85" fill="none">
        <circle cx="60" cy="12" r="8" stroke={S} strokeWidth="1.4" fill="none"/>
        <text x="55" y="16" fontSize="9" fill={S} fontFamily="Caveat, cursive">42</text>
        <circle cx="30" cy="38" r="8" stroke={S} strokeWidth="1.4" fill="none"/>
        <text x="25" y="42" fontSize="9" fill={S} fontFamily="Caveat, cursive">18</text>
        <circle cx="90" cy="38" r="8" stroke={S} strokeWidth="1.4" fill="none"/>
        <text x="85" y="42" fontSize="9" fill={S} fontFamily="Caveat, cursive">67</text>
        <circle cx="14" cy="64" r="7" stroke={S} strokeWidth="1.3" fill="none"/>
        <circle cx="46" cy="64" r="7" stroke={S} strokeWidth="1.3" fill="none"/>
        <circle cx="76" cy="64" r="7" stroke={S} strokeWidth="1.3" fill="none"/>
        <circle cx="106" cy="64" r="7" stroke={S} strokeWidth="1.3" fill="none"/>
        <line x1="53" y1="18" x2="37" y2="30" stroke={S} strokeWidth="1.2"/>
        <line x1="67" y1="18" x2="83" y2="30" stroke={S} strokeWidth="1.2"/>
        <line x1="23" y1="44" x2="19" y2="57" stroke={S} strokeWidth="1.2"/>
        <line x1="37" y1="44" x2="41" y2="57" stroke={S} strokeWidth="1.2"/>
        <line x1="83" y1="44" x2="79" y2="57" stroke={S} strokeWidth="1.2"/>
        <line x1="97" y1="44" x2="103" y2="57" stroke={S} strokeWidth="1.2"/>
        <text x="20" y="82" fontSize="9" fill={S} fontFamily="Caveat, cursive">Binary Search Tree</text>
    </svg>
);

const PhysicsDoodle = () => (
    <svg width="130" height="60" viewBox="0 0 130 60" fill="none">
        <text x="4" y="18" fontSize="12" fill={S} fontFamily="Caveat, cursive" fontWeight="bold">F = m · a</text>
        <text x="4" y="36" fontSize="10" fill={S} fontFamily="Caveat, cursive">{'P(A|B) = P(A∩B)/P(B)'}</text>
        <text x="4" y="52" fontSize="10" fill={S} fontFamily="Caveat, cursive">{'∇ × B = μ₀J'}</text>
    </svg>
);


interface Particle {
  position: Vec3Type;
  velocity: Vec3Type;
  acceleration: Vec3Type;
  mass: number;
  fixed: boolean;
}

interface Spring {
  a: number;
  b: number;
  k: number;
  restLength: number;
}

const Simulation: React.FC<{ isAnimating: boolean }> = ({ isAnimating }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nameTagRef = useRef<HTMLDivElement>(null);
  const fixedPointRef = useRef<HTMLDivElement>(null);
  
  const state = useRef<{
    particles: Particle[];
    springs: Spring[];
    isDragging: boolean;
    draggedParticleIndex: number;
    dragOffset: Vec3Type;
    prevMousePos: Vec3Type;
    mouseDelta: Vec3Type;
    animationFrameId: number;
    autoAnimationStartTime: number;
  }>({
    particles: [],
    springs: [],
    isDragging: false,
    draggedParticleIndex: -1,
    dragOffset: Vec3.create(),
    prevMousePos: Vec3.create(),
    mouseDelta: Vec3.create(),
    animationFrameId: 0,
    autoAnimationStartTime: 0,
  }).current;

  useEffect(() => {
    const canvas = canvasRef.current;
    const nameTag = nameTagRef.current;
    const fixedPoint = fixedPointRef.current;
    const container = containerRef.current;
    if (!canvas || !nameTag || !fixedPoint || !container) return;

    const ctx = canvas.getContext('2d');
    const gravity = Vec3.create(0, 0.1, 0);
    let numParticles: number;
    let spacing: number;
    const k = 0.1;

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

    const init = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const isMobile = window.innerWidth < 1024;
        numParticles = isMobile ? 12 : 15;
        spacing = isMobile ? 20 : 20;

        const simRect = container.getBoundingClientRect();
        const startX = simRect.left + simRect.width / 2;
        const startY = simRect.top + 20;
        
        fixedPoint.style.left = `${startX - 8}px`;
        fixedPoint.style.top = `${startY - 4}px`;

        if (state.particles.length === 0) {
          for (let i = 0; i < numParticles; i++) {
              state.particles.push({
                  position: Vec3.create(startX, startY + i * spacing),
                  velocity: Vec3.create(),
                  acceleration: Vec3.create(),
                  mass: 10,
                  fixed: i === 0,
              });
          }

          for (let i = 1; i < numParticles; i++) {
              state.springs.push({ a: i, b: i - 1, k, restLength: spacing });
          }
        } else {
          state.particles[0].position = Vec3.create(startX, startY);
        }
    };
    
    const updateNameTagPosition = () => {
        if (state.particles.length < 2) return;
        const numP = state.particles.length;
        const lastParticle = state.particles[numP - 1];
        const prevParticle = state.particles[numP - 2];
        const { x, y } = lastParticle.position;
        
        // Calculate rope swing angle (Z rotation)
        const dx = lastParticle.position.x - prevParticle.position.x;
        const dy = lastParticle.position.y - prevParticle.position.y;
        const angleRad = Math.atan2(dx, dy);
        const tiltZ = clamp(angleRad * (180 / Math.PI) * 0.75, -40, 40);

        // 3D tilt X & Y based on particle velocity and mouse movement
        const velX = lastParticle.velocity.x;
        const velY = lastParticle.velocity.y;
        const mouseDeltaX = state.isDragging ? state.mouseDelta.x : 0;
        const mouseDeltaY = state.isDragging ? state.mouseDelta.y : 0;

        const maxRotation = 25;
        const rotateY = clamp(-velX * 1.5 - mouseDeltaX * 0.8, -maxRotation, maxRotation);
        const rotateX = clamp(velY * 1.2 + mouseDeltaY * 0.8, -maxRotation, maxRotation);
        
        nameTag.style.left = `${x}px`;
        nameTag.style.top = `${y}px`;
        nameTag.style.transform = `translate(-50%, -12px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${tiltZ}deg)`;
    };
    
    const animate = () => {
        // Update particles
        state.particles.forEach(p => {
            if (p.fixed) return;
            p.acceleration = Vec3.add(p.acceleration, Vec3.divide(gravity, p.mass));
            p.velocity = Vec3.multiply(p.velocity, 0.99);
            p.velocity = Vec3.add(p.velocity, p.acceleration);
            p.position = Vec3.add(p.position, p.velocity);
            p.acceleration = Vec3.create();
        });

        // Update springs
        state.springs.forEach(s => {
            const pA = state.particles[s.a];
            const pB = state.particles[s.b];
            const force = Vec3.subtract(pB.position, pA.position);
            const currentLength = Vec3.length(force);
            const stretch = currentLength - s.restLength;
            const springForce = Vec3.multiply(Vec3.normalize(force), s.k * stretch);
            if (!pA.fixed) pA.acceleration = Vec3.add(pA.acceleration, Vec3.divide(springForce, pA.mass));
            if (!pB.fixed) pB.acceleration = Vec3.add(pB.acceleration, Vec3.divide(Vec3.multiply(springForce, -1), pB.mass));
        });

        if (isAnimating) {
            if(state.autoAnimationStartTime === 0) state.autoAnimationStartTime = Date.now();
            const elapsed = Date.now() - state.autoAnimationStartTime;
            const period = 3000;
            const t = elapsed / period;
            const anchor = state.particles[0].position;
            const x = anchor.x + Math.sin(t * Math.PI * 2) * 100;
            const y = anchor.y + (numParticles - 1) * spacing + Math.cos(t * Math.PI * 2) * 50;
            state.particles[numParticles - 1].position = Vec3.create(x, y);
            state.particles[numParticles - 1].velocity = Vec3.create();
        } else {
             state.autoAnimationStartTime = 0;
        }

        // Always update nametag position synchronously with physics
        updateNameTagPosition();

        // Draw
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const lastParticle = state.particles[state.particles.length - 1];
            const speed = lastParticle ? Vec3.length(lastParticle.velocity) : 0;
            const isMoving = isAnimating || state.isDragging || speed > 0.5;

            // Animate name tag shadow
            const targetFilter = isMoving ? 'drop-shadow(4px 10px 8px rgba(0,0,0,0.3))' : 'drop-shadow(2px 4px 4px rgba(0,0,0,0.15))';
            if (nameTag.style.filter !== targetFilter) {
                nameTag.style.transition = 'filter 0.3s ease';
                nameTag.style.filter = targetFilter;
            }

            if (isMoving) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 3;
                ctx.shadowOffsetY = 6;
            }

            // Draw smooth rope
            if (state.particles.length > 1) {
                ctx.beginPath();
                ctx.moveTo(state.particles[0].position.x, state.particles[0].position.y);
                
                let i;
                for (i = 1; i < state.particles.length - 2; i++) {
                    const xc = (state.particles[i].position.x + state.particles[i + 1].position.x) / 2;
                    const yc = (state.particles[i].position.y + state.particles[i + 1].position.y) / 2;
                    ctx.quadraticCurveTo(state.particles[i].position.x, state.particles[i].position.y, xc, yc);
                }
                ctx.quadraticCurveTo(
                    state.particles[i].position.x,
                    state.particles[i].position.y,
                    state.particles[i + 1].position.x,
                    state.particles[i + 1].position.y
                );
                
                ctx.strokeStyle = '#7a4018';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            if (isMoving) {
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }
        }

        state.animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleMouseDown = (e: Event) => {
      e.preventDefault();
      const evt = e as MouseEvent | TouchEvent;
      const clientX = 'touches' in evt ? evt.touches[0].clientX : evt.clientX;
      const clientY = 'touches' in evt ? evt.touches[0].clientY : evt.clientY;
      const lastParticle = state.particles[numParticles - 1];
      state.dragOffset = Vec3.create(clientX - lastParticle.position.x, clientY - lastParticle.position.y);
      state.isDragging = true;
      state.draggedParticleIndex = numParticles - 1;
      state.prevMousePos = Vec3.create(clientX, clientY);
      state.mouseDelta = Vec3.create();
    };

    const handleMouseMove = (e: Event) => {
      if (!state.isDragging) return;
      const evt = e as MouseEvent | TouchEvent;
      const clientX = 'touches' in evt ? evt.touches[0].clientX : evt.clientX;
      const clientY = 'touches' in evt ? evt.touches[0].clientY : evt.clientY;
      const mouseX = clientX - state.dragOffset.x;
      const mouseY = clientY - state.dragOffset.y;
      state.particles[state.draggedParticleIndex].position = Vec3.create(mouseX, mouseY);
      state.particles[state.draggedParticleIndex].velocity = Vec3.create();
      
      const deltaX = clientX - state.prevMousePos.x;
      const deltaY = clientY - state.prevMousePos.y;
      state.mouseDelta = Vec3.create(deltaX, deltaY);
      state.prevMousePos = Vec3.create(clientX, clientY);
    };
    
    const handleMouseUp = () => {
      state.isDragging = false;
      state.draggedParticleIndex = -1;
      state.mouseDelta = Vec3.create();
    };

    nameTag.addEventListener('mousedown', handleMouseDown);
    nameTag.addEventListener('touchstart', handleMouseDown, { passive: false });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('resize', init);
    window.addEventListener('scroll', init);

    return () => {
      cancelAnimationFrame(state.animationFrameId);
      nameTag.removeEventListener('mousedown', handleMouseDown);
      nameTag.removeEventListener('touchstart', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('resize', init);
      window.removeEventListener('scroll', init);
    };
  }, [isAnimating, state]);

  const { horizontalTearPoints, verticalTearPoints } = React.useMemo(() => {
    const horizontal = "0,0 100,0 " + Array.from({ length: 50 }).map((_, i) => `${100 - i * 2},${Math.random() * 10}`).join(' ');
    const vertical = "0,0 0,100 " + Array.from({ length: 50 }).map((_, i) => `${Math.random() * 10},${100 - i * 2}`).join(' ');
    return { horizontalTearPoints: horizontal, verticalTearPoints: vertical };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-sim-bg overflow-hidden select-none">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-30" />

      {/* Top-left quadrant */}
      <HandwrittenCode top="6%" left="4%" rotation={-10} dark isAnimating={isAnimating}>
        {`class DevOpsEngineer {\n  constructor() {\n    this.skills = ['Azure', 'K8s'];\n  }\n}`}
      </HandwrittenCode>
      <AcademicDoodle top="4%" left="32%" rotation={5} isAnimating={isAnimating}>
        <PhysicsDoodle />
      </AcademicDoodle>
      <AcademicDoodle top="18%" left="24%" rotation={6} isAnimating={isAnimating}>
        <BeakerDoodle />
      </AcademicDoodle>

      {/* Top-right quadrant */}
      <HandwrittenCode top="4%" left="56%" rotation={12} dark isAnimating={isAnimating}>
        {`SELECT user, role\nFROM permissions\nWHERE project = 'Portfolio';`}
      </HandwrittenCode>
      <HandwrittenCode top="6%" left="80%" rotation={-8} light isAnimating={isAnimating}>
        {`import torch\nimport numpy as np`}
      </HandwrittenCode>
      <AcademicDoodle top="18%" left="82%" rotation={-5} isAnimating={isAnimating}>
        <LineGraphDoodle />
      </AcademicDoodle>

      {/* Middle-left */}
      <AcademicDoodle top="24%" left="12%" rotation={4} isAnimating={isAnimating}>
        <BinaryTreeDoodle />
      </AcademicDoodle>
      <HandwrittenCode top="40%" left="3%" rotation={-14} dark isAnimating={isAnimating}>
        {`sudo apt-get update &&\nsudo apt-get upgrade -y`}
      </HandwrittenCode>
      <AcademicDoodle top="56%" left="15%" rotation={-8} isAnimating={isAnimating}>
        <FlaskDoodle />
      </AcademicDoodle>

      {/* Middle-center */}
      <AcademicDoodle top="20%" left="46%" rotation={-6} isAnimating={isAnimating}>
        <BarChartDoodle />
      </AcademicDoodle>
      <HandwrittenCode top="32%" left="38%" rotation={-3} light isAnimating={isAnimating}>
        {`git commit -m "feat: release"\ngit push origin main`}
      </HandwrittenCode>

      {/* Middle-right */}
      <HandwrittenCode top="34%" left="74%" rotation={-6} light isAnimating={isAnimating}>
        {`helm upgrade --install\napp-release ./chart`}
      </HandwrittenCode>
      <HandwrittenCode top="48%" left="60%" rotation={7} isAnimating={isAnimating}>
        {`kubectl apply -f deployment.yaml\n--namespace=production`}
      </HandwrittenCode>
      <AcademicDoodle top="48%" left="84%" rotation={10} isAnimating={isAnimating}>
        <MathFormulaDoodle />
      </AcademicDoodle>

      {/* Bottom-left */}
      <HandwrittenCode top="68%" left="4%" rotation={6} light isAnimating={isAnimating}>
        {`terraform init\nterraform plan\nterraform apply`}
      </HandwrittenCode>
      <HandwrittenCode top="84%" left="4%" rotation={-4} dark isAnimating={isAnimating}>
        {`const pipeline = ['build', 'test', 'deploy'];`}
      </HandwrittenCode>
      <AcademicDoodle top="80%" left="30%" rotation={-5} isAnimating={isAnimating}>
        <BeakerDoodle />
      </AcademicDoodle>

      {/* Bottom-right */}
      <HandwrittenCode top="74%" left="52%" rotation={-6} isAnimating={isAnimating}>
        {`docker build -t my-app .\ndocker push my-registry/my-app`}
      </HandwrittenCode>
      <HandwrittenCode top="86%" left="54%" rotation={8} light isAnimating={isAnimating}>
        {`curl -X POST https://api.dev/v1/deploy`}
      </HandwrittenCode>
      <AcademicDoodle top="64%" left="80%" rotation={10} isAnimating={isAnimating}>
        <LineGraphDoodle />
      </AcademicDoodle>
      
      {/* Jagged "Tear" Edges */}
      <div className="absolute top-0 left-0 w-full h-[10px] pointer-events-none z-10">
        <svg width="100%" height="100%" viewBox="0 0 100 10" preserveAspectRatio="none">
          <polygon points={horizontalTearPoints} fill="#1a1a1a" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[10px] pointer-events-none z-10 transform scale-y-[-1]">
        <svg width="100%" height="100%" viewBox="0 0 100 10" preserveAspectRatio="none">
          <polygon points={horizontalTearPoints} fill="#1a1a1a" />
        </svg>
      </div>
      <div className="absolute top-0 left-0 w-[10px] h-full pointer-events-none z-10">
        <svg width="100%" height="100%" viewBox="0 0 10 100" preserveAspectRatio="none">
          <polygon points={verticalTearPoints} fill="#1a1a1a" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-[10px] h-full pointer-events-none z-10 transform scale-x-[-1]">
        <svg width="100%" height="100%" viewBox="0 0 10 100" preserveAspectRatio="none">
          <polygon points={verticalTearPoints} fill="#1a1a1a" />
        </svg>
      </div>

      {/* Top Fixed Anchor Pin */}
      <div ref={fixedPointRef} className="fixed w-4 h-4 bg-[#5a3921] rounded-full border-2 border-[#3d2310] shadow-md z-30 pointer-events-none" style={{ top: '20px' }}></div>
      
      {/* Dynamic Lanyard Name Tag Badge */}
      <div 
        ref={nameTagRef}
        className="fixed top-0 left-0 cursor-grab active:cursor-grabbing z-40 flex flex-col items-center justify-center overflow-hidden"
        style={{
          width: '300px',
          height: '176px',
          padding: '16px',
          borderRadius: '18px',
          background: 'linear-gradient(160deg, #f8e6c2 0%, #d9b67c 50%, #b98145 100%)',
          border: '2px solid #6b3f20',
          boxShadow: '0 16px 30px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -6px 12px rgba(92,54,21,0.2)',
          perspective: '800px',
          touchAction: 'none',
          willChange: 'left, top, transform, filter',
          transition: 'filter 0.3s ease'
        }}
      >
        {/* Lanyard Hole Cut-out & Metallic Clip Ring */}
        <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-9 h-3.5 rounded-full bg-[#4a2b13] border border-[#8b5a2b] shadow-inner flex items-center justify-center z-30">
          <div className="w-5 h-1.5 rounded-full bg-[#1b0e06]"></div>
        </div>

        <div className="absolute inset-[8px] rounded-[10px] border border-[#7d4a20]/30 pointer-events-none"></div>
        <div className="absolute inset-0 rounded-[16px] bg-[radial-gradient(ellipse_at_50%_0%,_rgba(255,255,255,0.45),_transparent_55%)] pointer-events-none"></div>
        <div className="relative z-10 flex h-full w-full flex-col rounded-[12px] border border-[#8b5a2b]/20 bg-[#f7ebd0]/70 px-5 py-3 backdrop-blur-[1px]">
          <div className="flex h-[18px] items-center justify-center px-2">
            <div className="h-[1px] w-1/4 bg-[#8b5a2b]/40"></div>
            <div className="px-2 text-[9px] font-semibold uppercase tracking-[0.35em] text-[#6b3f20]/80">Est. 2024</div>
            <div className="h-[1px] w-1/4 bg-[#8b5a2b]/40"></div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full border-2 border-[#7a4a21] bg-[#6b3f20] text-[1.05rem] font-bold uppercase tracking-[0.25em] text-[#f8e6c2] shadow-inner">
                ZM
              </div>
              <div className="flex flex-col items-start justify-center leading-none">
                <h2 className="font-handwritten text-[1.9rem] leading-none text-[#4d2c12] [text-shadow:1px_1px_0_rgba(255,255,255,0.45)]">Zamokuhle</h2>
                <h2 className="font-handwritten text-[1.9rem] leading-none text-[#4d2c12] [text-shadow:1px_1px_0_rgba(255,255,255,0.45)]">Maziya</h2>
                <p className="mt-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#6b3f20]/95">Junior DevOps</p>
              </div>
            </div>
          </div>

          <div className="flex h-[18px] items-center justify-center">
            <div className="h-[1px] w-1/3 bg-[#8b5a2b]/40"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;