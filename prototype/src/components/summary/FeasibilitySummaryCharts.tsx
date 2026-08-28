import { Box, Group, Stack, Text } from '@mantine/core';
import type { CostBreakdownSegment } from '../../utils/calculations';
import { formatCurrency, formatNumber } from '../../utils/calculations';
import { palette } from '../../theme/palette';

interface CostBreakdownChartProps {
  segments: CostBreakdownSegment[];
  total: number;
}

export function CostBreakdownChart({ segments, total }: CostBreakdownChartProps) {
  if (total <= 0 || segments.length === 0) return null;

  return (
    <Stack gap="xs">
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        Project cost mix
      </Text>
      <Box
        className="feasibility-chart-bar"
        style={{
          display: 'flex',
          height: 10,
          borderRadius: 999,
          overflow: 'hidden',
          backgroundColor: 'var(--mantine-color-gray-2)',
        }}
        aria-hidden
      >
        {segments.map((segment) => (
          <Box
            key={segment.label}
            style={{
              width: `${(segment.value / total) * 100}%`,
              backgroundColor: segment.color,
              minWidth: segment.value > 0 ? 2 : 0,
            }}
          />
        ))}
      </Box>
      <Stack gap={6}>
        {segments.map((segment) => {
          const pct = Math.round((segment.value / total) * 100);
          return (
            <Group key={segment.label} justify="space-between" wrap="nowrap" gap="xs">
              <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                <Box
                  w={8}
                  h={8}
                  style={{ borderRadius: 2, backgroundColor: segment.color, flexShrink: 0 }}
                />
                <Text size="xs" truncate>
                  {segment.label}
                </Text>
              </Group>
              <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                {pct}% · {formatCurrency(segment.value)}
              </Text>
            </Group>
          );
        })}
      </Stack>
    </Stack>
  );
}

interface RentComparisonChartProps {
  stabilizedRentPerSf: number;
  programRentPerSf: number;
  rentHurdlePerSf?: number | null;
}

function RentBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const widthPct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <Stack gap={4}>
      <Group justify="space-between" gap="xs">
        <Text size="xs" c="dimmed">
          {label}
        </Text>
        <Text size="xs" fw={600}>
          ${formatNumber(value, 2)}/SF
        </Text>
      </Group>
      <Box
        className="feasibility-chart-bar"
        style={{
          height: 8,
          borderRadius: 999,
          backgroundColor: 'var(--mantine-color-gray-2)',
          overflow: 'hidden',
        }}
      >
        <Box
          style={{
            width: `${widthPct}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 999,
            transition: 'width 200ms ease',
          }}
        />
      </Box>
    </Stack>
  );
}

export function RentComparisonChart({
  stabilizedRentPerSf,
  programRentPerSf,
  rentHurdlePerSf,
}: RentComparisonChartProps) {
  const hurdleSet = rentHurdlePerSf !== null && rentHurdlePerSf !== undefined && rentHurdlePerSf > 0;
  const max = Math.max(stabilizedRentPerSf, programRentPerSf, hurdleSet ? rentHurdlePerSf! : 0) * 1.15;
  const clearsHurdle = hurdleSet && stabilizedRentPerSf >= rentHurdlePerSf!;

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
          Rent ($/SF)
        </Text>
        {hurdleSet && (
          <Text
            size="xs"
            fw={700}
            style={{ color: clearsHurdle ? palette.lemonLimeContrast : palette.lobsterPink }}
          >
            {clearsHurdle ? 'Above hurdle' : 'Below hurdle'}
          </Text>
        )}
      </Group>
      <RentBar
        label="Comp blend"
        value={stabilizedRentPerSf}
        max={max}
        color={palette.digitalBlue}
      />
      <RentBar
        label="Program"
        value={programRentPerSf}
        max={max}
        color={palette.softPeriwinkle}
      />
      {hurdleSet && (
        <RentBar
          label="Client hurdle"
          value={rentHurdlePerSf!}
          max={max}
          color={palette.pumpkinSpice}
        />
      )}
    </Stack>
  );
}
