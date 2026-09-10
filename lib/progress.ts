"use client";

import { useSyncExternalStore } from "react";

export type ProgressSection = "terms" | "sentences" | "grammar";

const STORAGE_PREFIX = "progress-v1:";
const listeners = new Set<() => void>();

/** In-memory mirror: section -> set of completed ids. */
let cache: Record<ProgressSection, Set<string>> | null = null;

function readSection(section: ProgressSection): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + section);
    if (!raw) return new Set();
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function ensureCache(): Record<ProgressSection, Set<string>> {
  if (cache) return cache;
  if (typeof window === "undefined") {
    return { terms: new Set(), sentences: new Set(), grammar: new Set() };
  }
  cache = {
    terms: readSection("terms"),
    sentences: readSection("sentences"),
    grammar: readSection("grammar"),
  };
  return cache;
}

function persist(section: ProgressSection): void {
  try {
    window.localStorage.setItem(
      STORAGE_PREFIX + section,
      JSON.stringify([...ensureCache()[section]]),
    );
  } catch {
    // Storage unavailable — progress still applies for this session.
  }
}

/** Cached snapshots: getSnapshot must return a referentially stable value. */
let snapshots: Record<ProgressSection, string[] | null> = {
  terms: null,
  sentences: null,
  grammar: null,
};

function notify(): void {
  snapshots = { terms: null, sentences: null, grammar: null };
  listeners.forEach((l) => l());
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/** Sorted ids snapshot — cached so the reference is stable between changes. */
function snapshotOf(section: ProgressSection): string[] {
  let snap = snapshots[section];
  if (!snap) {
    snap = [...ensureCache()[section]].sort();
    snapshots[section] = snap;
  }
  return snap;
}

function serverSnapshot(): string[] {
  return [];
}

export function isComplete(section: ProgressSection, id: string): boolean {
  return ensureCache()[section].has(id);
}

export function toggleComplete(section: ProgressSection, id: string): void {
  const set = ensureCache()[section];
  if (set.has(id)) set.delete(id);
  else set.add(id);
  persist(section);
  notify();
}

/** Reactive completed-ids list for a section (empty on server). */
export function useCompletedIds(section: ProgressSection): string[] {
  return useSyncExternalStore(
    subscribe,
    () => snapshotOf(section),
    serverSnapshot,
  );
}
