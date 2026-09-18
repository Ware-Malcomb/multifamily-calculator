import {
  ActionIcon,
  Alert,
  Button,
  Group,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconGripVertical, IconPlus, IconTrash, IconArrowBackUp } from '@tabler/icons-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { BUILDING_TYPES, PRODUCT_TYPES } from '../../data/mockData';
import { useCalculator } from '../../hooks/useCalculatorContext';
import { paletteShades, semanticColors } from '../../theme/palette';
import { computeParkingRequirement, computeProgramMetrics, DEFAULT_PARKING_RATIO, DEFAULT_PARKING_RATIO_BASIS, DEFAULT_PARKING_RENTS, DEFAULT_PARKING_SHARES, formatCurrency, formatNumber, inferBedsFromLabel, parkingRatioSuffix, unitTypeGroupCounts, unitTypeGroupKey } from '../../utils/calculations';
import type { ParkingRatioBasis } from '../../types';
import { SectionBadgeProvider, SectionHeading } from '../common/SectionBadge';
import { StepNextButton } from '../workflow/StepNextButton';

function bedroomGroupLabel(beds: number): string {
  if (beds <= 0) return 'Studio';
  return `${beds}bd`;
}

function seriesLetter(beds: number): string {
  if (beds <= 0) return 'S';
  return String.fromCharCode(64 + beds);
}

function parseUnitNumber(value: string | number): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function ParkingNumberInput({
  value,
  onChange,
  onResetToDefault,
  overridden,
  prefix,
  suffix,
  decimalScale = 0,
  ariaLabel,
  readOnly,
  reserveReset,
}: {
  value: number;
  onChange?: (value: number) => void;
  onResetToDefault?: () => void;
  overridden?: boolean;
  prefix?: string;
  suffix?: string;
  decimalScale?: number;
  ariaLabel: string;
  readOnly?: boolean;
  reserveReset?: boolean;
}) {
  const showReset = Boolean(onResetToDefault) || reserveReset;
  return (
    <Group gap={4} wrap="nowrap" align="center">
      <NumberInput
        aria-label={ariaLabel}
        value={value}
        onChange={(v) => typeof v === 'number' && onChange?.(v)}
        readOnly={readOnly}
        variant={readOnly ? 'filled' : 'default'}
        prefix={prefix}
        suffix={suffix}
        decimalScale={decimalScale}
        fixedDecimalScale={decimalScale > 0}
        thousandSeparator=","
        hideControls
        style={{ flex: 1, minWidth: 0 }}
      />
      {showReset &&
        (onResetToDefault ? (
          <Tooltip label="Return to default" withArrow disabled={!overridden}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              disabled={!overridden}
              aria-label={`Return ${ariaLabel} to default`}
              onClick={onResetToDefault}
            >
              <IconArrowBackUp size={14} />
            </ActionIcon>
          </Tooltip>
        ) : (
          <ActionIcon size="sm" variant="subtle" aria-hidden tabIndex={-1} style={{ visibility: 'hidden' }}>
            <IconArrowBackUp size={14} />
          </ActionIcon>
        ))}
    </Group>
  );
}

