export function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function getElectionStatus(schedule) {
  if (!schedule) return null;
  const now = new Date();
  const opening = new Date(`${schedule.date}T${schedule.start}`);
  const closing = new Date(`${schedule.date}T${schedule.end}`);
  if (now < opening) return 'upcoming';
  return now < closing ? 'open' : 'closed';
}
