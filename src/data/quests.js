const QUESTS = {
  universal: [
    {
      name: 'Bonds of Slavery',
      lvl: '6–11',
      npc: 'Sentry Kristell',
      reward: 'Adena, NG Soulshots/Spiritshots',
      description: 'Повторяемый квест на фарм NG зарядов. Необходим для обеспечения группы расходниками на старте.',
      notes: 'Сдавать только пачками от 100+ предметов для активации бонусного множителя награды.'
    },
    {
      name: 'Invaders of the Holy Land',
      lvl: '6–14',
      npc: 'Atuba Chief Varkees',
      reward: 'Adena, NG Soulshots/Spiritshots',
      description: 'Повторяемый квест на фарм мобов-захватчиков. Хороший источник адены и зарядов на ранних уровнях.',
      notes: 'Выполняется в локации рядом с оркской деревней. Удобен для одновременного фарма всей группой.'
    },
    {
      name: 'The Hidden Veins',
      lvl: '6–15',
      npc: 'Elder Filaur',
      reward: 'Adena, NG Soulshots/Spiritshots',
      description: 'Квест на фарм в шахтах. Дает стабильный приток адены и зарядов души/духа.',
      notes: 'Мобы в шахтах агрессивны — требуется осторожность на низких уровнях.'
    },
    {
      name: 'Orc Hunting',
      lvl: '6–16',
      npc: 'Sentinel Rayen',
      reward: 'Adena, NG Soulshots/Spiritshots',
      description: 'Охота на орков. Один из основных повторяемых квестов для фарма зарядов.',
      notes: 'Хорошо комбинируется с квестами на тех же мобов в локации.'
    },
    {
      name: 'The Guard is Busy',
      lvl: '6–16',
      npc: 'Captain Gilbert (Gludin)',
      reward: 'Adena, NG Soulshots/Spiritshots',
      description: 'Квест на фарм lizardmen/orcs в окрестностях Gludin. Лучший способ накопления адены и зарядов перед рывком к 20 уровню.',
      notes: 'ПЛ обязан активировать этот квест у всей группы одновременно. Стек-фарм с Orc Subjugation.'
    },
    {
      name: 'Cure for Fever Disease',
      lvl: '15–21',
      npc: 'Elias (Human Settlement)',
      reward: 'Массивный EXP, SP, Bone Shield (NoGrade Shield)',
      description: 'Критически важный одноразовый квест. Дает огромное количество опыта и SP, а также редкий щит.',
      notes: 'Приоритет №1 после 15 уровня. Щит передается магам или саппортам для повышения выживаемости при AoE-фарме.'
    },
    {
      name: 'Will the Seal be Broken?',
      lvl: '16–26',
      npc: 'Talloth (Gludin)',
      reward: 'EXP, SP, NoGrade Armor, D-grade Scroll',
      description: 'Одноразовый квест. Основной источник первого сета брони и свитков модификации ранга D.',
      notes: 'Выполнять перед сменой профессии. Позволяет подготовить D-grade экипировку.'
    },
    {
      name: 'Dragon Fangs',
      lvl: '19–29',
      npc: 'Guard Luis (Gludio)',
      reward: 'EXP, SP, NoGrade доспехи',
      description: 'Финальный квест на броню перед сменой профессии. Дает комплект NoGrade доспехов.',
      notes: 'Финальный гир перед 1-й профессией. Обязателен к выполнению.'
    }
  ],

  race: {
    human: {
      label: 'Люди',
      quests: [
        {
          name: 'Letters of Love',
          lvl: '2–5',
          npc: 'Darun (Talking Island Village)',
          reward: 'NoGrade бижутерия',
          description: 'Стартовый квест для людей. Дает базовую бижутерию NoGrade.',
          notes: 'Выполнить перед выходом с Talking Island.'
        },
        {
          name: 'Deliver Goods',
          lvl: '2–7',
          npc: 'Guard Arnold (Talking Island Village)',
          reward: 'NoGrade бижутерия, EXP, SP',
          description: 'Квест на доставку товаров. Дополнительный источник бижутерии и опыта.',
          notes: 'Совмещать с Letters of Love для максимальной эффективности.'
        },
        {
          name: 'Sword of Solidarity',
          lvl: '9–16',
          npc: 'Roel (Talking Island Village)',
          reward: 'NG Оружие, Soulshots',
          description: 'Основной источник NoGrade оружия для людей. Крайне важен для старта.',
          notes: 'Выполнить до перехода в Gludin. Обеспечивает группу базовым оружием.'
        },
        {
          name: 'Spirit of Mirrors',
          lvl: '10–15',
          npc: 'Grand Master Gallint',
          reward: 'Снаряжение, расходники',
          description: 'Дополнительный источник снаряжения для магов. Рекомендован к выполнению.',
          notes: 'Особенно полезен для магов (Sorcerer, Necromancer) — дает заряды духа.'
        },
        {
          name: 'Find Sir Windawood',
          lvl: '3',
          npc: 'Talking Island Village',
          reward: 'Стартовые зелья ускорения',
          description: 'Простой квест на 3 уровне для получения зелий ускорения.',
          notes: 'Скорость перемещения группы — скорость прокачки. Обязателен для всех.'
        }
      ]
    },
    elf: {
      label: 'Эльфы',
      quests: [
        {
          name: 'What Women Want',
          lvl: '2–5',
          npc: 'Trader Elsa (Elven Village)',
          reward: 'Adena, NoGrade бижутерия, EXP, SP',
          description: 'Стартовый квест эльфов. Дает адены, бижутерию и опыт.',
          notes: 'Выполнить перед выходом из Elven Village.'
        },
        {
          name: 'Fruit of the Mother Tree',
          lvl: '2–5',
          npc: 'Hierarch Astherios (Elven Village)',
          reward: 'Зелья, Adena',
          description: 'Квест на сбор фруктов с Древа Матери. Дает зелья восстановления и адену.',
          notes: 'Полезен для получения стартовых расходников перед выходом в мир.'
        }
      ]
    },
    dark_elf: {
      label: 'Темные Эльфы',
      quests: [
        {
          name: 'Mass of Darkness',
          lvl: '2–5',
          npc: 'Hierarch Thifiell (Dark Elven Village)',
          reward: 'Adena, EXP, SP',
          description: 'Стартовый квест темных эльфов. Дает адену и опыт.',
          notes: 'Выполнить перед выходом из Dark Elven Village.'
        },
        {
          name: 'Forgotten Truth',
          lvl: '10–15',
          npc: 'Hierarch Thifiell (Dark Elven Village)',
          reward: 'NG Оружие, Заряды',
          description: 'Расовый аналог Sword of Solidarity для темных эльфов. Основной источник оружия.',
          notes: 'Расовый аналог квеста людей. Обязателен для всех темных эльфов.'
        },
        {
          name: "Shilen's Hunt",
          lvl: '10–15',
          npc: 'Dark Elven Village',
          reward: 'EXP, SP, снаряжение',
          description: 'Связка с Forgotten Truth. Дополнительный источник опыта и снаряжения.',
          notes: 'Обязательная связка для темных эльфов. Выполняется вместе с Forgotten Truth.'
        }
      ]
    },
    orc: {
      label: 'Орки',
      quests: [
        {
          name: "Long live the Pa'agrio Lord!",
          lvl: '2–5',
          npc: 'Centurion Nakusin (Orc Village)',
          reward: 'NoGrade оружие',
          description: 'Стартовый квест орков. Сразу дает NoGrade оружие — отличный старт.',
          notes: 'Дает оружие уже на старте, что сильно ускоряет фарм на начальных уровнях.'
        }
      ]
    },
    dwarf: {
      label: 'Гномы',
      quests: [
        {
          name: "Miner's Favor",
          lvl: '2–5',
          npc: 'Miner Bolter (Village of Gray Column)',
          reward: 'Adena, EXP, SP',
          description: 'Стартовый квест гномов. Дает адену и опыт.',
          notes: 'Выполнить перед выходом из деревни гномов.'
        },
        {
          name: 'Jumble, Tumble, Diamond Fuss',
          lvl: '10–14',
          npc: 'Collector Gouph',
          reward: 'NG Оружие, расходники',
          description: 'Квест на оружие и расходники для гномов.',
          notes: 'Основной источник оружия для гномов. Выполнить до 15 уровня.'
        }
      ]
    }
  }
};

