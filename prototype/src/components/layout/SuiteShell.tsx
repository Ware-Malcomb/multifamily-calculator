import {
  ActionIcon,
  AppShell,
  Badge,
  Box,
  Burger,
  Group,
  NavLink,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import { SUITE_NAME, SUITE_TOOLS, getToolById, type ToolId } from '../../data/tools';
import { semanticColors } from '../../theme/palette';
import { AppLayout } from './AppLayout';
import { ToolPageHeader } from './ToolPageHeader';
import { ComingSoonTool } from '../tools/ComingSoonTool';
import { MultifamilyAssumptionsTool } from '../tools/MultifamilyAssumptionsTool';

const TOOLS_PANEL_EXPANDED = 260;
const TOOLS_PANEL_COLLAPSED = 80;
const SUITE_HEADER_HEIGHT = 96;

export function SuiteShell() {
  const isDesktop = useMediaQuery('(min-width: 48em)');
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [toolsCollapsed, setToolsCollapsed] = useState(false);
  const [activeToolId, setActiveToolId] = useState<ToolId>('multifamily-assumptions');
  const [homeKey, setHomeKey] = useState(0);
  const activeTool = getToolById(activeToolId)!;

  const showExpandedTools = !isDesktop || !toolsCollapsed;
  const showCollapsedTools = isDesktop && toolsCollapsed;
  const navbarWidth = isDesktop && toolsCollapsed ? TOOLS_PANEL_COLLAPSED : TOOLS_PANEL_EXPANDED;

  const goHome = () => {
    setActiveToolId('multifamily-assumptions');
    setHomeKey((k) => k + 1);
    if (mobileOpened) toggleMobile();
  };

  return (
    <AppShell
      header={{ height: SUITE_HEADER_HEIGHT }}
      navbar={{
        width: navbarWidth,
        breakpoint: 'md',
        collapsed: { mobile: !mobileOpened },
      }}
      padding={0}
      bg="#ffffff"
    >
      <AppShell.Header bg="#ffffff" className="no-print">
        <Group h="100%" px="lg" pt="lg" pb="md" justify="space-between" align="flex-start">
          <Group align="flex-start">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="md" size="sm" mt={4} />
            <ToolPageHeader
              title={SUITE_NAME}
              withBottomPadding={false}
              onHomeClick={goHome}
            />
          </Group>
          <Badge variant="light" color={semanticColors.computed}>
            Prototype
          </Badge>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="sm"
        bg="#ffffff"
        className="tools-panel no-print"
        data-collapsed={showCollapsedTools || undefined}
      >
        <UnstyledButton
          className="tools-panel-toggle"
          onClick={() => setToolsCollapsed((c) => !c)}
          aria-label={showCollapsedTools ? 'Expand tools panel' : 'Collapse tools panel'}
          visibleFrom="md"
        >
          {showCollapsedTools ? (
            <Stack gap={4} align="center" w="100%" className="tools-panel-toggle-inner">
              <ActionIcon variant="subtle" color="gray" size="sm" component="div">
                <IconChevronRight size={16} />
              </ActionIcon>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} className="tools-panel-label">
                Tools
              </Text>
            </Stack>
          ) : (
            <Group
              justify="space-between"
              wrap="nowrap"
              gap="xs"
              w="100%"
              className="tools-panel-toggle-inner"
            >
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} className="tools-panel-label">
                Tools
              </Text>
              <ActionIcon variant="subtle" color="gray" size="sm" component="div">
                <IconChevronLeft size={16} />
              </ActionIcon>
            </Group>
          )}
        </UnstyledButton>

        {showExpandedTools ? (
          <>
            <Stack gap={4} mt="xs">
              {SUITE_TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <NavLink
                    key={tool.id}
                    label={tool.name}
                    description={tool.practiceArea}
                    leftSection={<Icon size={18} stroke={1.5} />}
                    active={activeToolId === tool.id}
                    color={semanticColors.pulled}
                    onClick={() => setActiveToolId(tool.id)}
                  />
                );
              })}
            </Stack>
          </>
        ) : (
          <Stack gap="xs" mt="md" align="center" visibleFrom="md">
            {SUITE_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Tooltip key={tool.id} label={tool.name} position="right" withArrow>
                  <ActionIcon
                    variant={activeToolId === tool.id ? 'light' : 'subtle'}
                    color={activeToolId === tool.id ? semanticColors.pulled : 'gray'}
                    size="lg"
                    onClick={() => setActiveToolId(tool.id)}
                    aria-label={tool.name}
                  >
                    <Icon size={18} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Stack>
        )}
      </AppShell.Navbar>

      <AppShell.Main bg="#ffffff" className="suite-main">
        <Box className="suite-main-inner">
          {activeToolId === 'multifamily-assumptions' ? (
            <MultifamilyAssumptionsTool key={homeKey} />
          ) : (
            <AppLayout showWorkflow={false} showFeasibility={false} className="no-print">
              <ComingSoonTool tool={activeTool} />
            </AppLayout>
          )}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
