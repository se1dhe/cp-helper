// Расчёт обратного отсчёта до старта сервера по строке даты 'YYYY-MM-DD'.
// Возвращает: null | { started:false, days } | { started:true, dayNumber }
export const getCountdown = (launchDate) => {
  if (!launchDate) return null;
  const target = new Date(`${launchDate}T00:00:00`);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round((targetDay - startOfToday) / 86400000);
  if (diffDays > 0) return { started: false, days: diffDays };
  return { started: true, dayNumber: 1 - diffDays };
};
