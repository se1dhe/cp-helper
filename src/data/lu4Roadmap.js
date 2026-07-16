// Полный структурированный роадмап 1→40 под Lu4 (MasterWork).
// Источник: официальная вики Lu4 + стратегическое досье ПЛ (папка 0utLaw).
// Рендерится во вкладке «Роадмап». Прогресс — общий на пачку (roadmapProgress).
//
// Каждая фаза: goal, prime[], offprime[], farmZones[], quests[], gear[], rb[],
// tasks[] (с подзадачами sub[] и советом tip), tips[].
// id задач/подзадач стабильны — на них завязан общий прогресс.

export const LU4_MECHANICS = [
  'Квест-предметы падают СЛУЧАЙНОМУ члену группы за любой килл группы → саппорты качаются наравне. Не воюем за тэг — 3 Сорка AoE-бёрстят пак и кредитят всех.',
  'Bulk turn-in: копим до порога (100 → 150 → 300 → 600), мелкая сдача = потеря бонуса.',
  'Квестовый EXP/Adena не режется усталостью (Fatigue) — «чистый» доход.',
  'Сбор 100 предметов (~10-15 мин) = мана-пит-стоп: сдача у NPC совпадает с реном маны.',
  'Рыбалка и питомцы вырезаны — старые гайды игнорировать.',
];

// Кор-пати — 9 слотов.
export const LU4_CHARACTERS = [
  { role: '×3 Sorcerer', race: 'Human', note: 'Основной AoE-ДД (бёрст толпы)' },
  { role: 'Shillien Elder', race: 'Dark Elf', note: 'Хил / дебафы / MP-саппорт' },
  { role: 'Elven Elder', race: 'Elf', note: 'Хил / баф-саппорт' },
  { role: 'Bishop', race: 'Human', note: 'Основной хил / рес' },
  { role: 'Overlord', race: 'Orc', note: 'Баф / ресто / агр' },
  { role: 'Temple Knight', race: 'Human', note: 'Танк (агр, защита магов)' },
  { role: 'Blade Dancer', race: 'Elf', note: 'Дэнсы, выживаемость' },
];

// 10-е позиции (ротация под ситуацию).
export const LU4_TENTH = ['Bounty Hunter', 'Prophet', 'Warsmith', 'Abyss Walker', 'Warcryer', 'Sword Singer'];

