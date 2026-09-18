import { Box, Group, Text, UnstyledButton } from '@mantine/core';
import {
  IconBuilding,
  IconCalculator,
  IconChartBar,
  IconCheck,
  IconMapPin,
} from '@tabler/icons-react';
import { useCalculator } from '../../hooks/useCalculatorContext';
import { palette, paletteShades } from '../../theme/palette';
import type { StepId } from '../../types';

const STEPS: { id: StepId; label: string; shortLabel: string; icon: typeof IconMapPin }[] = [
  { id: 'site', label: 'Site', shortLabel: 'Site', icon: IconMapPin },
  { id: 'comps', label: 'Comps', shortLabel: 'Comps', icon: IconChartBar },
  { id: 'program', label: 'Program', shortLabel: 'Program', icon: IconBuilding },
  { id: 'costs', label: 'Costs & feasibility', shortLabel: 'Costs', icon: IconCalculator },
];

export function WorkflowTimeline() {
  const { state, setActiveStep } = useCalculator();
  const { activeStep, completedSteps } = state;

  return (
    <Box w="100%">
      <Group gap={0} wrap="nowrap" justify="space-between" align="flex-start">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          const isComplete = completedSteps.includes(step.id);
          const isLast = index === STEPS.length - 1;

          const circleColor = isActive
            ? palette.digitalBlue
            : isComplete
              ? palette.lemonLimeContrast
              : paletteShades.softPeriwinkle[2];

          const circleBg = isActive
            ? paletteShades.digitalBlue[0]
            : isComplete
              ? paletteShades.lemonLime[2]
              : '#ffffff';

          return (
            <Group
              key={step.id}
              gap={0}
              wrap="nowrap"
              style={{ flex: isLast ? '0 0 auto' : 1, minWidth: 0 }}
              align="flex-start"
            >
              <UnstyledButton
                onClick={() => setActiveStep(step.id)}
                style={{ flex: '0 0 auto', textAlign: 'center' }}
              >
                <Group gap="xs" wrap="nowrap" justify="center">
                  <Box
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      border: `2px solid ${circleColor}`,
                      backgroundColor: circleBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 150ms ease',
                      boxShadow: isActive ? `0 0 0 3px ${paletteShades.digitalBlue[1]}` : undefined,
                    }}
                  >
                    {isComplete && !isActive ? (
                      <IconCheck size={18} color={palette.lemonLimeContrast} stroke={2.5} />
                    ) : (
                      <Icon size={18} color={isActive ? palette.digitalBlue : paletteShades.softPeriwinkle[5]} stroke={1.5} />
                    )}
                  </Box>
                  <Box visibleFrom="sm">
                    <Text
                      size="sm"
                      fw={isActive ? 700 : 500}
                      c={isActive ? 'dark' : 'dimmed'}
                      lh={1.2}
                    >
                      {step.label}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Step {index + 1}
                    </Text>
                  </Box>
                  <Box hiddenFrom="sm">
                    <Text size="xs" fw={isActive ? 700 : 500} c={isActive ? 'dark' : 'dimmed'}>
                      {step.shortLabel}
                    </Text>
                  </Box>
                </Group>
              </UnstyledButton>

              {!isLast && (
                <Box
                  style={{
                    flex: 1,
                    height: 2,
                    marginTop: 18,
                    marginInline: 8,
                    borderRadius: 1,
                    backgroundColor: isComplete
                      ? palette.lemonLimeContrast
                      : paletteShades.softPeriwinkle[1],
                    transition: 'background-color 150ms ease',
                  }}
                />
              )}
            </Group>
          );
        })}
      </Group>
    </Box>
  );
}
