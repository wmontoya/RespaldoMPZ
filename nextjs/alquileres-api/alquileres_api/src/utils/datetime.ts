const COSTA_RICA_OFFSET = -6;

export function toOdooUTC(localDatetime: string): string {
  const [datePart, timePart] = localDatetime.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);

  const localDate = new Date(year, month - 1, day, hours, minutes, seconds);
  const utcDate = new Date(localDate.getTime() - COSTA_RICA_OFFSET * 60 * 60 * 1000);

  return [
    utcDate.getFullYear(),
    String(utcDate.getMonth() + 1).padStart(2, '0'),
    String(utcDate.getDate()).padStart(2, '0'),
  ].join('-') + ' ' + [
    String(utcDate.getHours()).padStart(2, '0'),
    String(utcDate.getMinutes()).padStart(2, '0'),
    String(utcDate.getSeconds()).padStart(2, '0'),
  ].join(':');
}
