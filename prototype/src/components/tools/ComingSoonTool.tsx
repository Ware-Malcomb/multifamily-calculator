import { Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconClockHour4 } from '@tabler/icons-react';
import type { SuiteTool } from '../../data/tools';
import { semanticColors } from '../../theme/palette';

interface ComingSoonToolProps {
  tool: SuiteTool;
}

export function ComingSoonTool({ tool }: ComingSoonToolProps) {
  const Icon = tool.icon;

  return (
    <Paper withBorder p="xl" radius="md" bg="#ffffff" maw={560} mx="auto">
      <Stack gap="md">
        <ThemeIcon size={48} radius="md" variant="light" color={semanticColors.computed}>
          <Icon size={26} stroke={1.5} />
        </ThemeIcon>
        <div>
          <Text c="dimmed">
            {tool.description}
          </Text>
        </div>
        <Text size="sm" c="dimmed">
          <IconClockHour4 size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Additional practice-area calculators will be added to the suite over time, following
          the multifamily tool.
        </Text>
      </Stack>
    </Paper>
  );
}
