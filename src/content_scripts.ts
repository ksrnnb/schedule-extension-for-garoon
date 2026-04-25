import { startTimeIndicator } from './content/timeIndicator';

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      startTimeIndicator();
    },
    { once: true },
  );
} else {
  startTimeIndicator();
}
