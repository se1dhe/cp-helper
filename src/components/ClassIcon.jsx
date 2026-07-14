import React, { useState } from 'react';

const CLASS_ICON_ID = {
  'Sorcerer': 12,
  'Spellsinger': 27,
  'Spellhowler': 40,
  'Necromancer': 13,
  'Terramancer': 210,
  'Gladiator': 2,
  'Warlord': 3,
  'Paladin': 5,
  'Dark Avenger': 6,
  'Temple Knight': 20,
  'Treasure Hunter': 8,
  'Hawkeye': 9,
  'Plains Walker': 23,
  'Silver Ranger': 24,
  'Abyss Walker': 36,
  'Phantom Ranger': 37,
  'Destroyer': 46,
  'Tyrant': 48,
  'Bounty Hunter': 55,
  'Warsmith': 57,
  'Blade Dancer': 34,
  'Sword Singer': 21,
  'Prophet': 17,
  'Warcryer': 52,
  'Overlord': 51,
  'Shillien Elder': 43,
  'Elven Elder': 30,
  'Bishop': 16,
};

const COLORS = {
  mage: { primary: '#60a5fa', glow: 'rgba(96,165,250,0.4)', bg: 'rgba(29,78,216,0.15)' },
  fighter: { primary: '#f87171', glow: 'rgba(248,113,113,0.4)', bg: 'rgba(185,28,28,0.15)' },
  buffer: { primary: '#fbbf24', glow: 'rgba(251,191,36,0.4)', bg: 'rgba(217,119,6,0.15)' },
  support: { primary: '#34d399', glow: 'rgba(52,211,153,0.4)', bg: 'rgba(5,150,105,0.15)' },
};

export const ClassIcon = ({ className, type, size = 48 }) => {
  const [useSvg, setUseSvg] = useState(false);
  const c = COLORS[type] || COLORS.mage;
  const iconId = CLASS_ICON_ID[className];

  if (iconId && !useSvg) {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '12px',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <img
          src={`/icons/r_classes/class_icon_${iconId}.png`}
          alt={className}
          width={size}
          height={size}
          style={{ display: 'block' }}
          onError={() => setUseSvg(true)}
        />
      </div>
    );
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '12px',
      background: c.bg,
      border: `1.5px solid ${c.primary}44`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      flexShrink: 0,
      boxShadow: `0 0 12px ${c.glow}, inset 0 1px 0 ${c.primary}22`,
    }}>
      <svg viewBox="0 0 32 32" width={size * 0.6} height={size * 0.6} style={{ filter: `drop-shadow(0 0 4px ${c.primary})` }}>
        <ClassIconSvg className={className} type={type} color={c.primary} />
      </svg>
    </div>
  );
};