export function ProgramStep() {
  const {
    state,
    blended,
    setProductType,
    setBuildingType,
    setBuildingCount,
    updateUnitType,
    addUnitType,
    removeUnitType,
    reorderUnitTypes,
    moveUnitTypeToEnd,
    updateParking,
    resetParkingType,
    resetRentsToDefault,
    resetUnitRentToDefault,
    advanceFromStep,
  } = useCalculator();

  const { site, unitTypes, parking, productType, buildingType, buildingCount } = state;
  const groupCounts = useMemo(() => unitTypeGroupCounts(unitTypes), [unitTypes]);
  const mixSections = useMemo(() => {
    const byGroup = new Map<number, typeof unitTypes>();
    for (const unit of unitTypes) {
      const key = unitTypeGroupKey(unit);
      const list = byGroup.get(key) ?? [];
      list.push(unit);
      byGroup.set(key, list);
    }
    return [...byGroup.keys()]
      .sort((a, b) => a - b)
      .map((beds) => ({
        beds,
        units: byGroup.get(beds)!,
        groupCount: groupCounts.get(beds) ?? 0,
      }));
  }, [unitTypes, groupCounts]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [rowDragEnabled, setRowDragEnabled] = useState(false);
  const [focusCountId, setFocusCountId] = useState<string | null>(null);
  const missingCount = unitTypes.some((u) => u.count <= 0);

  useEffect(() => {
    if (!focusCountId) return;
    const input =
      document.querySelector<HTMLInputElement>(`[data-unit-count-id="${focusCountId}"] input`) ??
      document.querySelector<HTMLInputElement>(`#unit-count-${focusCountId}`);
    input?.focus();
    input?.select();
    setFocusCountId(null);
  }, [focusCountId, unitTypes]);

  if (!site) {
    return (
      <Alert color={semanticColors.warning} title="Select a site first">
        Complete Step 1 before entering your unit program.
      </Alert>
    );
  }

  const metrics = computeProgramMetrics(unitTypes, site.acreage);
  const providedSpaces = parking.tuckedUnder + parking.covered + parking.surface;
  const requiredSpaces = computeParkingRequirement(
    unitTypes,
    parking.ratioBasis,
    parking.ratio,
  );
  const parkingDelta = providedSpaces - requiredSpaces;
  const parkingShareTotal = parking.tuckedShare + parking.coveredShare + parking.surfaceShare;
  const parkingTypes = [
    {
      name: 'Tucked-under',
      share: parking.tuckedShare,
      spaces: parking.tuckedUnder,
      rent: parking.tuckedUnderRent,
      shareOverridden: parking.tuckedShare !== DEFAULT_PARKING_SHARES.tuckedUnder,
      spacesOverridden: parking.tuckedUnderOverridden,
      rentOverridden: parking.tuckedUnderRent !== DEFAULT_PARKING_RENTS.tuckedUnder,
      onShare: (v: number) => updateParking('tuckedShare', v),
      onSpaces: (v: number) => updateParking('tuckedUnder', v),
      onRent: (v: number) => updateParking('tuckedUnderRent', v),
      resetShare: () => updateParking('tuckedShare', DEFAULT_PARKING_SHARES.tuckedUnder),
      resetSpaces: () => resetParkingType('tuckedUnder'),
      resetRent: () => updateParking('tuckedUnderRent', DEFAULT_PARKING_RENTS.tuckedUnder),
    },
    {
      name: 'Covered',
      share: parking.coveredShare,
      spaces: parking.covered,
      rent: parking.coveredRent,
      shareOverridden: parking.coveredShare !== DEFAULT_PARKING_SHARES.covered,
      spacesOverridden: parking.coveredOverridden,
      rentOverridden: parking.coveredRent !== DEFAULT_PARKING_RENTS.covered,
      onShare: (v: number) => updateParking('coveredShare', v),
      onSpaces: (v: number) => updateParking('covered', v),
      onRent: (v: number) => updateParking('coveredRent', v),
      resetShare: () => updateParking('coveredShare', DEFAULT_PARKING_SHARES.covered),
      resetSpaces: () => resetParkingType('covered'),
      resetRent: () => updateParking('coveredRent', DEFAULT_PARKING_RENTS.covered),
    },
    {
      name: 'Surface',
      share: parking.surfaceShare,
      spaces: parking.surface,
      rent: parking.surfaceRent,
      shareOverridden: parking.surfaceShare !== DEFAULT_PARKING_SHARES.surface,
      spacesOverridden: parking.surfaceOverridden,
      rentOverridden: parking.surfaceRent !== DEFAULT_PARKING_RENTS.surface,
      onShare: (v: number) => updateParking('surfaceShare', v),
      onSpaces: (v: number) => updateParking('surface', v),
      onRent: (v: number) => updateParking('surfaceRent', v),
      resetShare: () => updateParking('surfaceShare', DEFAULT_PARKING_SHARES.surface),
      resetSpaces: () => resetParkingType('surface'),
      resetRent: () => updateParking('surfaceRent', DEFAULT_PARKING_RENTS.surface),
    },
  ] as const;

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Program</Title>
        <Text c="dimmed" mt={4}>
          Enter design assumptions and unit mix. Rents default from the comp blend and are
          editable.
        </Text>
      </div>

      <Paper withBorder p="lg" radius="md">
        <SectionHeading title="Building assumptions" kind="input" />
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Select
            label="Product type"
            data={PRODUCT_TYPES}
            value={productType}
            onChange={(v) => v && setProductType(v)}
          />
          <Select
            label="Building type"
            data={BUILDING_TYPES}
            value={buildingType}
            onChange={(v) => v && setBuildingType(v)}
          />
          <NumberInput
            label="Number of buildings"
            value={buildingCount}
            onChange={(v) => typeof v === 'number' && setBuildingCount(v)}
            min={1}
          />
        </SimpleGrid>
      </Paper>

      <Paper withBorder p="lg" radius="md">
        <Group justify="space-between" mb="md" align="flex-start" wrap="nowrap">
          <div>
            <SectionHeading title="Unit mix" kind={['input', 'computed']} mb={0} />
            <Text size="sm" c="dimmed" mt={4}>
              Comp blend: ${formatNumber(blended.avgRentPerSf, 2)}/SF. A = 1-bed, B = 2-bed, C =
              3-bed. % of type uses unit counts within that bedroom group.
            </Text>
          </div>
          <Group>
            <Button variant="subtle" size="xs" onClick={resetRentsToDefault}>
              Default
            </Button>
            <Button
              leftSection={<IconPlus size={14} />}
              size="xs"
              onClick={() => setFocusCountId(addUnitType())}
            >
              Add unit type
            </Button>
          </Group>
        </Group>

        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={28} />
              <Table.Th>Label</Table.Th>
              <Table.Th>Beds</Table.Th>
              <Table.Th>Baths</Table.Th>
              <Table.Th>Count</Table.Th>
              <Table.Th>Sq ft</Table.Th>
              <Table.Th>Rent/unit</Table.Th>
              <Table.Th>% of mix</Table.Th>
              <Table.Th>% of type</Table.Th>
              <Table.Th w={40} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {mixSections.map((section) => (
              <Fragment key={section.beds}>
                <Table.Tr className="unit-mix-section-header" data-beds={section.beds}>
                  <Table.Td colSpan={10}>
                    <Group gap="xs" wrap="nowrap">
                      <Text size="xs" fw={800} tt="uppercase" lts={0.04}>
                        {seriesLetter(section.beds)} · {bedroomGroupLabel(section.beds)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {section.groupCount} units
                      </Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
                {section.units.map((unit) => {
                  const typeBeds = section.beds;
                  const groupCount = section.groupCount;
                  return (
              <Table.Tr
                key={unit.id}
                className="unit-mix-row"
                data-beds={typeBeds}
                draggable={rowDragEnabled}
                data-dragging={dragId === unit.id || undefined}
                data-drag-over={
                  dragOverId?.startsWith(`${unit.id}:`) && dragId !== unit.id ? true : undefined
                }
                data-drag-place={
                  dragOverId?.startsWith(`${unit.id}:`) ? dragOverId.split(':')[1] : undefined
                }
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', unit.id);
                  e.dataTransfer.effectAllowed = 'move';
                  setDragId(unit.id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const place = e.clientY > rect.top + rect.height / 2 ? 'after' : 'before';
                  setDragOverId(`${unit.id}:${place}`);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromId = e.dataTransfer.getData('text/plain') || dragId;
                  const fromUnit = unitTypes.find((u) => u.id === fromId);
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const place = e.clientY > rect.top + rect.height / 2 ? 'after' : 'before';
                  if (
                    fromId &&
                    fromUnit &&
                    unitTypeGroupKey(fromUnit) === typeBeds
                  ) {
                    reorderUnitTypes(fromId, unit.id, place);
                  }
                  setDragId(null);
                  setDragOverId(null);
                  setRowDragEnabled(false);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setDragOverId(null);
                  setRowDragEnabled(false);
                }}
              >
                <Table.Td>
                  <ActionIcon
                    className="unit-mix-drag-handle"
                    variant="subtle"
                    color="gray"
                    size="sm"
                    aria-label={`Reorder ${unit.label}`}
                    onMouseDown={() => setRowDragEnabled(true)}
                    onMouseUp={() => setRowDragEnabled(false)}
                  >
                    <IconGripVertical size={14} />
                  </ActionIcon>
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={unit.label}
                    onChange={(e) => {
                      const label = e.currentTarget.value;
                      const inferredBeds = inferBedsFromLabel(label);
                      updateUnitType(
                        unit.id,
                        inferredBeds === null ? { label } : { label, beds: inferredBeds },
                      );
                    }}
                    size="xs"
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    value={unit.beds}
                    onChange={(v) => {
                      const n = parseUnitNumber(v);
                      if (n !== null) updateUnitType(unit.id, { beds: n });
                    }}
                    min={0}
                    size="xs"
                    w={60}
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    value={unit.baths}
                    onChange={(v) => {
                      const n = parseUnitNumber(v);
                      if (n !== null) updateUnitType(unit.id, { baths: n });
                    }}
                    min={0}
                    step={0.5}
                    decimalScale={1}
                    size="xs"
                    w={60}
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    data-unit-count-id={unit.id}
                    id={`unit-count-${unit.id}`}
                    value={unit.count > 0 ? unit.count : ''}
                    placeholder="Required"
                    onChange={(v) => {
                      const n = parseUnitNumber(v);
                      if (n !== null) updateUnitType(unit.id, { count: n });
                    }}
                    min={0}
                    size="xs"
                    w={88}
                    error={unit.count <= 0 ? 'Enter count' : undefined}
                    styles={
                      unit.count <= 0
                        ? {
                            input: {
                              borderColor: 'var(--color-pumpkin-spice)',
                              backgroundColor:
                                'color-mix(in srgb, var(--color-pumpkin-spice) 8%, white)',
                            },
                          }
                        : undefined
                    }
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    value={unit.sqFt}
                    onChange={(v) => {
                      const n = parseUnitNumber(v);
                      if (n !== null) updateUnitType(unit.id, { sqFt: n });
                    }}
                    min={0}
                    size="xs"
                    w={80}
                  />
                </Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <NumberInput
                      value={unit.rentPerUnit}
                      onChange={(v) => {
                        const n = parseUnitNumber(v);
                        if (n !== null) updateUnitType(unit.id, { rentPerUnit: n });
                      }}
                      prefix="$"
                      min={0}
                      size="xs"
                      w={100}
                      hideControls
                    />
                    <Tooltip label="Return to default" withArrow disabled={!unit.rentOverridden}>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        disabled={!unit.rentOverridden}
                        aria-label="Return to default"
                        onClick={() => resetUnitRentToDefault(unit.id)}
                      >
                        <IconArrowBackUp size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {metrics.totalUnits > 0
                      ? `${formatNumber((unit.count / metrics.totalUnits) * 100, 1)}%`
                      : '—'}
                  </Text>
                </Table.Td>
                <Table.Td className="unit-mix-bed-group">
                  <Text size="sm" fw={600}>
                    {groupCount > 0
                      ? `${formatNumber((unit.count / groupCount) * 100, 1)}%`
                      : '—'}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {bedroomGroupLabel(typeBeds)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="subtle"
                    color={semanticColors.error}
                    onClick={() => removeUnitType(unit.id)}
                    disabled={unitTypes.length <= 1}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
                  );
                })}
                {dragId &&
                  unitTypes.some(
                    (u) => u.id === dragId && unitTypeGroupKey(u) === section.beds,
                  ) && (
                    <Table.Tr
                      className="unit-mix-drop-end"
                      data-beds={section.beds}
                      data-drag-over={dragOverId === `end-${section.beds}` || undefined}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        setDragOverId(`end-${section.beds}`);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromId = e.dataTransfer.getData('text/plain') || dragId;
                        if (fromId) moveUnitTypeToEnd(fromId);
                        setDragId(null);
                        setDragOverId(null);
                        setRowDragEnabled(false);
                      }}
                    >
                      <Table.Td colSpan={10}>Drop at bottom of section</Table.Td>
                    </Table.Tr>
                  )}
              </Fragment>
            ))}
          </Table.Tbody>
        </Table>
        {missingCount && (
          <Text size="xs" c="orange.7" mt="sm">
            Enter a unit count for each new type. % of mix and % of type both use those counts (A =
            1-bed, B = 2-bed, C = 3-bed).
          </Text>
        )}
      </Paper>

      <SectionBadgeProvider kind={['input', 'computed']}>
        <Paper withBorder p="lg" radius="md">
          <SectionHeading title="Parking" kind={['input', 'computed']} />
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Set the ratio, then split required spaces by type. Surface starts at 50%.
            </Text>
            <div className="parking-metrics-grid">
              <Stack gap={4}>
                <Text size="sm" fw={500}>
                  Ratio basis
                </Text>
                <Group gap={4} wrap="nowrap" align="center">
                  <Select
                    aria-label="Ratio basis"
                    data={[
                      { value: 'unit', label: 'Per unit' },
                      { value: 'bedroom', label: 'Per bedroom' },
                      { value: 'sqft', label: 'Per 1,000 SF' },
                    ]}
                    value={parking.ratioBasis}
                    onChange={(v) => v && updateParking('ratioBasis', v as ParkingRatioBasis)}
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <ActionIcon size="sm" variant="subtle" aria-hidden tabIndex={-1} style={{ visibility: 'hidden' }}>
                    <IconArrowBackUp size={14} />
                  </ActionIcon>
                </Group>
              </Stack>
              <Stack gap={4}>
                <Text size="sm" fw={500}>
                  Ratio
                </Text>
                <ParkingNumberInput
                  ariaLabel="Parking ratio"
                  value={parking.ratio}
                  onChange={(v) => updateParking('ratio', v)}
                  onResetToDefault={() => {
                    updateParking('ratioBasis', DEFAULT_PARKING_RATIO_BASIS);
                    updateParking('ratio', DEFAULT_PARKING_RATIO);
                  }}
                  overridden={
                    parking.ratio !== DEFAULT_PARKING_RATIO ||
                    parking.ratioBasis !== DEFAULT_PARKING_RATIO_BASIS
                  }
                  decimalScale={2}
                  suffix={parkingRatioSuffix(parking.ratioBasis)}
                  reserveReset
                />
              </Stack>
              <Stack gap={4}>
                <Text size="sm" fw={500}>
                  Required
                </Text>
                <ParkingNumberInput
                  ariaLabel="Required spaces"
                  value={requiredSpaces}
                  readOnly
                  reserveReset
                />
              </Stack>
              <Stack gap={4}>
                <Text size="sm" fw={500}>
                  Provided
                </Text>
                <ParkingNumberInput
                  ariaLabel="Provided spaces"
                  value={providedSpaces}
                  readOnly
                  reserveReset
                />
              </Stack>
            </div>
            <Text size="xs" c="dimmed">
              {parkingDelta === 0
                ? 'Provided matches the ratio.'
                : parkingDelta > 0
                  ? `${parkingDelta} above ratio.`
                  : `${Math.abs(parkingDelta)} short of ratio.`}
              {parkingShareTotal !== 100
                ? ` Type shares total ${formatNumber(parkingShareTotal, 1)}%.`
                : ''}
            </Text>
            <div className="parking-type-grid">
              <Text className="parking-type-grid__head">Type</Text>
              <Text className="parking-type-grid__head">%</Text>
              <Text className="parking-type-grid__head">Spaces</Text>
              <Text className="parking-type-grid__head">Rent</Text>
              {parkingTypes.map((row) => (
                <Fragment key={row.name}>
                  <Text className="parking-type-grid__type">{row.name}</Text>
                  <ParkingNumberInput
                    ariaLabel={`${row.name} %`}
                    value={row.share}
                    onChange={row.onShare}
                    onResetToDefault={row.resetShare}
                    overridden={row.shareOverridden}
                    decimalScale={1}
                    suffix="%"
                  />
                  <ParkingNumberInput
                    ariaLabel={`${row.name} spaces`}
                    value={row.spaces}
                    onChange={row.onSpaces}
                    onResetToDefault={row.resetSpaces}
                    overridden={row.spacesOverridden}
                  />
                  <ParkingNumberInput
                    ariaLabel={`${row.name} rent`}
                    value={row.rent}
                    onChange={row.onRent}
                    onResetToDefault={row.resetRent}
                    overridden={row.rentOverridden}
                    prefix="$"
                    suffix="/mo"
                  />
                </Fragment>
              ))}
            </div>
          </Stack>
        </Paper>
      </SectionBadgeProvider>

      <Paper withBorder p="lg" radius="md" bg="#ffffff" style={{ borderColor: paletteShades.softPeriwinkle[1] }}>
        <SectionHeading title="Auto-computed metrics" order={5} mb="sm" kind="computed" />
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <Stack gap={2}>
            <Text size="xs" c="dimmed">
              Total units
            </Text>
            <Text fw={700}>{metrics.totalUnits}</Text>
          </Stack>
          <Stack gap={2}>
            <Text size="xs" c="dimmed">
              Avg unit size
            </Text>
            <Text fw={700}>{formatNumber(metrics.avgUnitSize)} SF</Text>
          </Stack>
          <Stack gap={2}>
            <Text size="xs" c="dimmed">
              Density
            </Text>
            <Text fw={700}>{formatNumber(metrics.densityUnitsPerAcre, 1)} u/ac</Text>
          </Stack>
          <Stack gap={2}>
            <Text size="xs" c="dimmed">
              Weighted avg rent
            </Text>
            <Text fw={700}>
              {metrics.totalUnits > 0
                ? formatCurrency(
                    unitTypes.reduce((s, u) => s + u.count * u.rentPerUnit, 0) / metrics.totalUnits,
                  )
                : '—'}
            </Text>
          </Stack>
        </SimpleGrid>
      </Paper>

      <StepNextButton onClick={() => advanceFromStep('program', 'costs')} />
    </Stack>
  );
}
