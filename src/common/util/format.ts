export function zeroPad(n: number, width: number = 2): string {
  return (new Array(width).fill('0').join('') + n).slice(-width);
}

export function dateString(d: Date, sep: string = '-'): string {
  return [
    d.getFullYear(),
    zeroPad(d.getMonth() + 1),
    zeroPad(d.getDate()),
  ].join(sep);
}

export function timeString(d: Date, sep: string = ':'): string {
  return [d.getHours(), d.getMinutes()].map(n => zeroPad(n, 2)).join(sep);
}

export function timeZoneOffsetString(d: Date, sep: string = ':'): string {
  const offset = -d.getTimezoneOffset();
  const sign = offset < 0 ? '-' : '+';
  const abs = Math.abs(offset);
  return [sign + zeroPad(Math.floor(abs / 60)), zeroPad(abs % 60)].join(sep);
}
