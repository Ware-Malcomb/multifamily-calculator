import { ActionIcon, Group, Paper, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useCalculator } from '../../hooks/useCalculatorContext';
import { semanticColors } from '../../theme/palette';
import { exportFeasibilityReport } from '../../utils/exportFeasibilityReport';
import { FeasibilitySummaryContent } from './FeasibilitySummaryContent';

export function FeasibilitySummary() {
  const { state, feasibility } = useCalculator();
  const { site } = state;

  const handleExport = () => {
    exportFeasibilityReport();
  };

  if (!site) {
    return (
      <Paper withBorder p="md" radius="md" h="100%" bg="#ffffff">
        <Text size="sm" c="dimmed">
          Select a site to begin. The feasibility summary updates live as you work through each
          step.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md" radius="md" className="feasibility-summary" bg="#ffffff">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title order={5}>Feasibility summary</Title>
            <Text size="xs" c="dimmed" mt={2} lineClamp={2}>
              {site.address}
            </Text>
          </div>
          <Tooltip label="Export feasibility report" withArrow>
            <ActionIcon
              variant="light"
              color={semanticColors.pulled}
              onClick={handleExport}
              disabled={!feasibility}
              aria-label="Export feasibility report"
            >
              <IconDownload size={18} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <FeasibilitySummaryContent />
      </Stack>
    </Paper>
  );
}
