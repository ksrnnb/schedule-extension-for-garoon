import { ErrorResponse } from '../api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFetchError(err: any): err is Error {
  return (
    err instanceof Error &&
    err.name === 'TypeError' &&
    err.message === 'Failed to fetch'
  );
}
import * as store from '../store';
import { updateBadge } from './badge';
import { t } from './message';
import { notify } from './notification';

export async function requireAuth(inAction?: boolean) {
  const { notifiesRequireAuth, error, baseURL } = await store.load();
  const msg = t('err_unauthenticated');

  await setError(msg);

  if (!inAction && notifiesRequireAuth && error !== msg) {
    notify(
      {
        title: msg,
      },
      {
        onClicked: () =>
          chrome.tabs.create({
            url: baseURL,
          }),
      },
    );
  }
}

export async function setError(error?: string) {
  await store.save({ error, lastUpdate: Date.now() });

  updateBadge();
}

export async function clearError() {
  await setError(undefined);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleError(err: any, inAction?: boolean) {
  if (isFetchError(err)) {
    await setError(t('failed_to_fetch'));
    return;
  }

  if (err instanceof ErrorResponse) {
    if (err.status() === 401) {
      await requireAuth(inAction);
      return;
    }

    console.warn(`API Error status ${err.status()}`);
    return;
  }
  Promise.reject(err);
}
