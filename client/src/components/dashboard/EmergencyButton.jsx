import { useState } from 'react';

export function EmergencyButton({ onClick }) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
      className={`
        relative w-40 h-40 rounded-full
        bg-gradient-to-br from-red-500 to-red-600
        text-white font-bold text-sm tracking-wide
        shadow-lg shadow-red-500/30
        transition-all duration-150
        focus:outline-none focus:ring-4 focus:ring-red-300
        ${isPressed ? 'scale-95 shadow-md' : 'hover:scale-105 hover:shadow-xl'}
      `}
    >
      <span className="relative z-10">SOS</span>
      <span className="absolute inset-0 rounded-full border-4 border-white/30" />
      <span className="absolute -inset-1 rounded-full bg-red-500/20 animate-ping" />
    </button>
  );
}
