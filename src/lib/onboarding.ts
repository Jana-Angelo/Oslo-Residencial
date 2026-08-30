const STORAGE_KEY = 'oslo_onboarding_tooltips';
const DONE_KEY = 'oslo_onboarding_done';

type UserSeen = Record<string, string[]>;
type AllState = Record<string, UserSeen>;

function loadAll(): AllState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AllState) : {};
  } catch {
    return {};
  }
}

function saveAll(state: AllState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota / private mode — ignore
  }
}

export function isOnboardingDone(userKey: string): boolean {
  if (!userKey) return false;
  try {
    const raw = localStorage.getItem(DONE_KEY);
    if (!raw) return false;
    const done = JSON.parse(raw) as Record<string, boolean>;
    return !!done[userKey];
  } catch {
    return false;
  }
}

export function isTooltipSeen(userKey: string, moduleId: string, featureId: string): boolean {
  if (!userKey) return false;
  const user = loadAll()[userKey];
  const seen = user?.[moduleId];
  return !!seen?.includes(featureId);
}

export function markTooltipSeen(userKey: string, moduleId: string, featureIds: string[]) {
  if (!userKey || featureIds.length === 0) return;
  const all = loadAll();
  const user = all[userKey] || {};
  const seen = new Set(user[moduleId] || []);
  featureIds.forEach(id => seen.add(id));
  user[moduleId] = [...seen];
  all[userKey] = user;
  saveAll(all);
}

export function unseenTooltipCount(userKey: string, moduleId: string, featureIds: string[]): number {
  if (!userKey) return 0;
  const user = loadAll()[userKey];
  const seen = new Set(user?.[moduleId] || []);
  return featureIds.filter(id => !seen.has(id)).length;
}

export function completeOnboarding(userKey: string) {
  if (!userKey) return;
  try {
    const raw = localStorage.getItem(DONE_KEY);
    const done = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    done[userKey] = true;
    localStorage.setItem(DONE_KEY, JSON.stringify(done));
  } catch {
    // quota / private mode — ignore
  }
}

export function resetOnboarding(userKey?: string) {
  const all = loadAll();
  if (userKey) {
    delete all[userKey];
    try {
      const raw = localStorage.getItem(DONE_KEY);
      const done = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
      delete done[userKey];
      localStorage.setItem(DONE_KEY, JSON.stringify(done));
    } catch {
      // ignore
    }
  } else {
    Object.keys(all).forEach(k => delete all[k]);
    try {
      localStorage.removeItem(DONE_KEY);
    } catch {
      // ignore
    }
  }
  saveAll(all);
}