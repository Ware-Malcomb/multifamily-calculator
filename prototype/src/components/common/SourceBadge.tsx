import { Badge, Tooltip } from '@mantine/core';
import { IconAlertTriangle, IconCalculator, IconDatabase, IconPencil } from '@tabler/icons-react';
import { semanticColors } from '../../theme/palette';
import type { DataSource } from '../../types';

type FieldKind = 'pulled' | 'input' | 'computed';

const kindConfig: Record<
  FieldKind,
  { color: string; label: string; icon: typeof IconDatabase }
> = {
  pulled: { color: semanticColors.pulled, label: 'Pulled', icon: IconDatabase },
  input: { color: semanticColors.input, label: 'Input', icon: IconPencil },
  computed: { color: semanticColors.computed, label: 'Computed', icon: IconCalculator },
};

interface SourceBadgeProps {
  kind: FieldKind;
  source?: DataSource;
  overridden?: boolean;
  missing?: boolean;
}

export function SourceBadge({ kind, source, overridden, missing }: SourceBadgeProps) {
  if (missing) {
    return (
      <Tooltip label="Not provided by Regrid — enter a value" withArrow>
        <Badge
          size="xs"
          variant="light"
          color={semanticColors.warning}
          leftSection={<IconAlertTriangle size={10} />}
          style={{ cursor: 'default' }}
        >
          Missing
        </Badge>
      </Tooltip>
    );
  }

  const config = kindConfig[kind];
  const Icon = config.icon;

  const label =
    kind === 'pulled' && source
      ? overridden
        ? `${source.name} · ${source.date} (overridden)`
        : `${source.name} · ${source.date}`
      : config.label;

  return (
    <Tooltip label={label} withArrow>
      <Badge
        size="xs"
        variant="light"
        color={overridden ? semanticColors.overridden : config.color}
        leftSection={<Icon size={10} />}
        style={{ cursor: 'default' }}
      >
        {kind === 'pulled' && source ? source.name : config.label}
      </Badge>
    </Tooltip>
  );
}
