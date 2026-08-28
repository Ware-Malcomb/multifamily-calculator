import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Checkbox,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Slider,
  Stack,
  Table,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState, Fragment } from 'react';
import { useCalculator } from '../../hooks/useCalculatorContext';
import { paletteShades, semanticColors } from '../../theme/palette';
import { formatCurrency, formatNumber } from '../../utils/calculations';
import { SectionHeading } from '../common/SectionBadge';
import { StepNextButton } from '../workflow/StepNextButton';
import { CompsMapPreview } from './CompsMapPreview';

const DEFAULT_RADIUS_MI = 5;
const MAX_RADIUS_MI = 10;
const MIN_RADIUS_MI = 0.5;
/** Comps built in this year or later count as "Recent" */
const RECENT_YEAR_BUILT_MIN = 2020;

export function CompsStep() {
  const { state, blended, toggleComp, retainSelectedComps, setRentHurdle, setActiveStep } =
    useCalculator();
  const { allComps, selectedCompIds, rentHurdlePerSf, site } = state;
  const [hurdleInput, setHurdleInput] = useState<string | number>(rentHurdlePerSf ?? '');
  const [radiusMi, setRadiusMi] = useState(DEFAULT_RADIUS_MI);
  const [recentOnly, setRecentOnly] = useState(false);
  const [expandedCompIds, setExpandedCompIds] = useState<string[]>([]);

  const visibleComps = useMemo(
    () =>
      allComps
        .filter((c) => c.distanceMi <= radiusMi)
        .filter((c) => !recentOnly || c.yearBuilt >= RECENT_YEAR_BUILT_MIN)
        .sort((a, b) => a.distanceMi - b.distanceMi),
    [allComps, radiusMi, recentOnly],
  );

  const visibleIds = useMemo(() => visibleComps.map((c) => c.id), [visibleComps]);

  useEffect(() => {
    retainSelectedComps(visibleIds);
  }, [visibleIds, retainSelectedComps]);

  useEffect(() => {
    setExpandedCompIds((ids) => ids.filter((id) => visibleIds.includes(id)));
  }, [visibleIds]);

  const toggleExpanded = (compId: string) => {
    setExpandedCompIds((ids) =>
      ids.includes(compId) ? ids.filter((id) => id !== compId) : [...ids, compId],
    );
  };

  const selectionValid = selectedCompIds.length >= 3;
  const hurdleSet = rentHurdlePerSf !== null && rentHurdlePerSf > 0;
  const clearsHurdle = hurdleSet && blended.avgRentPerSf >= rentHurdlePerSf!;
  const failsHurdle = hurdleSet && blended.avgRentPerSf < rentHurdlePerSf!;

  const compSource = allComps[0]?.source;

  const setRadius = (value: number) => {
    const clamped = Math.min(MAX_RADIUS_MI, Math.max(MIN_RADIUS_MI, value));
    setRadiusMi(Math.round(clamped * 10) / 10);
  };

  if (!site) {
    return (
      <Alert color={semanticColors.warning} title="Select a site first">
        Complete Step 1 to load comparable properties for this market.
      </Alert>
    );
  }

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Comps</Title>
        <Text c="dimmed" mt={4}>
          Select at least 3 relevant comps from CoStar to view a live blended market read.
        </Text>
      </div>

      <Stack gap="xs">
        <Paper withBorder px="md" py="sm" radius="md">
          <Group gap="md" align="center" wrap="nowrap">
            <Box style={{ flexShrink: 0 }}>
              <SectionHeading title="Search radius" kind="input" mb={0} />
            </Box>
            <Slider
              style={{ flex: 1, minWidth: 120 }}
              value={radiusMi}
              onChange={setRadius}
              min={MIN_RADIUS_MI}
              max={MAX_RADIUS_MI}
              step={0.5}
              label={(v) => `${v} mi`}
            />
            <NumberInput
              value={radiusMi}
              onChange={(v) => typeof v === 'number' && setRadius(v)}
              min={MIN_RADIUS_MI}
              max={MAX_RADIUS_MI}
              step={0.5}
              decimalScale={1}
              suffix=" mi"
              w={96}
              size="xs"
              hideControls
              aria-label="Search radius in miles"
            />
          </Group>
        </Paper>

        <Group gap="xs" justify="flex-end">
          <UnstyledButton
            className="comps-map-filter-tag"
            data-active={recentOnly || undefined}
            onClick={() => setRecentOnly((v) => !v)}
            aria-pressed={recentOnly}
          >
            Recent
          </UnstyledButton>
        </Group>

        <CompsMapPreview
          site={site}
          comps={visibleComps}
          selectedCompIds={selectedCompIds}
          radiusMi={radiusMi}
        />
      </Stack>

      {!selectionValid && (
        <Alert color={semanticColors.warning} variant="light">
          Select {3 - selectedCompIds.length} more comp
          {selectedCompIds.length === 2 ? '' : 's'} (minimum 3).
        </Alert>
      )}

      <Paper withBorder p="lg" radius="md" className="comps-table-wrap">
        <SectionHeading title="Comparable properties" kind="pulled" source={compSource} mb="sm" />
        {visibleComps.length === 0 ? (
          <Text size="sm" c="dimmed">
            No comps within {formatNumber(radiusMi, 1)} miles. Increase the search radius.
          </Text>
        ) : (
          <Table striped highlightOnHover className="comps-table">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={40} />
                <Table.Th>Property</Table.Th>
                <Table.Th>Distance</Table.Th>
                <Table.Th>Units</Table.Th>
                <Table.Th>Unit mix</Table.Th>
                <Table.Th>Avg SF</Table.Th>
                <Table.Th>Avg rent</Table.Th>
                <Table.Th>Lease-up</Table.Th>
                <Table.Th w={36} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {visibleComps.map((comp) => {
                const selected = selectedCompIds.includes(comp.id);
                const expanded = expandedCompIds.includes(comp.id);
                const rentPerSf = comp.avgRent / comp.avgSqFt;
                return (
                  <Fragment key={comp.id}>
                    <Table.Tr
                      bg={selected ? paletteShades.digitalBlue[0] : undefined}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleComp(comp.id)}
                    >
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selected} onChange={() => toggleComp(comp.id)} />
                      </Table.Td>
                      <Table.Td fw={selected ? 600 : 400} className="comps-table-property">
                        {comp.name}
                      </Table.Td>
                      <Table.Td className="comps-table-nowrap">
                        {formatNumber(comp.distanceMi, 1)} mi
                      </Table.Td>
                      <Table.Td className="comps-table-nowrap">{comp.unitCount}</Table.Td>
                      <Table.Td className="comps-table-nowrap">{comp.unitMix}</Table.Td>
                      <Table.Td className="comps-table-nowrap">{formatNumber(comp.avgSqFt)}</Table.Td>
                      <Table.Td className="comps-table-nowrap">
                        {formatCurrency(comp.avgRent)}{' '}
                        <Text span size="xs" c="dimmed">
                          (${formatNumber(rentPerSf, 2)}/SF)
                        </Text>
                      </Table.Td>
                      <Table.Td className="comps-table-nowrap">{comp.leaseUpPct}%</Table.Td>
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          aria-label={expanded ? 'Collapse unit mix' : 'Expand unit mix'}
                          aria-expanded={expanded}
                          onClick={() => toggleExpanded(comp.id)}
                        >
                          {expanded ? (
                            <IconChevronDown size={14} />
                          ) : (
                            <IconChevronRight size={14} />
                          )}
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                    {expanded && (
                      <Table.Tr bg="#f7f9fc">
                        <Table.Td colSpan={9} p={0}>
                          <Box className="comps-unit-mix-detail" px="md" py="sm" pl={48}>
                            <Table
                              className="comps-unit-mix-table"
                              withTableBorder
                              withColumnBorders
                              verticalSpacing={4}
                              horizontalSpacing="sm"
                            >
                              <Table.Thead>
                                <Table.Tr>
                                  <Table.Th>Unit type</Table.Th>
                                  <Table.Th ta="right">% of mix</Table.Th>
                                  <Table.Th ta="right">Sq ft</Table.Th>
                                </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody>
                                {comp.unitMixDetail.map((row) => (
                                  <Table.Tr key={row.unitType}>
                                    <Table.Td>
                                      <Text size="sm">{row.unitType}</Text>
                                    </Table.Td>
                                    <Table.Td ta="right">
                                      <Text size="sm">{formatNumber(row.pctOfMix, 0)}%</Text>
                                    </Table.Td>
                                    <Table.Td ta="right">
                                      <Text size="sm">{formatNumber(row.sqFt)}</Text>
                                    </Table.Td>
                                  </Table.Tr>
                                ))}
                              </Table.Tbody>
                            </Table>
                          </Box>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Fragment>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Paper withBorder p="lg" radius="md">
        <SectionHeading title="Blended market read" kind="computed" />
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <Stack gap={4} align="center" ta="center">
            <Text size="sm" c="dimmed">
              Avg rent ($/SF)
            </Text>
            <Text size="xl" fw={700}>
              ${formatNumber(blended.avgRentPerSf, 2)}
            </Text>
          </Stack>
          <Stack gap={4} align="center" ta="center">
            <Text size="sm" c="dimmed">
              Avg lease-up
            </Text>
            <Text size="xl" fw={700}>
              {formatNumber(blended.avgLeaseUpPct, 1)}%
            </Text>
          </Stack>
          <Stack gap={4} align="center" ta="center">
            <Text size="sm" c="dimmed">
              Comps selected
            </Text>
            <Text size="xl" fw={700}>
              {blended.selectedCount}
            </Text>
          </Stack>
          <Stack gap={4} align="center" ta="center">
            <Text size="sm" c="dimmed">
              AMI (region)
            </Text>
            <Text size="xl" fw={700}>
              {formatCurrency(site.areaMedianIncome ?? 119_300)}
            </Text>
          </Stack>
        </SimpleGrid>
      </Paper>

      <Paper withBorder p="lg" radius="md">
        <Stack gap="md">
          <div>
            <SectionHeading title="Client rent hurdle (optional)" order={5} mb={0} kind="input" />
            <Text size="sm" c="dimmed" mt={4}>
              Set a minimum $/SF rent threshold for a go/no-go signal.
            </Text>
          </div>
          <NumberInput
            label="Rent hurdle ($/SF)"
            placeholder="e.g. 1.85"
            value={hurdleInput}
            onChange={(v) => {
              setHurdleInput(v);
              if (v === '' || v === undefined) {
                setRentHurdle(null);
                return;
              }
              if (typeof v === 'number') {
                setRentHurdle(v);
                return;
              }
              const parsed = Number.parseFloat(v);
              setRentHurdle(Number.isFinite(parsed) ? parsed : null);
            }}
            prefix="$"
            decimalScale={2}
            allowDecimal
            min={0}
            style={{ maxWidth: 240 }}
          />
          {clearsHurdle && (
            <Alert color={semanticColors.success} icon={<IconCheck size={16} />} title="Above hurdle">
              Blended read of ${formatNumber(blended.avgRentPerSf, 2)}/SF clears the{' '}
              ${formatNumber(rentHurdlePerSf!, 2)}/SF client threshold.
            </Alert>
          )}
          {failsHurdle && (
            <Alert color={semanticColors.error} icon={<IconX size={16} />} title="Below hurdle">
              Blended read of ${formatNumber(blended.avgRentPerSf, 2)}/SF is below the{' '}
              ${formatNumber(rentHurdlePerSf!, 2)}/SF client threshold.
            </Alert>
          )}
          {hurdleSet && (
            <Badge
              size="lg"
              color={clearsHurdle ? semanticColors.success : semanticColors.error}
              leftSection={clearsHurdle ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />}
            >
              {clearsHurdle ? 'GO' : 'NO-GO'}
            </Badge>
          )}
        </Stack>
      </Paper>

      <StepNextButton
        onClick={() => setActiveStep('program')}
        disabled={!selectionValid}
      />
    </Stack>
  );
}