export const LU4_PHASES = [
  // ===================== ФАЗА 0 =====================
  {
    id: 'p0', title: 'Фаза 0 — Подготовка', levels: 'до старта',
    goal: 'Пачка нажимает «старт» без единой секунды простоя.',
    prime: ['Финальная сборка состава, распределение ролей и рас'],
    offprime: ['Прогон маршрутов 1-6 на бумаге, настройка связи'],
    farmZones: [],
    quests: [],
    gear: [],
    rb: [],
    tasks: [
      { id: 'p0-t1', text: 'Создать/закрепить чаров, прописать ники в Ростер', sub: [
        { id: 'p0-t1-s1', text: 'Люди → Talking Island; Эльфы → Elven; Т.Эльфы → Dark Elven; Орк → Orc' },
        { id: 'p0-t1-s2', text: 'Выставить класс и уровень в профиле каждого' },
      ] },
      { id: 'p0-t2', text: 'Каждый выписал свои расовые квесты 1-6 заранее' },
      { id: 'p0-t3', text: 'Забить прайм/оффпрайм и RB-окна в «Расписание»', tip: 'Мега-одноразовые квесты планируй на оффпрайм — меньше конкуренции.' },
      { id: 'p0-t4', text: 'У каждого личный запас Blessed Scroll of Resurrection', tip: 'Персональный предмет — Бишоп НЕ хранит его на всех.' },
      { id: 'p0-t5', text: 'Голосовая связь; ПЛ маркает цели; правило bulk turn-in вслух' },
    ],
    tips: ['Дисциплина с первой минуты решает: один радиус фарма, никто не бежит в город в одиночку.'],
  },

  // ===================== ФАЗА 1 =====================
  {
    id: 'p1', title: 'Фаза 1 — Расовый старт', levels: '1 → 6',
    goal: 'Выйти из деревни к 5-6 lvl с NG-оружием и бижей. Стартуем раздельно по расам.',
    prime: ['Каждый гонит свои расовые квесты в своей деревне'],
    offprime: ['То же — квесты не требуют координации, можно в любое время'],
    farmZones: ['Окрестности своей стартовой деревни (Keltir/Elpy у TI; поля Elven/DE/Orc/Dwarven)'],
    quests: [
      { name: 'Letters of Love', ru: 'Любовное Послание', npc: 'Darin, TI', lvl: '2-5', rep: '1️⃣', reward: 'Necklace of Knowledge NG' },
      { name: 'What Women Want', ru: 'Чего Хотят Женщины', npc: 'Arujien, Elven', lvl: '2-5', rep: '1️⃣', reward: 'Mystic\'s Earring NG' },
      { name: 'Mass of Darkness', ru: 'Тёмная Месса', npc: 'Undrias, DE', lvl: '2-5', rep: '1️⃣', reward: '250 ад' },
      { name: 'Long live the Pa\'agrio Lord!', ru: 'Долой Лорда Паагрио', npc: 'Nakusin, Orc', lvl: '2-5', rep: '1️⃣', reward: 'Club NG (оружие)' },
      { name: 'Fruit of the Mother Tree', ru: 'Плод Древа Жизни', npc: 'Andellia, Elven', lvl: '3-7', rep: '1️⃣', reward: 'зелья, 500 ад' },
    ],
    gear: ['NG бижа с обучающих квестов', 'NG оружие: орки — Club (Pa\'agrio Lord)'],
    rb: [],
    tasks: [
      { id: 'p1-t1', text: 'Все: 1-й обучающий квест расы → NG бижа' },
      { id: 'p1-t2', text: 'Все: расовый пакет старт-квестов (2-3 шт) → адена/зелья' },
      { id: 'p1-t3', text: 'Люди на 3 lvl: Find Sir Windawood (Abellos) → зелья скорости', tip: 'Скорость перемещения = скорость прокачки.' },
      { id: 'p1-t4', text: 'Дойти каждому до 5-6 lvl' },
    ],
    tips: ['Overlord географически изолирован — не увлекайся, готовь его к маршу (фаза 2).'],
  },

  // ===================== ФАЗА 2 =====================
  {
    id: 'p2', title: 'Фаза 2 — Оружие, заряды, сбор', levels: '6 → 12',
    goal: 'NG-оружие своего класса у всех + запас зарядов; пачка собирается в Глудине.',
    prime: ['Стэк-фарм лагерей Lizardmen/Orcs всей группой: The Guard is Busy + Orc Subjugation'],
    offprime: ['Индивидуальные оружейные квесты по расам', 'Первый прогон зарядных квестов'],
    farmZones: ['Окрестности деревень → поля Gludin/Gludio', 'Лагеря Langk Lizardmen (запад Глудина), Orc camps', 'Вход в Ant Nest (12+) для добора'],
    quests: [
      { name: 'Sword of Solidarity', ru: 'Меч Единства', npc: 'Roien, TI', lvl: '9-16', rep: '1️⃣', reward: 'NG оружие (Люди) + 3500 SS' },
      { name: 'Spirit of Mirrors', ru: 'Дух Зеркал', npc: 'Gallint, TI', lvl: '10-15', rep: '1️⃣', reward: 'Wand of Adept NG (маги!) + 1750 SpS' },
      { name: 'Forgotten Truth', ru: 'Забытая Правда', npc: 'Thifiell, DE', lvl: '10-15', rep: '1️⃣', reward: 'NG оружие (Т.Эльфы)' },
      { name: 'Skirmish with the Orcs', ru: 'Стычка с Орками', npc: 'Kendell, Elven', lvl: '10-15', rep: '1️⃣', reward: 'Red Sunset Staff NG (маги-эльфы)' },
      { name: 'The Guard is Busy', ru: 'Помощь Страже', npc: 'Gilbert, TI', lvl: '6-16', rep: '🔁', reward: '800 SS, бонус 10+ = 1000 ад' },
      { name: 'Bonds of Slavery', ru: 'Цепи Рабства', npc: 'Kristin, DE', lvl: '6-11', rep: '🔁', reward: '1-й раз: 2000 SS + 1000 SpS' },
      { name: 'The Hidden Veins', ru: 'Скрытые Жилы', npc: 'Filaur, Dwarven', lvl: '6-15', rep: '🔁', reward: '2000 SS, бонус 10+ = 2000 ад' },
    ],
    gear: ['NG оружие класса: маги — Wand of Adept / Red Sunset Staff', 'Запас NG soul/spirit shots с зарядных квестов'],
    rb: [],
    tasks: [
      { id: 'p2-t1', text: 'Каждый закрыл оружейный квест', sub: [
        { id: 'p2-t1-s1', text: 'Маги-люди: Spirit of Mirrors (Wand of Adept)' },
        { id: 'p2-t1-s2', text: 'Т.Эльфы: Forgotten Truth; маги-эльфы: Skirmish with the Orcs' },
      ] },
      { id: 'p2-t2', text: 'Каждый прогнал 1-й раз зарядный квест', tip: 'Единоразовые бонусы зарядов покрывают первые уровни — соски дорогие, не сливай.' },
      { id: 'p2-t3', text: 'Overlord начал марш к Глудио строго на 12-15 lvl' },
      { id: 'p2-t4', text: 'Сбор всей пачки в Gludin к 12-15 lvl' },
      { id: 'p2-t5', text: 'На месте: у ВСЕХ включить The Guard is Busy + Orc Subjugation (Kayleen)', prime: true },
    ],
    tips: ['Стэк-фарм лагеря: пачка в одном радиусе, у каждого активны оба квеста в журнале — проверь саппортов ПЕРЕД фармом.'],
  },

  // ===================== ФАЗА 3 =====================
  {
    id: 'p3', title: 'Фаза 3 — Броня и разгон', levels: '12 → 19',
    goal: 'Первый NG-сет брони, разгон к 19 под мега-квест Dragon Fangs.',
    prime: ['Стэк-фарм скелетов/ящеров + фоновые адена-квесты (Grim Collector)'],
    offprime: ['Одноразовые опытные квесты (Cure for Fever, Offspring, Will the Seal)'],
    farmZones: ['Ruins of Agony / Ruins of Despair (Gludio)', 'Windmill Hill, Gludin Wasteland', 'Cruma Marshlands (16+)'],
    quests: [
      { name: 'Cure for Fever Disease', ru: 'Лекарство от Лихорадки', npc: 'Elias, TI', lvl: '15-21', rep: '1️⃣', reward: 'Bone Shield NG + 20,000 EXP' },
      { name: 'Offspring of Nightmares', ru: 'Исчадие Ада', npc: 'Vlasty, DE', lvl: '15-20', rep: '1️⃣', reward: '20,000 EXP + 15,000 ад' },
      { name: 'Will the Seal be Broken?', ru: 'Как Снять Проклятие?', npc: 'Talloth, DE', lvl: '16-26', rep: '1️⃣', reward: 'NG броня + D-Enchant Scrolls + 25k EXP' },
      { name: 'Grim Collector', ru: 'Беспощадный Коллекционер', npc: 'Curtis, Gludio', lvl: '15-26', rep: '🔁', reward: 'Complete Skeleton = 300 ад' },
      { name: 'Crystals of Fire and Ice', ru: 'Кристаллы Огня и Льда', npc: 'Katerina, TI', lvl: '17-23', rep: '🔁', reward: 'бонус 100+ = 10,000 ад' },
    ],
    gear: ['Bone Shield (Cure for Fever) → магу/саппорту под AoE', 'Первый NG-сет (Will the Seal + дроп)', 'D-Enchant Scrolls — СОХРАНИТЬ до D-оружия!'],
    rb: ['Zombie Lord Ferkel (20)', 'Madness Beast (20)'],
    tasks: [
      { id: 'p3-t1', text: 'Все: Cure for Fever Disease (Bone Shield + 20k EXP)', offprime: true },
      { id: 'p3-t2', text: 'Все: Will the Seal be Broken? — сохранить D-Enchant Scrolls!', offprime: true, tip: 'НЕ трать D-скроллы на NG — жди D-оружие с 1-й профы, тогда точи.' },
      { id: 'p3-t3', text: 'Собрать первый NG-сет брони' },
      { id: 'p3-t4', text: 'Держать 1-2 адена-квеста фоном (Grim Collector)', prime: true },
      { id: 'p3-t5', text: 'Дойти всем до 19 lvl' },
    ],
    tips: ['К 19 lvl быть готовым сразу нырнуть в Dragon Fangs (фаза 4) — это 350k EXP.'],
  },

  // ===================== ФАЗА 4 =====================
  {
    id: 'p4', title: 'Фаза 4 — Мега-квесты + 1-я профа', levels: '19 → 26', star: true,
    goal: 'Обогнать сервер за счёт одноразовых мега-квестов (~900k+ EXP на каждого) и получить D-грейд.',
    prime: ['Цикл Magnificent Feast (D-бижа) + Adept of Taste (53k EXP)', 'Донор-квесты Глудина (Making the Harvest Grounds Safe, Sense for Business)'],
    offprime: ['Мега-одноразовые: Dragon Fangs, Red-Eyed Invaders, Blood Fiend, Dangerous Seduction, Seed of Evil'],
    farmZones: ['Cruma Marshlands, Death Pass, Fellmere Harvesting Grounds (Gludin)', 'Abandoned Camp, Plains of Dion (23+)', 'Execution Grounds (25+), Gorgon Flower Garden'],
    quests: [
      { name: 'Dragon Fangs ⭐', ru: 'Клыки Дракона', npc: 'Luis, Gludin', lvl: '19-29', rep: '1️⃣', reward: '350,000 EXP + случайная D-броня' },
      { name: 'Red-Eyed Invaders ⭐', ru: 'Красноглазые Захватчики', npc: 'Babenco, Gludio', lvl: '20-28', rep: '1️⃣', reward: '~300k EXP + 3 Blessed Res + 9-12k ад' },
      { name: 'Blood Fiend', ru: 'Кровный Враг', npc: 'Creamees, Elven', lvl: '21-26', rep: '1️⃣', reward: '100,000 EXP + D-эликсиры' },
      { name: 'Dangerous Seduction', ru: 'Опасное Искушение', npc: 'Vellior, DE', lvl: '21-26', rep: '1️⃣', reward: '100,000 EXP (Т.Эльфы)' },
      { name: 'Seed of Evil', ru: 'Семя Зла', npc: 'Biotin, TI', lvl: '21-26', rep: '1️⃣', reward: '50,000 EXP + D-Enchant Scrolls' },
      { name: 'Adept of Taste', ru: 'Гурман', npc: 'Дион (Magnificent Feast)', lvl: '20-40', rep: '🔁', reward: '53,000 EXP за сдачу' },
    ],
    gear: ['D-оружие: Weapon Upgrade Coupon за 1-ю профу (обмен без налога)', 'Применить сохранённые D-Enchant Scrolls', 'D-бижа: цепочка Magnificent Feast (Дион)'],
    rb: ['Serpent Demon Bifrons (21)', 'Greyclaw Kutus (23)', 'Unrequited Kael (24)', 'Pan Dryad / Princess Molrang / Soul Scavenger (25)'],
    tasks: [
      { id: 'p4-t1', text: 'На 19: Dragon Fangs (Luis) — 350k EXP + D-броня', offprime: true, star: true },
      { id: 'p4-t2', text: 'На 20: 1-я профа ВСЕЙ пачкой синхронно', star: true, sub: [
        { id: 'p4-t2-s1', text: 'Забрать Weapon Upgrade Coupon (NG→D)' },
        { id: 'p4-t2-s2', text: 'Обмен оружия NG→D в городе БЕЗ налога' },
        { id: 'p4-t2-s3', text: 'Применить D-Enchant Scrolls на новое D-оружие' },
      ] },
      { id: 'p4-t3', text: 'На 20: Red-Eyed Invaders — ~300k EXP + 3 Blessed Res', offprime: true, star: true },
      { id: 'p4-t4', text: 'Blood Fiend / Dangerous Seduction / Seed of Evil (по расам) = +250k', offprime: true },
      { id: 'p4-t5', text: 'Запустить Magnificent Feast (D-бижа) + Adept of Taste (опыт)', prime: true },
      { id: 'p4-t6', text: 'Дойти до 26 lvl' },
    ],
    tips: ['Мега-квесты бей по мере открытия уровня, не копи «на потом» — опыт нужен сразу для следующего замка.'],
  },

  // ===================== ФАЗА 5 =====================
  {
    id: 'p5', title: 'Фаза 5 — D-грейд и донор', levels: '26 → 35',
    goal: 'Полный D-сет на ядро, стабильная казна, разгон к 35 под цепочку Temple.',
    prime: ['Донор в толпе: Arrow of Vengeance / Fairy Breath (Cruma Tower — топ AoE для 3 Сорков)', 'Aiding the Floran Village — слоты D-брони'],
    offprime: ['Одноразовые: Acts of Evil (200k), Proof of Clan Alliance (200k)', 'Song of the Hunter: фарм C-Blessed SpS и красок'],
    farmZones: ['Cruma Tower 1-2F (маги — топ AoE)', 'Plains of the Lizardmen (Дион), Ivory Tower Crater', 'Sea of Spores (Cruma), Floran (медведи, добор)', 'Поля Giran СВ (Arrow of Vengeance)'],
    quests: [
      { name: 'Acts of Evil ⭐', ru: 'Злодеяния', npc: 'Alvah, Gludin', lvl: '27-32', rep: '1️⃣', reward: '200,000 EXP + 20k SP + D-броня Turek' },
      { name: 'Proof of Clan Alliance', ru: 'Сплочённость Клана', npc: 'Sir Kristof, Giran', lvl: '25-60', rep: '1️⃣', reward: '200,000 EXP (нужен клан 4 ур.)' },
      { name: 'Fairy Breath', ru: 'Дыхание Фей', npc: 'Galatea, Gludin', lvl: '30-42', rep: '🔁', reward: '150+ = 50,000 EXP + 10k ад' },
      { name: 'Arrow of Vengeance', ru: 'Стрела Возмездия', npc: 'Belton, Giran', lvl: '32-39', rep: '🔁', reward: '600+ = 58,800 ад' },
      { name: 'Aiding the Floran Village', ru: 'Помощь Флорану', npc: 'Maria, Дион', lvl: '30-42', rep: '🔁', reward: 'D-броня / адена (450 предм = топ)' },
      { name: 'Song of the Hunter', ru: 'Песня Охотника', npc: 'Hunter\'s Village', lvl: '30-60', rep: '🔁', reward: 'C-Blessed Spiritshot, краски +3/-3' },
    ],
    gear: ['Полный D-сет: приоритет 3 Сорка → танк → хил', 'D-броня: Acts of Evil (Turek), Aiding Floran', 'Копить C-Blessed SpS и краски (Сорки: INT/WIT/MEN)'],
    rb: ['Tiger Hornet (26)', 'Tirak (28)', 'Cat\'s Eye Bandit / Turek Merc Captain (30)', 'Skyla (32)', 'Corsair Captain Kylon (33)', 'Stakato Queen Zyrnna / Cronos Servitor Mumu (34)'],
    tasks: [
      { id: 'p5-t1', text: 'На 27: Acts of Evil (200k EXP + D-броня Turek)', offprime: true, star: true },
      { id: 'p5-t2', text: 'Собрать клан до 4 ур. → Proof of Clan Alliance (+200k)', offprime: true },
      { id: 'p5-t3', text: 'Донор в прайм: Arrow of Vengeance / Fairy Breath', prime: true },
      { id: 'p5-t4', text: 'Aiding the Floran Village — закрыть слоты D-брони', prime: true },
      { id: 'p5-t5', text: 'Song of the Hunter — копить C-Blessed SpS и краски', prime: true },
      { id: 'p5-t6', text: 'Полный D-сет на 3 Сорках, танке, хиле' },
      { id: 'p5-t7', text: 'Дойти до 35 lvl' },
    ],
    tips: ['Cruma Tower — идеальная AoE-зона для 3 Сорков (плотные паки). Держи её под контролем в прайм.'],
  },

  // ===================== ФАЗА 6 =====================
  {
    id: 'p6', title: 'Фаза 6 — Цепочка Temple + 2-я профа', levels: '35 → 40', star: true,
    goal: 'Пройти цепочку Temple (~3.2 МЛН EXP суммарно) и взять 2-ю профу на 40.',
    prime: ['Донор: Trespassing (Restina, 600+ = 228k ад) и Аллигаторы (600+ = 96.7k + карты)'],
    offprime: ['Цепочка Temple (Missionary → ... → Fallen Angel) — синхронно всей пачкой'],
    farmZones: ['Alligator Island (болота Хейна)', 'Ivory Tower (монолиты, 40)', 'Sacred Area / Храм Евы (Хейн — Blade Stakato)', 'Timak (Орен), Forsaken Plains (добор)'],
    quests: [
      { name: 'Temple Missionary → Executor', ru: 'Проповедник → Палач Храма', npc: 'Glyvka/Shegfield, Дион', lvl: '35-45', rep: '1️⃣', reward: '253,160 + 253,160 EXP' },
      { name: 'Temple Champion 1 & 2', ru: 'Воитель Храма 1-2', npc: 'Sylvain, Дион', lvl: '35-45', rep: '1️⃣', reward: '316,450 + 352,612 EXP' },
      { name: 'Shadow Fox 1-3', ru: 'Сумрачный Лис 1-3', npc: 'Mia/Kluck/Natools, Хейн', lvl: '37-45', rep: '1️⃣', reward: '313k + 313k + 395k EXP' },
      { name: 'Fallen Angel: Dawn / Dusk', ru: 'Падший Ангел: Рассвет/Закат', npc: 'Natools, Хейн', lvl: '38-45', rep: '1️⃣', reward: '592,724 + 435,826 EXP' },
      { name: 'Trespassing into the Sacred Area ⭐', ru: 'Вторжение на Святую Землю', npc: 'Restina, Хейн', lvl: '36-48', rep: '🔁', reward: '600+ = 228,000 ад' },
      { name: 'Conquest of Alligator Island ⭐', ru: 'Аллигаторы', npc: 'Kluck, Хейн', lvl: '38-49', rep: '🔁', reward: '600+ = 96,700 ад + Pirate Map' },
    ],
    gear: ['Казна с Trespassing позволяет начать переход на C-грейд', 'Копить Pirate\'s Treasure Map / Mystic Map Parts (Treasure Hunt 42+)'],
    rb: ['Flame Lord Shadar / Gargoyle Lord Sirocco / Beleth\'s Eye (35)', 'Evil Spirit Tempest / Sebek (36)', 'Rayito the Looter (37)', 'Lizardmen Leader Hellion (38)'],
    tasks: [
      { id: 'p6-t1', text: 'Цепочка Temple (Дион): Missionary → Executor → Champion 1 → 2', offprime: true, star: true },
      { id: 'p6-t2', text: 'Хейн: Shadow Fox 1-3 → Fallen Angel Dawn (592k!) → Dusk', offprime: true, star: true },
      { id: 'p6-t3', text: 'Донор Trespassing (Restina, цель 600 = 228k ад)', prime: true },
      { id: 'p6-t4', text: 'Донор Аллигаторы (Kluck, 600 = 96.7k + карты)', prime: true },
      { id: 'p6-t5', text: 'Копить Pirate\'s Treasure Map / Mystic Map Parts' },
      { id: 'p6-t6', text: 'На 40: 2-я профа ВСЕЙ пачкой синхронно', star: true },
    ],
    tips: ['Цепочку Temple проходи синхронно — звенья требуют предыдущих, отстающий тормозит всех. Донор качай параллельно теми же выходами.'],
  },
];

