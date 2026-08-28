import { Alert, Grid, Paper, Stack, Text, Title } from '@mantine/core';
import { useCalculator } from '../../hooks/useCalculatorContext';
import { semanticColors } from '../../theme/palette';
import { exportFeasibilityReport } from '../../utils/exportFeasibilityReport';
import { NumberDataField } from '../common/DataField';
import { SectionBadgeProvider, SectionHeading } from '../common/SectionBadge';
import { StepExportButton } from '../workflow/StepExportButton';

export function CostsStep() {
  const { state, updateCosts, resetCostToDefault, feasibility } = useCalculator();
  const { site, costs } = state;

  if (!site) {
    return (
      <Alert color={semanticColors.warning} title="Select a site first">
        Complete earlier steps to build the cost and feasibility picture.
      </Alert>
    );
  }

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Costs & feasibility</Title>
        <Text c="dimmed" mt={4}>
          Hard and soft costs default from FRED and firm pay-app benchmarks. Override values as
          needed.
        </Text>
      </div>

      <SectionBadgeProvider kind="pulled" source={costs.hardCostSource}>
        <Paper withBorder p="lg" radius="md">
          <SectionHeading title="Hard & soft costs" kind="pulled" source={costs.hardCostSource} />
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberDataField
                label="Hard cost"
                kind="pulled"
                source={costs.hardCostSource}
                overridden={costs.hardCostOverridden}
                value={costs.hardCostPerSf}
                onChange={(v) => updateCosts('hardCostPerSf', v)}
                onResetToDefault={() => resetCostToDefault('hardCostPerSf')}
                prefix="$"
                suffix="/SF"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberDataField
                label="A&E (soft cost %)"
                kind="pulled"
                source={costs.aeSource}
                overridden={costs.aePercentOverridden}
                value={costs.aePercent}
                onChange={(v) => updateCosts('aePercent', v)}
                onResetToDefault={() => resetCostToDefault('aePercent')}
                suffix="%"
                decimalScale={1}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberDataField
                label="Lease-up / marketing (soft cost %)"
                kind="pulled"
                source={costs.leaseUpMarketingSource}
                overridden={costs.leaseUpMarketingOverridden}
                value={costs.leaseUpMarketingPercent}
                onChange={(v) => updateCosts('leaseUpMarketingPercent', v)}
                onResetToDefault={() => resetCostToDefault('leaseUpMarketingPercent')}
                suffix="%"
                decimalScale={1}
              />
            </Grid.Col>
          </Grid>
        </Paper>
      </SectionBadgeProvider>

      <Paper withBorder p="lg" radius="md">
        <Title order={4} mb="md">
          Land, taxes & fees
        </Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberDataField
              label="Land price"
              kind="pulled"
              source={costs.landPriceSource}
              value={costs.landPrice}
              onChange={(v) => updateCosts('landPrice', v)}
              prefix="$"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberDataField
              label="Property taxes (annual)"
              kind="pulled"
              source={costs.propertyTaxSource}
              value={costs.propertyTaxAnnual}
              onChange={(v) => updateCosts('propertyTaxAnnual', v)}
              prefix="$"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberDataField
              label="Municipal / impact fees"
              kind="pulled"
              source={costs.impactFeesSource}
              value={costs.impactFees}
              onChange={(v) => updateCosts('impactFees', v)}
              prefix="$"
            />
          </Grid.Col>
        </Grid>
      </Paper>

      <SectionBadgeProvider kind="input">
        <Paper withBorder p="lg" radius="md">
          <SectionHeading title="Timeline assumption" kind="input" />
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberDataField
                label="Lease-up pace"
                kind="input"
                description="Required user assumption — drives projected project duration."
                value={costs.leaseUpPaceUnitsPerMonth}
                onChange={(v) => updateCosts('leaseUpPaceUnitsPerMonth', v)}
                suffix=" units/mo"
              />
            </Grid.Col>
          </Grid>
        </Paper>
      </SectionBadgeProvider>

      <StepExportButton
        onClick={exportFeasibilityReport}
        disabled={!feasibility}
      />
    </Stack>
  );
}
