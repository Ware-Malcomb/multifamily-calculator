import { Divider, Stack, Table, Text } from '@mantine/core';
import { useMemo } from 'react';
import { useCalculator } from '../../hooks/useCalculatorContext';
import type { ParkingAssumptions, UnitType } from '../../types';
import { computeCostBreakdown, formatCurrency, formatNumber } from '../../utils/calculations';
import { FeasibilityDecision } from './FeasibilityDecision';
import { CostBreakdownChart, RentComparisonChart } from './FeasibilitySummaryCharts';

interface FeasibilitySummaryContentProps {
  hideDecision?: boolean;
  layout?: 'panel' | 'print';
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="feasibility-summary-row">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} lh={1.2}>
        {label}
      </Text>
      <Text size="sm" fw={600} lh={1.3}>
        {value}
      </Text>
    </div>
  );
}

function ParkingPricesTable({
  parking,
  compact = false,
}: {
  parking: ParkingAssumptions;
  compact?: boolean;
}) {
  const rows = [
    { type: 'Tucked-under', spaces: parking.tuckedUnder, rent: parking.tuckedUnderRent },
    { type: 'Covered', spaces: parking.covered, rent: parking.coveredRent },
    { type: 'Surface', spaces: parking.surface, rent: parking.surfaceRent },
  ];
  const totalSpaces = rows.reduce((sum, r) => sum + r.spaces, 0);

  if (compact) {
    return (
      <div className="feasibility-parking-print">
        <div className="feasibility-parking-print__title">Parking</div>
        <table className="feasibility-parking-print__table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Spaces</th>
              <th>Rent/mo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.type}>
                <td>{row.type}</td>
                <td>{row.spaces}</td>
                <td>{formatCurrency(row.rent)}</td>
              </tr>
            ))}
            <tr className="feasibility-parking-print__total">
              <td>Total</td>
              <td>{totalSpaces}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <Stack gap="xs">
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        Parking
      </Text>
      <Table
        className="feasibility-parking-table"
        verticalSpacing={4}
        horizontalSpacing="xs"
        withRowBorders={false}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Type</Table.Th>
            <Table.Th ta="right">Spaces</Table.Th>
            <Table.Th ta="right">Rent/mo</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr key={row.type}>
              <Table.Td>
                <Text size="xs">{row.type}</Text>
              </Table.Td>
              <Table.Td ta="right">
                <Text size="xs">{row.spaces}</Text>
              </Table.Td>
              <Table.Td ta="right">
                <Text size="xs">{formatCurrency(row.rent)}</Text>
              </Table.Td>
            </Table.Tr>
          ))}
          <Table.Tr>
            <Table.Td>
              <Text size="xs" fw={700}>
                Total
              </Text>
            </Table.Td>
            <Table.Td ta="right">
              <Text size="xs" fw={700}>
                {totalSpaces}
              </Text>
            </Table.Td>
            <Table.Td />
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Stack>
  );
}

