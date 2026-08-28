import {
  ActionIcon,
  Box,
  Group,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconChartBar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import { semanticColors } from '../../theme/palette';
import { FeasibilitySummary } from '../summary/FeasibilitySummary';
import { SaveToMyProjects } from './SaveToMyProjects';

export function FeasibilityAside() {
  const isDesktop = useMediaQuery('(min-width: 75em)');
  const [collapsed, setCollapsed] = useState(false);

  const showExpanded = !isDesktop || !collapsed;
  const showCollapsed = isDesktop && collapsed;

  return (
    <Box
      className="tool-aside feasibility-panel"
      data-collapsed={showCollapsed || undefined}
      visibleFrom="lg"
    >
      {showCollapsed ? (
          <UnstyledButton
            className="feasibility-panel-toggle"
            onClick={() => setCollapsed(false)}
            aria-label="Expand feasibility summary"
          >
            <Stack gap={4} align="center" w="100%" className="feasibility-panel-toggle-inner">
              <ActionIcon variant="subtle" color="gray" size="sm" component="div">
                <IconChevronLeft size={16} />
              </ActionIcon>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} className="feasibility-panel-label">
                Summary
              </Text>
            </Stack>
          </UnstyledButton>
        ) : (
          <Group
            className="feasibility-panel-header"
            justify="space-between"
            align="center"
            wrap="nowrap"
            gap="md"
          >
            <UnstyledButton
              className="feasibility-panel-toggle"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse feasibility summary"
              style={{ flex: '0 1 auto' }}
            >
              <Group gap="xs" wrap="nowrap" className="feasibility-panel-toggle-inner">
                <ActionIcon variant="subtle" color="gray" size="sm" component="div">
                  <IconChevronRight size={16} />
                </ActionIcon>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} className="feasibility-panel-label">
                  Summary
                </Text>
              </Group>
            </UnstyledButton>
            <SaveToMyProjects />
          </Group>
        )}

      {showExpanded ? (
        <Box mt="xs">
          <FeasibilitySummary />
        </Box>
      ) : (
        <Stack gap="xs" mt="md" align="center">
          <Tooltip label="Feasibility summary" position="left" withArrow>
            <ActionIcon
              variant="light"
              color={semanticColors.computed}
              size="lg"
              onClick={() => setCollapsed(false)}
              aria-label="Expand feasibility summary"
            >
              <IconChartBar size={18} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
          <SaveToMyProjects orientation="vertical" />
        </Stack>
      )}
    </Box>
  );
}
