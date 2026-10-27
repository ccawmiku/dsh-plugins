export function durationSeconds(value) {
  if (typeof value === 'number' || (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value))) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number / 1000 : 0;
  }
  if (typeof value !== 'string' || !/^\d+:\d{2}:\d{2}(\.\d+)?$/.test(value)) return 0;
  const seconds = value.split(':').reduce((total, part) => total * 60 + Number(part), 0);
  return Number.isFinite(seconds) ? seconds : 0;
}

export function formatDuration(value) {
  if (value === null || value === undefined || value === '') return '';
  const total = Math.round(durationSeconds(value));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const short = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return hours ? `${hours}:${short}` : short;
}
