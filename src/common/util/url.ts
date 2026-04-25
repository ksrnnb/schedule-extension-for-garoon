export function scheduleURL(baseURL: string, id: string) {
  return `${baseURL.replace(/\/+$/, '')}/schedule/view?event=${encodeURIComponent(id)}`;
}
