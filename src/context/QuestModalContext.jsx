import React, { createContext, useCallback, useContext, useState } from 'react';
import { QuestModal } from '../components/QuestModal';

// Единая модалка прохождения квеста, доступная из любой страницы.
// openQuest(quest) — quest это объект карточки ({ name, lvl, npc, reward, ... }).
// Полное прохождение подтягивается по имени из questDetails.json внутри модалки.
const QuestModalContext = createContext({ openQuest: () => {} });

export const useQuestModal = () => useContext(QuestModalContext);

export const QuestModalProvider = ({ children }) => {
  const [quest, setQuest] = useState(null);

  const openQuest = useCallback((q) => setQuest(q || null), []);
  const close = useCallback(() => setQuest(null), []);

  return (
    <QuestModalContext.Provider value={{ openQuest }}>
      {children}
      <QuestModal quest={quest} onClose={close} />
    </QuestModalContext.Provider>
  );
};