// Уровневый диапазон каждой фазы (для авто-определения активной фазы).
const PHASE_BANDS = [
  ['p1', 1, 6], ['p2', 6, 12], ['p3', 12, 19],
  ['p4', 19, 26], ['p5', 26, 35], ['p6', 35, 999],
];

// Медианный уровень пачки (устойчив к одному «забывчивому» участнику).
export const packLevel = (members) => {
  const lvls = (members || []).map(m => Number(m.lvl) || 1).filter(n => n >= 1).sort((a, b) => a - b);
  if (!lvls.length) return 1;
  const mid = Math.floor(lvls.length / 2);
  return lvls.length % 2 ? lvls[mid] : Math.floor((lvls[mid - 1] + lvls[mid]) / 2);
};

// Активная фаза по уровню пачки. started=false (до старта сервера) → фаза 0.
export const getActivePhaseId = (level, started = true) => {
  if (!started) return 'p0';
  const L = Number(level) || 1;
  if (L <= 1) return 'p1';
  for (const [id, a, b] of PHASE_BANDS) if (L >= a && L < b) return id;
  return 'p6';
};

// Плоский список всех id задач и подзадач (для расчёта прогресса).
export const allTaskIds = () => {
  const ids = [];
  for (const ph of LU4_PHASES) {
    for (const t of ph.tasks) {
      ids.push(t.id);
      if (t.sub) for (const s of t.sub) ids.push(s.id);
    }
  }
  return ids;
};
