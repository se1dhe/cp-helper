const parseSortLevel = (lvl) => {
  const match = String(lvl ?? '').match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 999;
};

const sortByLevel = (arr) =>
  [...arr].sort((a, b) => parseSortLevel(a.lvl) - parseSortLevel(b.lvl));

export const getRaceForClass = (questData, className) => {
  if (!questData?.classToRace) return null;
  return questData.classToRace[className] || null;
};

export const getUniversalQuests = (questData) => {
  if (!questData?.universal) return [];
  return sortByLevel(questData.universal);
};

export const getRaceQuestsForClass = (questData, className) => {
  const race = getRaceForClass(questData, className);
  if (!race || !questData?.race?.[race]) return [];
  return sortByLevel(questData.race[race].quests || []);
};

export const getRaceLabel = (questData, className) => {
  const race = getRaceForClass(questData, className);
  if (!race || !questData?.race?.[race]) return null;
  return questData.race[race].label || null;
};

// Верхняя граница диапазона уровней квеста ('15–21' -> 21). Нет чисел -> 999 (не прячем).
export const questMaxLevel = (lvl) => {
  const nums = String(lvl ?? '').match(/\d+/g);
  return nums && nums.length ? parseInt(nums[nums.length - 1], 10) : 999;
};

// Скрываем квест у мембера, если он выполнен И мембер перерос верхнюю границу уровня.
export const isQuestHiddenForMember = (quest, memberLevel, done) =>
  done === true && (Number(memberLevel) || 1) > questMaxLevel(quest?.lvl);

// Ссылка на прохождение: site-search по базе знаний Lu4 (masterwork.wiki) по англ. названию.
export const questWikiUrl = (name) =>
  `https://www.google.com/search?q=${encodeURIComponent(`site:masterwork.wiki ${name || ''}`)}`;