const CLASS_TO_RACE = {
  // Humans
  'Sorcerer': 'human',
  'Necromancer': 'human',
  'Bishop': 'human',
  'Prophet': 'human',
  'Paladin': 'human',
  'Dark Avenger': 'human',
  'Gladiator': 'human',
  'Warlord': 'human',
  'Treasure Hunter': 'human',
  'Hawkeye': 'human',
  'Terramancer': 'human',
  // Elves
  'Spellsinger': 'elf',
  'Elven Elder': 'elf',
  'Temple Knight': 'elf',
  'Plains Walker': 'elf',
  'Silver Ranger': 'elf',
  'Sword Singer': 'elf',
  // Dark Elves
  'Spellhowler': 'dark_elf',
  'Shillien Elder': 'dark_elf',
  'Abyss Walker': 'dark_elf',
  'Phantom Ranger': 'dark_elf',
  'Blade Dancer': 'dark_elf',
  // Orcs
  'Destroyer': 'orc',
  'Tyrant': 'orc',
  'Overlord': 'orc',
  'Warcryer': 'orc',
  // Dwarves
  'Bounty Hunter': 'dwarf',
  'Warsmith': 'dwarf'
};

export const getRaceForClass = (className) => {
  return CLASS_TO_RACE[className] || null;
};

export const getQuestsForClass = (className) => {
  const race = getRaceForClass(className);
  if (!race) return [];
  const raceQuests = QUESTS.race[race]?.quests || [];
  return [...QUESTS.universal, ...raceQuests];
};

export const getRaceLabel = (className) => {
  const race = getRaceForClass(className);
  return race ? QUESTS.race[race]?.label : null;
};

export default QUESTS;
