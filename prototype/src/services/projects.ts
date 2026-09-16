import type { CalculatorState } from '../types';

const STORAGE_KEY = 'wm-development-tools.my-projects';

export interface SavedProject {
  id: string;
  name: string;
  clientName: string;
  siteKey?: string;
  toolId: 'multifamily-assumptions';
  savedAt: string;
  state: CalculatorState;
}

function cloneState(state: CalculatorState): CalculatorState {
  return JSON.parse(JSON.stringify(state)) as CalculatorState;
}

export function projectNameFromState(state: CalculatorState): string {
  const address = state.site?.address?.trim();
  return address || 'Untitled multifamily project';
}

function siteKeyFromState(state: CalculatorState): string | undefined {
  return state.site?.regridId || state.site?.address?.trim() || undefined;
}

function readProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? (parsed as SavedProject[]).map((project) => ({
          ...project,
          clientName: project.clientName ?? '',
        }))
      : [];
  } catch {
    return [];
  }
}

function writeProjects(projects: SavedProject[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function clientNameFromProject(project: Pick<SavedProject, 'clientName'>): string {
  return project.clientName?.trim() || 'No client';
}

export function listClientNames(): string[] {
  const names = new Set<string>();
  for (const project of readProjects()) {
    const name = project.clientName?.trim();
    if (name) names.add(name);
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function groupProjectsByClient(projects: SavedProject[]): { client: string; projects: SavedProject[] }[] {
  const groups = new Map<string, SavedProject[]>();
  for (const project of projects) {
    const client = clientNameFromProject(project);
    const list = groups.get(client) ?? [];
    list.push(project);
    groups.set(client, list);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => {
      if (a === 'No client') return 1;
      if (b === 'No client') return -1;
      return a.localeCompare(b);
    })
    .map(([client, grouped]) => ({
      client,
      projects: grouped.sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
    }));
}

export function listMyProjects(): SavedProject[] {
  return readProjects().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function getMyProject(id: string): SavedProject | undefined {
  return readProjects().find((project) => project.id === id);
}

export function saveToMyProjects(
  state: CalculatorState,
  existingId?: string | null,
  name?: string | null,
  clientName?: string | null,
): SavedProject {
  const projects = readProjects();
  const snapshot = cloneState(state);
  const resolvedName = name?.trim() || projectNameFromState(state);
  const resolvedClient = clientName?.trim() ?? '';
  const siteKey = siteKeyFromState(state);
  const now = new Date().toISOString();

  // Only replace when the caller explicitly updates a known project id.
  // Same site / address must be allowed as separate saved runs.
  if (existingId) {
    const index = projects.findIndex((project) => project.id === existingId);
    if (index >= 0) {
      const updated: SavedProject = {
        ...projects[index],
        name: resolvedName,
        clientName: resolvedClient,
        siteKey,
        savedAt: now,
        state: snapshot,
      };
      projects[index] = updated;
      writeProjects(projects);
      return updated;
    }
  }

  const created: SavedProject = {
    id: crypto.randomUUID(),
    name: resolvedName,
    clientName: resolvedClient,
    siteKey,
    toolId: 'multifamily-assumptions',
    savedAt: now,
    state: snapshot,
  };
  writeProjects([created, ...projects]);
  return created;
}

export function deleteMyProject(id: string): void {
  writeProjects(readProjects().filter((project) => project.id !== id));
}
