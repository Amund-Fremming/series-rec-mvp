import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'series_rec_user_id';

// Module-level store so every component that calls useUserId() shares the same
// value and re-renders the moment it changes — e.g. when the auth modal logs in,
// the series detail screen flips from "log in to rate" to "rate this series"
// without any reload.
let currentUserId = sessionStorage.getItem(STORAGE_KEY) ?? null;
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentUserId;
}

export function setUserId(id) {
  if (id) {
    sessionStorage.setItem(STORAGE_KEY, id);
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
  currentUserId = id ?? null;
  listeners.forEach((listener) => listener());
}

export function useUserId() {
  const userId = useSyncExternalStore(subscribe, getSnapshot);
  return { userId, isLoggedIn: userId !== null, setUserId };
}
