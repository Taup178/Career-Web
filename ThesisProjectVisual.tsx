import React, { useState } from 'react';

const chapters = [
  { key: 'woods', label: '01 / FRESHMAN WOODS' },
  { key: 'room', label: '02 / SOPHOMORE ROOM' },
  { key: 'final', label: '03 / FINAL ENCOUNTER' },
] as const;

const ThesisProjectVisual: React.FC = () => {
  const [chapter, setChapter] = useState<(typeof chapters)[number]['key']>('woods');

  return (
    <div className={`thesis-screen chapter-${chapter}`} aria-label="Animated Thesis of the Dead game preview">
      <div className="thesis-hud">
        <span className="thesis-rec"><i /> WORLD PREVIEW</span>
        <span>ANIMATED ILLUSTRATION<br />PLAY LINK FOR ACTUAL GAME</span>
      </div>
      <div className="game-moon" />
      <div className="game-stars"><i /><i /><i /><i /><i /><i /></div>
      <div className="game-trees back"><i /><i /><i /><i /><i /><i /></div>
      <div className="game-trees front"><i /><i /><i /><i /><i /></div>
      <div className="dungeon-wall"><i /><i /><i /></div>
      <div className="desert-huts"><i /><i /><i /></div>
      <div className="game-ground" />
      <div className="game-portal red"><i /></div>
      <div className="game-portal green"><i /></div>
      <div className="game-player"><i className="player-head" /><i className="player-body" /><i className="player-arm" /><i className="player-gun" /></div>
      <div className="zombie zombie-one"><i /><b /></div>
      <div className="zombie zombie-two"><i /><b /></div>
      <div className="zombie zombie-three"><i /><b /></div>
      <div className="game-crosshair"><i /><i /></div>
      <div className="health-widget"><span>STAMINA</span><i><b /></i></div>
      <div className="credits-widget"><span>CREDITS</span><b>08</b></div>
      <div className="game-title-card"><small>{chapters.find(item => item.key === chapter)?.label}</small><strong>THESIS<br /><em>OF THE DEAD</em></strong><p>Will you survive the final draft?</p></div>
      <div className="chapter-switcher">
        {chapters.map((item, index) => <button key={item.key} className={chapter === item.key ? 'active' : ''} onClick={() => setChapter(item.key)} aria-pressed={chapter === item.key} aria-label={`Preview ${item.label}`}>{index + 1}</button>)}
      </div>
      <div className="screen-scanlines" />
    </div>
  );
};

export default ThesisProjectVisual;
