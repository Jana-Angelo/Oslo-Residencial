import {useCallback, useEffect, useState} from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
}

async function doPrompt(ev: BeforeInstallPromptEvent): Promise<boolean> {
  await ev.prompt();
  const choice = await ev.userChoice;
  return choice.outcome === 'accepted';
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [isIOS] = useState(() => /iphone|ipad|ipod/i.test(navigator.userAgent));

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setStandalone(true);
      setDeferredPrompt(null);
    };
    const checkDisplay = () => {
      const standaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as unknown as {standalone?: boolean}).standalone === true;
      setStandalone(standaloneMode);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('resize', checkDisplay);
    checkDisplay();
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('resize', checkDisplay);
    };
  }, []);

  // Direct install: uses the stored prompt, or waits briefly for the browser
  // to dispatch one, then triggers the native install dialog automatically.
  const installNow = useCallback(async (): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      if (deferredPrompt) {
        doPrompt(deferredPrompt)
          .then(accepted => {
            setDeferredPrompt(null);
            resolve(accepted);
          });
        return;
      }

      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        window.removeEventListener('beforeinstallprompt', onEvent);
        window.clearTimeout(timer);
        resolve(ok);
      };
      const onEvent = (e: Event) => {
        e.preventDefault();
        const ev = e as BeforeInstallPromptEvent;
        doPrompt(ev).then(ok => finish(ok));
      };
      const timer = window.setTimeout(() => finish(false), 4000);
      window.addEventListener('beforeinstallprompt', onEvent);
    });
  }, [deferredPrompt]);

  return {standalone, isIOS, installNow};
}