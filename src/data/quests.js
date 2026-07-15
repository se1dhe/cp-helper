const parseSortLevel = (lvl) => {
  const match = lvl.match(/^(\d+)/);
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
