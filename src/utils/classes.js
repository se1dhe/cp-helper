// Полный список классов Lineage 2 для КП
export const L2_CLASSES = [
  // Mages
  { id: 'sorcerer', name: 'Sorcerer', type: 'mage', abbr: 'S', color: '#60a5fa' },
  { id: 'spellsinger', name: 'Spellsinger', type: 'mage', abbr: 'SPS', color: '#93c5fd' },
  { id: 'spellhowler', name: 'Spellhowler', type: 'mage', abbr: 'SH', color: '#3b82f6' },
  { id: 'necromancer', name: 'Necromancer', type: 'mage', abbr: 'Necr', color: '#1e3a8a' },
  { id: 'terramancer', name: 'Terramancer', type: 'mage', abbr: 'T', color: '#a78bfa' }, // Custom server class
  // Fighters
  { id: 'gladiator', name: 'Gladiator', type: 'fighter', abbr: 'Gl', color: '#ef4444' },
  { id: 'warlord', name: 'Warlord', type: 'fighter', abbr: 'WL', color: '#b91c1c' },
  { id: 'paladin', name: 'Paladin', type: 'fighter', abbr: 'Pal', color: '#f87171' },
  { id: 'dark_avenger', name: 'Dark Avenger', type: 'fighter', abbr: 'DA', color: '#7f1d1d' },
  { id: 'treasure_hunter', name: 'Treasure Hunter', type: 'fighter', abbr: 'TH', color: '#fca5a5' },
  { id: 'hawkeye', name: 'Hawkeye', type: 'fighter', abbr: 'HE', color: '#f87171' },
  { id: 'plains_walker', name: 'Plains Walker', type: 'fighter', abbr: 'PW', color: '#fda4af' },
  { id: 'silver_ranger', name: 'Silver Ranger', type: 'fighter', abbr: 'SR', color: '#fecdd3' },
  { id: 'abyss_walker', name: 'Abyss Walker', type: 'fighter', abbr: 'AW', color: '#e11d48' },
  { id: 'phantom_ranger', name: 'Phantom Ranger', type: 'fighter', abbr: 'PR', color: '#9f1239' },
  { id: 'destroyer', name: 'Destroyer', type: 'fighter', abbr: 'Destr', color: '#991b1b' },
  { id: 'tyrant', name: 'Tyrant', type: 'fighter', abbr: 'Tyr', color: '#dc2626' },
  { id: 'bounty_hunter', name: 'Bounty Hunter', type: 'fighter', abbr: 'BH', color: '#f59e0b' },
  { id: 'warsmith', name: 'Warsmith', type: 'fighter', abbr: 'WS', color: '#d97706' },
  { id: 'blade_dancer', name: 'Blade Dancer', type: 'fighter', abbr: 'BD', color: '#ef4444' },
  // Buffers & Supports
  { id: 'sword_singer', name: 'Sword Singer', type: 'buffer', abbr: 'SWS', color: '#fbbf24' },
  { id: 'prophet', name: 'Prophet', type: 'buffer', abbr: 'PP', color: '#fcd34d' },
  { id: 'warcryer', name: 'Warcryer', type: 'buffer', abbr: 'WC', color: '#f59e0b' },
  { id: 'overlord', name: 'Overlord', type: 'buffer', abbr: 'OL', color: '#fbbf24' },
  { id: 'shillien_elder', name: 'Shillien Elder', type: 'support', abbr: 'SE', color: '#34d399' },
  { id: 'elven_elder', name: 'Elven Elder', type: 'support', abbr: 'EE', color: '#6ee7b7' },
  { id: 'bishop', name: 'Bishop', type: 'support', abbr: 'BP', color: '#10b981' }
];

export const getClassDetails = (name) => {
  return L2_CLASSES.find(c => c.name === name) || { id: 'unknown', name, type: 'unknown', abbr: '?', color: '#ccc' };
};