const ClassIconSvg = ({ className, type, color }) => {
  switch(className) {
    // ===== MAGES =====
    case 'Sorcerer': return (
      <g>
        <circle cx="16" cy="16" r="8" fill="none" stroke={color} strokeWidth="1.5" />
        <path d="M16 8 L18 14 L24 14 L19 18 L21 24 L16 20 L11 24 L13 18 L8 14 L14 14 Z" fill={color} opacity="0.9"/>
        <circle cx="16" cy="16" r="3" fill={color} opacity="0.6"/>
      </g>
    );
    case 'Spellsinger': return (
      <g>
        <ellipse cx="16" cy="16" rx="10" ry="7" fill="none" stroke={color} strokeWidth="1.5"/>
        <path d="M8 16 Q12 10 16 16 Q20 22 24 16" fill="none" stroke={color} strokeWidth="2"/>
        <circle cx="8" cy="16" r="1.5" fill={color}/>
        <circle cx="24" cy="16" r="1.5" fill={color}/>
        <path d="M22 8 L24 6 M24 6 L22 6 M24 6 L24 8" stroke={color} strokeWidth="1.2"/>
        <path d="M25 11 L27 9 M27 9 L25 9 M27 9 L27 11" stroke={color} strokeWidth="1.2"/>
      </g>
    );
    case 'Spellhowler': return (
      <g>
        <path d="M16 4 L20 12 L28 12 L22 18 L24 26 L16 21 L8 26 L10 18 L4 12 L12 12 Z" fill={color} opacity="0.3"/>
        <path d="M16 4 L20 12 L28 12 L22 18 L24 26 L16 21 L8 26 L10 18 L4 12 L12 12 Z" fill="none" stroke={color} strokeWidth="1.5"/>
        <circle cx="16" cy="14" r="3" fill={color}/>
        <path d="M13 20 Q16 26 19 20" fill={color} opacity="0.5"/>
      </g>
    );
    case 'Necromancer': return (
      <g>
        <circle cx="16" cy="12" r="5" fill={color} opacity="0.7"/>
        <rect x="13" y="17" width="2.5" height="4" fill={color} opacity="0.7"/>
        <rect x="16.5" y="17" width="2.5" height="4" fill={color} opacity="0.7"/>
        <rect x="12" y="17" width="8" height="2" fill={color} opacity="0.7"/>
        <circle cx="14" cy="11" r="1" fill="#1a1a2e"/>
        <circle cx="18" cy="11" r="1" fill="#1a1a2e"/>
        <path d="M13 14 Q16 15.5 19 14" fill="none" stroke="#1a1a2e" strokeWidth="1"/>
        <path d="M8 26 Q16 20 24 26" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6"/>
      </g>
    );
    case 'Terramancer': return (
      <g>
        <polygon points="16,4 26,22 6,22" fill="none" stroke={color} strokeWidth="1.5"/>
        <polygon points="16,9 23,19 9,19" fill={color} opacity="0.3"/>
        <line x1="16" y1="4" x2="16" y2="22" stroke={color} strokeWidth="1" opacity="0.5"/>
        <line x1="9" y1="19" x2="23" y2="19" stroke={color} strokeWidth="1" opacity="0.5"/>
        <circle cx="16" cy="15" r="2.5" fill={color}/>
        <circle cx="11" cy="24" r="1.5" fill={color} opacity="0.7"/>
        <circle cx="21" cy="24" r="1.5" fill={color} opacity="0.7"/>
        <circle cx="16" cy="26" r="1.5" fill={color} opacity="0.7"/>
      </g>
    );
    // ===== FIGHTERS =====
    case 'Gladiator': return (
      <g>
        <path d="M12 28 L12 8 L20 4 L20 28" fill={color} opacity="0.3"/>
        <rect x="11" y="8" width="10" height="20" rx="1" fill="none" stroke={color} strokeWidth="1.5"/>
        <line x1="16" y1="4" x2="16" y2="28" stroke={color} strokeWidth="2"/>
        <line x1="8" y1="14" x2="24" y2="14" stroke={color} strokeWidth="1.5"/>
        <path d="M13 4 L16 2 L19 4" fill={color}/>
        <circle cx="16" cy="14" r="2" fill={color}/>
      </g>
    );
    case 'Blade Dancer': return (
      <g>
        <line x1="6" y1="6" x2="26" y2="26" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="26" y1="6" x2="6" y2="26" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="4" fill={color} opacity="0.25"/>
        <circle cx="16" cy="16" r="2" fill={color}/>
        <path d="M6 6 L9 6 L6 9" fill={color}/>
        <path d="M26 6 L23 6 L26 9" fill={color}/>
        <path d="M6 26 L9 26 L6 23" fill={color}/>
        <path d="M26 26 L23 26 L26 23" fill={color}/>
      </g>
    );
    case 'Destroyer': return (
      <g>
        <path d="M8 28 L16 4 L24 28 Z" fill={color} opacity="0.4"/>
        <path d="M8 28 L16 4 L24 28 Z" fill="none" stroke={color} strokeWidth="2"/>
        <line x1="8" y1="20" x2="24" y2="20" stroke={color} strokeWidth="2.5"/>
        <circle cx="16" cy="20" r="3" fill={color}/>
      </g>
    );
    case 'Warlord': return (
      <g>
        <circle cx="16" cy="14" r="8" fill="none" stroke={color} strokeWidth="1.5"/>
        <path d="M16 6 L16 22 M8 14 L24 14" stroke={color} strokeWidth="2"/>
        <circle cx="16" cy="14" r="3" fill={color} opacity="0.8"/>
        <path d="M12 24 L16 28 L20 24" fill={color}/>
      </g>
    );
    case 'Paladin': return (
      <g>
        <path d="M16 4 L22 8 L22 20 L16 26 L10 20 L10 8 Z" fill="none" stroke={color} strokeWidth="1.5"/>
        <path d="M16 8 L16 22 M11 14 L21 14" stroke={color} strokeWidth="2"/>
        <path d="M16 4 L22 8 L22 20 L16 26 L10 20 L10 8 Z" fill={color} opacity="0.15"/>
      </g>
    );
    case 'Dark Avenger': return (
      <g>
        <path d="M16 4 L22 8 L22 20 L16 26 L10 20 L10 8 Z" fill={color} opacity="0.2"/>
        <path d="M16 4 L22 8 L22 20 L16 26 L10 20 L10 8 Z" fill="none" stroke={color} strokeWidth="1.5"/>
        <path d="M13 10 L19 10 L19 17 L16 21 L13 17 Z" fill={color} opacity="0.6"/>
      </g>
    );
    case 'Temple Knight': return (
      <g>
        <path d="M16 4 L24 10 L24 20 L16 28 L8 20 L8 10 Z" fill={color} opacity="0.15"/>
        <path d="M16 4 L24 10 L24 20 L16 28 L8 20 L8 10 Z" fill="none" stroke={color} strokeWidth="1.5"/>
        <path d="M12 12 L20 12 L20 18 L16 22 L12 18 Z" fill="none" stroke={color} strokeWidth="1.5"/>
        <line x1="16" y1="8" x2="16" y2="20" stroke={color} strokeWidth="1.5"/>
        <line x1="11" y1="14" x2="21" y2="14" stroke={color} strokeWidth="1.5"/>
        <circle cx="16" cy="14" r="2" fill={color} opacity="0.6"/>
      </g>
    );
    case 'Tyrant': return (
      <g>
        <path d="M10 28 L10 12 L16 6 L22 12 L22 28" fill={color} opacity="0.2"/>
        <path d="M10 28 L10 12 L16 6 L22 12 L22 28" fill="none" stroke={color} strokeWidth="1.5"/>
        <line x1="10" y1="20" x2="22" y2="20" stroke={color} strokeWidth="1.5"/>
        <circle cx="16" cy="12" r="3" fill={color}/>
      </g>
    );
    case 'Hawkeye': return (
      <g>
        <path d="M8 16 Q12 10 16 16 Q20 22 24 16" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="3" fill="none" stroke={color} strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="1.5" fill={color}/>
        <line x1="24" y1="16" x2="30" y2="14" stroke={color} strokeWidth="1.5"/>
        <path d="M28 13 L30 14 L29 16" fill={color}/>
      </g>
    );
    case 'Treasure Hunter': return (
      <g>
        <rect x="9" y="14" width="14" height="11" rx="2" fill="none" stroke={color} strokeWidth="1.5"/>
        <path d="M12 14 Q12 8 16 8 Q20 8 20 14" fill="none" stroke={color} strokeWidth="1.5"/>
        <circle cx="16" cy="20" r="2" fill={color}/>
        <line x1="16" y1="20" x2="16" y2="22" stroke={color} strokeWidth="1.5"/>
        <line x1="9" y1="18" x2="23" y2="18" stroke={color} strokeWidth="1"/>
      </g>
    );
    case 'Plains Walker': return (
      <g>
        <circle cx="16" cy="10" r="5" fill="none" stroke={color} strokeWidth="1.5"/>
        <line x1="16" y1="15" x2="16" y2="26" stroke={color} strokeWidth="2"/>
        <line x1="10" y1="20" x2="22" y2="20" stroke={color} strokeWidth="1.5"/>
        <line x1="16" y1="26" x2="12" y2="30" stroke={color} strokeWidth="1.5"/>
        <line x1="16" y1="26" x2="20" y2="30" stroke={color} strokeWidth="1.5"/>
      </g>
    );
    case 'Silver Ranger': return (
      <g>
        <path d="M6 16 L26 16 M6 16 L10 13 M6 16 L10 19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="22" cy="10" r="3" fill="none" stroke={color} strokeWidth="1.5"/>
        <line x1="22" y1="7" x2="22" y2="3" stroke={color} strokeWidth="1.5"/>
        <line x1="19.5" y1="8.5" x2="17" y2="6" stroke={color} strokeWidth="1.5"/>
        <line x1="24.5" y1="8.5" x2="27" y2="6" stroke={color} strokeWidth="1.5"/>
        <circle cx="22" cy="22" r="3" fill="none" stroke={color} strokeWidth="1.5"/>
      </g>
    );
    case 'Abyss Walker': return (
      <g>
        <path d="M16 4 Q22 10 22 16 Q22 24 16 28 Q10 24 10 16 Q10 10 16 4Z" fill={color} opacity="0.2"/>
        <path d="M16 4 Q22 10 22 16 Q22 24 16 28 Q10 24 10 16 Q10 10 16 4Z" fill="none" stroke={color} strokeWidth="1.5"/>
        <line x1="10" y1="16" x2="22" y2="16" stroke={color} strokeWidth="1"/>
        <line x1="16" y1="10" x2="16" y2="22" stroke={color} strokeWidth="1"/>
        <circle cx="16" cy="16" r="2.5" fill={color}/>
      </g>
    );
    case 'Phantom Ranger': return (
      <g>
        <path d="M6 20 L16 6 L26 20" fill="none" stroke={color} strokeWidth="1.5"/>
        <line x1="6" y1="20" x2="26" y2="20" stroke={color} strokeWidth="1.5"/>
        <line x1="16" y1="6" x2="16" y2="28" stroke={color} strokeWidth="2"/>
        <circle cx="16" cy="14" r="2" fill={color}/>
      </g>
    );
    case 'Bounty Hunter': return (
      <g>
        <circle cx="16" cy="12" r="6" fill="none" stroke={color} strokeWidth="1.5"/>
        <path d="M13 18 L13 28 L19 28 L19 18" fill={color} opacity="0.3"/>
        <path d="M13 18 L13 28 L19 28 L19 18" fill="none" stroke={color} strokeWidth="1.5"/>
        <line x1="16" y1="6" x2="16" y2="4" stroke={color} strokeWidth="2"/>
        <line x1="10" y1="8" x2="8" y2="6" stroke={color} strokeWidth="1.5"/>
        <line x1="22" y1="8" x2="24" y2="6" stroke={color} strokeWidth="1.5"/>
      </g>
    );
    case 'Warsmith': return (
      <g>
        <rect x="10" y="10" width="12" height="14" rx="1" fill="none" stroke={color} strokeWidth="1.5"/>
        <path d="M13 10 L13 6 L19 6 L19 10" fill="none" stroke={color} strokeWidth="1.5"/>
        <circle cx="16" cy="17" r="3" fill={color} opacity="0.6"/>
        <line x1="7" y1="24" x2="10" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="25" y1="24" x2="22" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </g>
    );
    // ===== BUFFERS =====
    case 'Sword Singer': return (
      <g>
        <line x1="16" y1="4" x2="16" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="10" y1="14" x2="22" y2="14" stroke={color} strokeWidth="1.5"/>
        <path d="M14 26 L16 28 L18 26" fill={color}/>
        <path d="M22 8 L24 6 M24 6 L22 6 M24 6 L24 8" stroke={color} strokeWidth="1.2"/>
        <path d="M25 12 L27 10 M27 10 L25 10 M27 10 L27 12" stroke={color} strokeWidth="1.2"/>
        <path d="M25 16 L27 14 M27 14 L25 14 M27 14 L27 16" stroke={color} strokeWidth="1.2"/>
      </g>
    );
    case 'Prophet': return (
      <g>
        <circle cx="16" cy="10" r="4" fill={color} opacity="0.6"/>
        <path d="M14 14 L10 28 L16 24 L22 28 L18 14Z" fill={color} opacity="0.3"/>
        <path d="M14 14 L10 28 L16 24 L22 28 L18 14Z" fill="none" stroke={color} strokeWidth="1.5"/>
        <line x1="16" y1="4" x2="16" y2="8" stroke={color} strokeWidth="2"/>
        <line x1="13" y1="6" x2="19" y2="6" stroke={color} strokeWidth="1.5"/>
      </g>
    );
    case 'Warcryer': return (
      <g>
        <path d="M8 10 Q16 6 24 10 L24 22 Q16 26 8 22 Z" fill={color} opacity="0.2"/>
        <path d="M8 10 Q16 6 24 10 L24 22 Q16 26 8 22 Z" fill="none" stroke={color} strokeWidth="1.5"/>
        <line x1="8" y1="16" x2="24" y2="16" stroke={color} strokeWidth="1"/>
        <circle cx="16" cy="16" r="3" fill={color} opacity="0.7"/>
        <path d="M12 4 L12 8 M16 3 L16 7 M20 4 L20 8" stroke={color} strokeWidth="1.2"/>
      </g>
    );
    case 'Overlord': return (
      <g>
        <path d="M8 14 L10 8 L14 12 L16 6 L18 12 L22 8 L24 14 L20 14 L16 26 L12 14Z" fill={color} opacity="0.4"/>
        <path d="M8 14 L10 8 L14 12 L16 6 L18 12 L22 8 L24 14 L20 14 L16 26 L12 14Z" fill="none" stroke={color} strokeWidth="1.5"/>
        <circle cx="16" cy="6" r="2" fill={color}/>
        <circle cx="10" cy="8" r="1.5" fill={color}/>
        <circle cx="22" cy="8" r="1.5" fill={color}/>
      </g>
    );
    // ===== SUPPORTS =====
    case 'Shillien Elder': return (
      <g>
        <path d="M16 4 C10 4 6 9 6 15 C6 21 10 26 16 28 C22 26 26 21 26 15 C26 9 22 4 16 4Z" fill="none" stroke={color} strokeWidth="1.5"/>
        <path d="M12 15 L14 13 L16 17 L18 11 L20 15" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="16" cy="9" r="2" fill={color} opacity="0.7"/>
      </g>
    );
    case 'Elven Elder': return (
      <g>
        <circle cx="16" cy="16" r="10" fill="none" stroke={color} strokeWidth="1.5"/>
        <path d="M16 6 L16 26 M6 16 L26 16" stroke={color} strokeWidth="1"/>
        <circle cx="16" cy="16" r="4" fill={color} opacity="0.3"/>
        <circle cx="16" cy="16" r="2" fill={color}/>
        <circle cx="16" cy="6" r="1.5" fill={color}/>
        <circle cx="16" cy="26" r="1.5" fill={color}/>
        <circle cx="6" cy="16" r="1.5" fill={color}/>
        <circle cx="26" cy="16" r="1.5" fill={color}/>
      </g>
    );
    case 'Bishop': return (
      <g>
        <path d="M16 4 L16 26 M8 14 L24 14" stroke={color} strokeWidth="3" strokeLinecap="round"/>
        <circle cx="16" cy="14" r="5" fill="none" stroke={color} strokeWidth="1.5"/>
        <circle cx="16" cy="14" r="2.5" fill={color} opacity="0.6"/>
        <path d="M12 26 L20 26" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </g>
    );
    default:
      if (type === 'mage') return (
        <g>
          <circle cx="16" cy="16" r="9" fill="none" stroke={color} strokeWidth="1.5"/>
          <path d="M16 7 L18 14 L25 14 L19.5 18.5 L21.5 25.5 L16 21 L10.5 25.5 L12.5 18.5 L7 14 L14 14Z" fill={color} opacity="0.8"/>
        </g>
      );
      if (type === 'fighter') return (
        <g>
          <path d="M12 28 L12 8 L16 4 L20 8 L20 28" fill="none" stroke={color} strokeWidth="1.5"/>
          <line x1="12" y1="16" x2="20" y2="16" stroke={color} strokeWidth="2"/>
          <path d="M14 4 L18 4" stroke={color} strokeWidth="1.5"/>
        </g>
      );
      if (type === 'buffer') return (
        <g>
          <path d="M8 14 L10 8 L14 12 L16 6 L18 12 L22 8 L24 14 L20 14 L16 24 L12 14Z" fill={color} opacity="0.5"/>
          <path d="M8 14 L10 8 L14 12 L16 6 L18 12 L22 8 L24 14 L20 14 L16 24 L12 14Z" fill="none" stroke={color} strokeWidth="1.5"/>
        </g>
      );
      return (
        <g>
          <path d="M16 4 L16 28 M8 14 L24 14" stroke={color} strokeWidth="3" strokeLinecap="round"/>
          <circle cx="16" cy="14" r="5" fill="none" stroke={color} strokeWidth="1.5"/>
        </g>
      );
  }
};

export const UnknownClassIcon = ({ size = 48 }) => (
  <div style={{
    width: size, height: size,
    borderRadius: '12px',
    background: 'rgba(100,100,120,0.2)',
    border: '1.5px solid rgba(100,100,120,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#5a5f6d', fontSize: size * 0.35, fontWeight: 700
  }}>?</div>
);
