import * as message from '../background';

const OFFSCREEN_PATH = 'offscreen.html';

async function ensureOffscreenDocument(): Promise<void> {
  const url = chrome.runtime.getURL(OFFSCREEN_PATH);
  const contexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [url],
  });
  if (contexts.length > 0) {
    return;
  }
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_PATH,
    reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
    justification: 'Play a chime when an upcoming event is approaching.',
  });
}

export async function playChime(volume?: number): Promise<void> {
  await ensureOffscreenDocument();
  await message.sendMessage<void>(message.Type.PlaySound, volume);
}