function UnitMixPrintTable({ unitTypes }: { unitTypes: UnitType[] }) {
  const totalUnits = unitTypes.reduce((sum, u) => sum + u.count, 0);

  return (
    <div className="feasibility-unitmix-print">
      <div className="feasibility-unitmix-print__title">Unit mix</div>
      <table className="feasibility-unitmix-print__table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Beds</th>
            <th>Baths</th>
            <th>Units</th>
            <th>% of mix</th>
            <th>Sq ft</th>
            <th>Rent/mo</th>
          </tr>
        </thead>
        <tbody>
          {unitTypes.map((unit) => {
            const pct = totalUnits > 0 ? (unit.count / totalUnits) * 100 : 0;
            return (
              <tr key={unit.id}>
                <td>{unit.label}</td>
                <td>{unit.beds}</td>
                <td>{Number.isInteger(unit.baths) ? unit.baths : formatNumber(unit.baths, 1)}</td>
                <td>{unit.count}</td>
                <td>{formatNumber(pct, 0)}%</td>
                <td>{formatNumber(unit.sqFt)}</td>
                <td>{formatCurrency(unit.rentPerUnit)}</td>
              </tr>
            );
          })}
          <tr className="feasibility-unitmix-print__total">
            <td>Total</td>
            <td />
            <td />
            <td>{totalUnits}</td>
            <td>100%</td>
            <td />
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function FeasibilitySummaryContent({
  hideDecision = false,
  layout = 'panel',
}: FeasibilitySummaryContentProps) {
  const { state, feasibility, blended } = useCalculator();
  const { rentHurdlePerSf, parking, unitTypes, site } = state;
  const isPrint = layout === 'print';

  const costBreakdown = useMemo(() => computeCostBreakdown(state), [state]);

  if (!feasibility) {
    return (
      <Text size="sm" c="dimmed">
        Add unit counts in the Program step to compute feasibility.
      </Text>
    );
  }

  const programRentPerSf =
    feasibility.avgUnitSize > 0 ? feasibility.avgRentToday / feasibility.avgUnitSize : 0;
  const ami = site?.areaMedianIncome ?? 119_300;

  const parkingTable = <ParkingPricesTable parking={parking} />;
  const parkingPrintTable = <ParkingPricesTable parking={parking} compact />;

  const metrics = (
    <>
      <SummaryRow label="Total project cost" value={formatCurrency(feasibility.totalProjectCost)} />
      <SummaryRow label="Cost / unit" value={formatCurrency(feasibility.costPerUnit)} />
      <SummaryRow label="Avg rent today" value={formatCurrency(feasibility.avgRentToday)} />
      <SummaryRow
        label="Gross revenue (annual)"
        value={formatCurrency(feasibility.annualGrossRevenue)}
      />
      <SummaryRow
        label="Stabilized rent"
        value={`$${formatNumber(feasibility.stabilizedRentPerSf, 2)}/SF`}
      />
      <SummaryRow
        label="Density"
        value={`${formatNumber(feasibility.densityUnitsPerAcre, 1)} units/ac`}
      />
      <SummaryRow label="Avg unit size" value={`${formatNumber(feasibility.avgUnitSize)} SF`} />
      <SummaryRow
        label="Project duration"
        value={`${feasibility.projectDurationMonths} months`}
      />
      <SummaryRow label="Land price" value={formatCurrency(feasibility.landPrice)} />
      <SummaryRow label="Total units" value={String(feasibility.totalUnits)} />
      {rentHurdlePerSf !== null && rentHurdlePerSf > 0 && (
        <SummaryRow label="Rent hurdle" value={`$${formatNumber(rentHurdlePerSf, 2)}/SF`} />
      )}
    </>
  );

  const hurdleSection =
    rentHurdlePerSf !== null && rentHurdlePerSf > 0 && !hideDecision ? (
      <FeasibilityDecision isGo={blended.avgRentPerSf >= rentHurdlePerSf} />
    ) : null;

  if (isPrint) {
    const detailMetrics = [
      { label: 'Avg rent today', value: formatCurrency(feasibility.avgRentToday) },
      {
        label: 'Stabilized rent',
        value: `$${formatNumber(feasibility.stabilizedRentPerSf, 2)}/SF`,
      },
      {
        label: 'Density',
        value: `${formatNumber(feasibility.densityUnitsPerAcre, 1)} units/ac`,
      },
      { label: 'Avg unit size', value: `${formatNumber(feasibility.avgUnitSize)} SF` },
      {
        label: 'Project duration',
        value: `${feasibility.projectDurationMonths} months`,
      },
      { label: 'Land price', value: formatCurrency(feasibility.landPrice) },
      ...(rentHurdlePerSf !== null && rentHurdlePerSf > 0
        ? [{ label: 'Rent hurdle', value: `$${formatNumber(rentHurdlePerSf, 2)}/SF` }]
        : []),
    ];

    return (
      <div className="feasibility-summary-print">
        <div className="feasibility-report-highlights">
          <div className="feasibility-report-highlight">
            <div className="feasibility-report-highlight__label">Total project cost</div>
            <div className="feasibility-report-highlight__value">
              {formatCurrency(feasibility.totalProjectCost)}
            </div>
          </div>
          <div className="feasibility-report-highlight">
            <div className="feasibility-report-highlight__label">Cost / unit</div>
            <div className="feasibility-report-highlight__value">
              {formatCurrency(feasibility.costPerUnit)}
            </div>
          </div>
          <div className="feasibility-report-highlight">
            <div className="feasibility-report-highlight__label">Gross revenue (annual)</div>
            <div className="feasibility-report-highlight__value">
              {formatCurrency(feasibility.annualGrossRevenue)}
            </div>
          </div>
          <div className="feasibility-report-highlight">
            <div className="feasibility-report-highlight__label">Total units</div>
            <div className="feasibility-report-highlight__value">{feasibility.totalUnits}</div>
          </div>
          <div className="feasibility-report-highlight">
            <div className="feasibility-report-highlight__label">AMI (region)</div>
            <div className="feasibility-report-highlight__value">{formatCurrency(ami)}</div>
          </div>
        </div>

        <div className="feasibility-report-charts">
          {costBreakdown && (
            <CostBreakdownChart segments={costBreakdown} total={feasibility.totalProjectCost} />
          )}
          <RentComparisonChart
            stabilizedRentPerSf={feasibility.stabilizedRentPerSf}
            programRentPerSf={programRentPerSf}
            rentHurdlePerSf={rentHurdlePerSf}
          />
        </div>

        <UnitMixPrintTable unitTypes={unitTypes} />

        <div className="feasibility-report-lower">
          <div className="feasibility-report-parking">{parkingPrintTable}</div>
          <div className="feasibility-report-metrics">
            {detailMetrics.map((row) => (
              <div key={row.label} className="feasibility-summary-row">
                <div className="feasibility-summary-row__label">{row.label}</div>
                <div className="feasibility-summary-row__value">{row.value}</div>
              </div>
            ))}
          </div>
        </div>

        {hurdleSection && <div className="feasibility-report-decision">{hurdleSection}</div>}
      </div>
    );
  }

  return (
    <Stack gap="md">
      {costBreakdown && (
        <CostBreakdownChart segments={costBreakdown} total={feasibility.totalProjectCost} />
      )}

      <Divider />

      <RentComparisonChart
        stabilizedRentPerSf={feasibility.stabilizedRentPerSf}
        programRentPerSf={programRentPerSf}
        rentHurdlePerSf={rentHurdlePerSf}
      />

      <Divider />

      {parkingTable}

      <Divider />

      {metrics}

      {rentHurdlePerSf !== null && rentHurdlePerSf > 0 && (
        <>
          <Divider />
          {!hideDecision && hurdleSection}
        </>
      )}
    </Stack>
  );
}
