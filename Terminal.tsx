
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { terminalResponses } from './constants';


let _welcomeShown = false;

interface TerminalProps {
  onCommand: (command: string) => void;
  isMatrixCommandUnlocked: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ onCommand, isMatrixCommandUnlocked }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const addLine = useCallback((text: string) => {
    setLines(prev => [...prev, text]);
  }, []);

  useEffect(() => {
    if (_welcomeShown) return;
    _welcomeShown = true;
    setTimeout(() => {
      addLine(`
        <div class="flex items-center gap-2 mb-1"><span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[#d4a657]/20 text-[#d4a657] border border-[#d4a657]/30">System Ready</span></div>
        <span class="text-[#d4a657] font-bold text-base">WELCOME TO ZAMOKUHLE'S CAREER TERMINAL</span><br>
        <span class="text-[#9a938a]">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span><br>
        Type <strong class="text-[#e8e5d9] bg-[#222] px-1.5 py-0.5 rounded border border-[#444]">help</strong> to see all available commands.<br>
        <span class="text-[#c2b9aa]">Tip: Try <strong>get skills</strong>, <strong>get projects</strong>, or <strong>play bird</strong>!</span>
      `);
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);
  
  const processCommand = (command: string) => {
    const normalizedCommand = command.toLowerCase().trim();
    if (normalizedCommand === 'clear') {
      setLines([]);
      return;
    }
    
    // Block 'matrix' command if not unlocked
    if (normalizedCommand === 'matrix' && !isMatrixCommandUnlocked) {
      addLine(`<span class="text-red-400">Error: Command not found: "${command}"</span><br>Type <strong class="text-accent">help</strong> for available commands.`);;
      return;
    }

    onCommand(normalizedCommand);
    
    // Handle 'help' command dynamically
    if (normalizedCommand === 'help') {
        let helpText = terminalResponses.help;
        if (isMatrixCommandUnlocked) {
            const helpLines = helpText.split('<br>');
            const helpIndex = helpLines.findIndex(line => line.includes('<strong>help</strong>'));
            if (helpIndex !== -1) {
                helpLines.splice(helpIndex, 0, `    • <strong class="text-green-400">matrix</strong> - [SECRET] Activate matrix mode`);
                helpText = helpLines.join('<br>');
            }
        }
        addLine(helpText);
        return;
    }

    const response = terminalResponses[normalizedCommand];
    if (response) {
      addLine(response);
    } else {
      addLine(`<span class="text-red-400">Error: Command not found: "${command}"</span><br>Type <strong class="text-accent">help</strong> for available commands.`);;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const command = inputValue.trim();
      addLine(`<span class="text-[#d4a657] font-bold">guest@zamokuhle:~$</span> ${command}`);
      processCommand(command);
      setInputValue('');
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const quickCommands = ['get skills', 'get projects', 'get contact'];

  return (
    <div 
      className="w-full h-full bg-[#121518]/95 p-4 md:p-5 flex flex-col text-[#e8e5d9] font-['JetBrains_Mono',_monospace] relative overflow-hidden glass-panel rounded-3xl border border-[#d4a657]/20 outline-none"
      onClick={focusInput}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,166,87,0.06),_transparent_60%)] pointer-events-none"></div>
      
      {/* Terminal Top Window Controls Bar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#333]/80 relative z-[2]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-sm"></div>
          <span className="ml-2 text-xs font-semibold tracking-wider text-[#9a938a] uppercase">bash - 80x24</span>
        </div>
        <div className="flex items-center gap-2 bg-[#1b2026] px-3 py-1 rounded-full border border-[#333]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-bold tracking-wide text-emerald-400">ONLINE</span>
        </div>
      </div>
    
      {/* Terminal Output Area */}
      <div ref={outputRef} className="flex-1 overflow-y-auto mb-3 p-4 relative z-[2]">
        {lines.map((line, index) => (
          <div key={index} className="mb-2 leading-relaxed text-sm animate-fade-in" dangerouslySetInnerHTML={{ __html: line }} />
        ))}
        <div className="flex items-center gap-2 mt-2 pt-1">
          <span className="text-[#d4a657] font-bold text-sm select-none">guest@zamokuhle:~$</span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none text-[#ece8dc] text-sm outline-none focus:outline-none focus:ring-0 w-full placeholder:text-[#635d55]"
            placeholder="Type a command (e.g. 'help')..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
          />
          <span className="animate-blink text-[#d4a657] font-bold select-none">_</span>
        </div>
      </div>

      {/* Quick Command Suggestions Chips */}
      <div className="flex flex-wrap items-center gap-1.5 relative z-[2] pt-1">
        <span className="text-[11px] text-[#7d766d] mr-1 select-none">Quick:</span>
        {quickCommands.map(cmd => (
          <button
            key={cmd}
            onClick={(e) => {
              e.stopPropagation();
              addLine(`<span class="text-[#d4a657] font-bold">guest@zamokuhle:~$</span> ${cmd}`);
              processCommand(cmd);
            }}
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#1a1f26] text-[#c7beaf] hover:bg-[#d4a657]/20 hover:text-[#d4a657] border border-[#333] transition"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Terminal;
