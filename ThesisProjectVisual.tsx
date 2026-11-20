import React, { useId, useState } from 'react';
import ProjectPreview from './ProjectPreview';

const chapters = [
  { key: 'woods', label: 'Freshman Woods', tone: '#9fb9a3', subtitle: 'Something stirs beyond the treeline.' },
  { key: 'room', label: 'Sophomore Room', tone: '#d5a471', subtitle: 'Every corridor has a memory.' },
  { key: 'final', label: 'Final Encounter', tone: '#e4ad8a', subtitle: 'One last obstacle to graduation.' },
] as const;

export default function ThesisProjectVisual() {
  const [chapter, setChapter] = useState<typeof chapters[number]['key']>('woods');
  const active = chapters.find(item => item.key === chapter)!;
  const id = useId().replace(/:/g, '');
  const ref = (name: string) => `url(#${id}-${name})`;

  return <ProjectPreview className={`thesis-screen pv-thesis chapter-${chapter}`} label="Illustrated Thesis of the Dead chapter explorer">
    <div className="cinema-top"><span><i /> CHAPTER STUDY</span><span>THREE.JS / WEBGL</span></div>
    <div className="cinema-art" aria-hidden="true">
      <svg viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice" className="cinema-scene">
        <defs>
          <linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor="#0c1720" /><stop offset=".65" stopColor="#354d49" /><stop offset="1" stopColor="#12221d" /></linearGradient>
          <linearGradient id={`${id}-amber`} x2="0" y2="1"><stop stopColor="#120e15" /><stop offset=".64" stopColor="#684537" /><stop offset="1" stopColor="#271f24" /></linearGradient>
          <linearGradient id={`${id}-hall`} x2="0" y2="1"><stop stopColor="#0f1013" /><stop offset="1" stopColor="#49382b" /></linearGradient>
          <radialGradient id={`${id}-light`}><stop stopColor="#d8ecd2" stopOpacity=".27" /><stop offset="1" stopColor="#c3dfc1" stopOpacity="0" /></radialGradient>
          <radialGradient id={`${id}-portal`}><stop stopColor="#d6f6d0" stopOpacity=".6" /><stop offset=".45" stopColor="#a6d8a5" stopOpacity=".13" /><stop offset="1" stopColor="#b8ddac" stopOpacity="0" /></radialGradient>
          <linearGradient id={`${id}-floor`} x2="0" y2="1"><stop stopColor="#a7bca0" stopOpacity=".26" /><stop offset="1" stopColor="#8fb79b" stopOpacity="0" /></linearGradient>
          <linearGradient id={`${id}-vignette`} x2="0" y2="1"><stop stopColor="#060a0c" stopOpacity=".2" /><stop offset=".5" stopColor="#060a0c" stopOpacity="0" /><stop offset="1" stopColor="#060a0c" stopOpacity=".94" /></linearGradient>
          <path id={`${id}-pine`} d="m0-130-17 33h10l-22 35h13l-30 39h33V0h26v-23h33L16-62h13L7-97h10Z" />
          <g id={`${id}-figure`}><ellipse cy="-57" rx="6" ry="7" /><path d="M-6-49Q0-52 6-49L11-29 5-26 4-4 7 0H-1L-3-22-5 0h-8l4-5 1-24-7 1 5-17Z" /></g>
        </defs>
        <g className={`chapter-layer ${chapter === 'woods' ? 'is-visible' : ''}`}>
          <path fill={ref('sky')} d="M0 0h600v500H0z" />
          <ellipse cx="352" cy="168" rx="260" ry="230" fill={ref('light')} />
          <circle cx="376" cy="113" r="31" fill="#dae0c6" opacity=".83" /><circle cx="365" cy="105" r="7" fill="#a2ae9e" opacity=".18" />
          <path d="m0 256 80-54 71 33 82-50 90 38 86-27 79 37 112-34v301H0Z" fill="#1b3231" />
          <g fill="#172e29" opacity=".8">{Array.from({ length: 13 }, (_, i) => <use key={i} href={`#${id}-pine`} transform={`translate(${i * 52 - 10} ${280 + i % 3 * 17}) scale(${.65 + i % 4 * .16})`} />)}</g>
          <path d="M0 321Q135 275 286 315T600 305V500H0Z" fill="#122420" />
          <path d="m291 302-55 198h164l-96-198Z" fill={ref('floor')} opacity=".5" />
          <g className="scene-fog" fill={ref('light')}><ellipse cx="210" cy="305" rx="250" ry="50" /><ellipse cx="490" cy="346" rx="230" ry="35" /></g>
          <g fill="#081713">{[[-10, 405, 2.7], [76, 355, 1.85], [536, 378, 2.1], [631, 447, 3.1]].map(([x, y, scale], i) => <use key={i} href={`#${id}-pine`} transform={`translate(${x} ${y}) scale(${scale})`} />)}</g>
        </g>
        <g className={`chapter-layer ${chapter === 'room' ? 'is-visible' : ''}`}>
          <path fill={ref('hall')} d="M0 0h600v500H0z" /><path d="M0 500 242 247h116l242 253" fill="#5c4b39" opacity=".35" />
          {[0, 1, 2, 3].map(i => <g key={i} transform={`translate(300 235) scale(${1 - i * .19}) translate(-300 -235)`} fill="none" stroke="#81705a" strokeOpacity={.25 + i * .12} strokeWidth="12"><path d="M65 500V165a235 235 0 0 1 470 0v335" /><path d="M87 500V165a213 213 0 0 1 426 0v335" strokeWidth="1" /></g>)}
          <path d="M0 0h81v500H0Zm519 0h81v500h-81Z" fill="#101012" />
          <g stroke="#c2a77f" strokeOpacity=".12">{[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${i * 150 - 70} 500 300 230M70 ${295 + i * 40}h460`} />)}</g>
          <ellipse cx="300" cy="275" rx="150" ry="225" fill={ref('light')} opacity=".6" />
          {[118, 482].map(x => <g key={x}><path d={`M${x} 180v70`} stroke="#6d5740" strokeWidth="3" /><ellipse cx={x} cy="175" rx="40" ry="65" fill={ref('light')} /><path d={`m${x} 160 4 17-4 6-4-6Z`} fill="#e6c48c" className="scene-flame" /></g>)}
        </g>
        <g className={`chapter-layer ${chapter === 'final' ? 'is-visible' : ''}`}>
          <path fill={ref('amber')} d="M0 0h600v500H0z" /><circle cx="420" cy="150" r="67" fill="#d69a77" opacity=".65" />
          <path d="m0 280 70-27 84 13 99-35 117 49 85-37 145 32v225H0Z" fill="#392e30" />
          <path d="M142 321V215h61v-29h36v-30h15v-21h10v21h15v30h42v-30h15v-21h10v21h15v30h36v29h61v106Z" fill="#201e25" />
          <path d="M161 321v-95h278v95M300 189v-52m-8 5h16" fill="none" stroke="#b18e77" strokeOpacity=".4" />
          {[182, 220, 259, 341, 380, 418].map(x => <path key={x} d={`M${x} 251v-13a6 6 0 0 1 12 0v13Z`} fill="#d8aa83" opacity=".35" />)}
          <path d="M0 346Q155 313 300 336t300-6v170H0Z" fill="#1c1c22" /><path d="m289 321-89 179h200l-89-179Z" fill={ref('floor')} opacity=".4" />
          <g fill="#14171c"><path d="M40 360V223l8-12 8 12v140Zm503 0V202l8-12 8 12v180Z" /><path d="m0 403 130-27 75 124H0Zm600-17-116-22-70 136h186Z" /></g>
        </g>
        <g className="scene-portal"><ellipse cx="300" cy="274" rx="85" ry="113" fill={ref('portal')} /><ellipse cx="300" cy="275" rx="27" ry="56" fill="#a9d3ad" fillOpacity=".05" stroke="#bedbb2" strokeOpacity=".8" strokeWidth="1.4" /><ellipse cx="300" cy="275" rx="32" ry="61" fill="none" stroke="#bedbb2" strokeOpacity=".2" strokeWidth=".6" strokeDasharray="2 8" /><path d="m275 315-30 112h110l-30-112" fill={ref('floor')} /></g>
        <g className="scene-dust" fill="#dce4c2">{Array.from({ length: 19 }, (_, i) => <circle key={i} cx={48 + (i * 83) % 510} cy={120 + (i * 47) % 250} r={i % 3 === 0 ? 1.4 : .7} style={{ animationDelay: `${i * -.63}s` }} />)}</g>
        <ellipse cx="306" cy="421" rx="28" ry="6" fill="#030808" opacity=".6" /><use href={`#${id}-figure`} transform="translate(306 418) scale(1.35)" fill="#080e11" stroke="#91a69a" strokeOpacity=".23" strokeWidth=".7" />
        <use href={`#${id}-figure`} transform="translate(222 328) scale(.47)" fill="#182320" /><use href={`#${id}-figure`} transform="translate(396 337) scale(.56)" fill="#182320" />
        <path fill={ref('vignette')} d="M0 0h600v500H0z" />
      </svg>
    </div>
    <div className="cinema-caption" aria-live="polite" style={{ '--chapter-tone': active.tone } as React.CSSProperties}><div key={chapter}><small>0{chapters.indexOf(active) + 1} / SURVIVAL</small><strong>{active.label}</strong><p>{active.subtitle}</p></div></div>
    <div className="chapter-switcher" role="group" aria-label="Explore game chapters">{chapters.map((item, index) => <button type="button" key={item.key} className={chapter === item.key ? 'active' : ''} onClick={() => setChapter(item.key)} aria-pressed={chapter === item.key} aria-label={`Preview ${item.label}`}><span>0{index + 1}</span><i /></button>)}</div>
  </ProjectPreview>;
}
