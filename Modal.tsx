import React, { useLayoutEffect, useRef } from 'react';

export default function Modal({ open, onClose, label, className = '', children }: {
  open: boolean; onClose: () => void; label: string; className?: string; children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  // Capture the opener before a child (such as Terminal) focuses its input.
  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const root = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const focusables = () => Array.from(root.querySelectorAll<HTMLElement>('button, a[href], input, select, [tabindex="0"]')).filter(el => el.getClientRects().length && !el.hasAttribute('disabled'));
    const timer = window.setTimeout(() => {
      const items = focusables();
      (items.find(element => element.tagName === 'INPUT') || items[0] || root).focus();
    }, 0);
    const onKey = (event: KeyboardEvent) => {
      if (!root.contains(document.activeElement)) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close.current(); }
      if (event.key === 'Tab') {
        const items = focusables();
        if (!items.length) { event.preventDefault(); root.focus(); return; }
        if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)!.focus(); }
        else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
      }
    };
    root.addEventListener('keydown', onKey);
    return () => { clearTimeout(timer); root.removeEventListener('keydown', onKey); previous?.focus({ preventScroll: true }); };
  }, [open]);
  return <div ref={ref} hidden={!open} className={className} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>{children}</div>;
}
