import { Group, Title, type TitleOrder } from '@mantine/core';
import { createContext, useContext, type ReactNode } from 'react';
import type { DataSource } from '../../types';
import { SourceBadge } from './SourceBadge';

export type FieldKind = 'pulled' | 'input' | 'computed';

export function sourcesEqual(a?: DataSource, b?: DataSource): boolean {
  return Boolean(a && b && a.name === b.name && a.date === b.date);
}

interface SectionBadgeConfig {
  kind?: FieldKind | FieldKind[];
  source?: DataSource;
}

const SectionBadgeContext = createContext<SectionBadgeConfig | null>(null);

function normalizeKinds(kind?: FieldKind | FieldKind[]): FieldKind[] {
  if (!kind) return [];
  return Array.isArray(kind) ? kind : [kind];
}

export function SectionBadgeProvider({
  kind,
  source,
  children,
}: SectionBadgeConfig & { children: ReactNode }) {
  const value = kind ? { kind, source } : null;
  return (
    <SectionBadgeContext.Provider value={value}>{children}</SectionBadgeContext.Provider>
  );
}

export function useHideFieldSourceBadge(
  kind: FieldKind,
  source: DataSource | undefined,
  overridden: boolean | undefined,
): boolean {
  const sectionBadge = useContext(SectionBadgeContext);
  if (!sectionBadge || overridden) return false;
  const sectionKinds = normalizeKinds(sectionBadge.kind);
  if (!sectionKinds.includes(kind)) return false;
  if (kind === 'pulled') {
    return sourcesEqual(source, sectionBadge.source);
  }
  return true;
}

interface SectionHeadingProps {
  title: string;
  order?: TitleOrder;
  mb?: string | number;
  kind?: FieldKind | FieldKind[];
  source?: DataSource;
}

export function SectionHeading({
  title,
  order = 4,
  mb = 'md',
  kind,
  source,
}: SectionHeadingProps) {
  const kinds = normalizeKinds(kind);
  return (
    <Group gap="xs" mb={mb} wrap="nowrap" align="center">
      <Title order={order}>{title}</Title>
      {kinds.map((k) => (
        <SourceBadge key={k} kind={k} source={k === 'pulled' ? source : undefined} />
      ))}
    </Group>
  );
}
