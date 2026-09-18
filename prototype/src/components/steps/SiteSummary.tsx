import { Collapse, Divider, Grid, Group, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import type { DataSource, SiteData } from '../../types';
import { REGRID_FIELD_HINTS, REGRID_SCHEMA_CATEGORIES } from '../../services/regrid/schemaReference';
import { parseFloodZoneRating, parseNriRiskRating, parseRoughnessRating } from '../../utils/ratings';
import { NumberDataField, TextDataField } from '../common/DataField';
import { SectionBadgeProvider } from '../common/SectionBadge';
import { SourceBadge } from '../common/SourceBadge';

interface SiteSummaryProps {
  site: SiteData;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  source,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  source?: DataSource;
}) {
  const [opened, { toggle }] = useDisclosure(defaultOpen);

  return (
    <SectionBadgeProvider kind="pulled" source={source}>
      <UnstyledButton
        onClick={toggle}
        w="100%"
        aria-expanded={opened}
        aria-label={`${opened ? 'Collapse' : 'Expand'} ${title}`}
      >
        <Group justify="space-between" gap="xs" mt="sm" mb={4} wrap="nowrap">
          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              {title}
            </Text>
            {source && <SourceBadge kind="pulled" source={source} />}
          </Group>
          {opened ? (
            <IconChevronUp size={14} color="var(--mantine-color-dimmed)" />
          ) : (
            <IconChevronDown size={14} color="var(--mantine-color-dimmed)" />
          )}
        </Group>
      </UnstyledButton>
      <Collapse expanded={opened}>{children}</Collapse>
    </SectionBadgeProvider>
  );
}

function SectionTitle({ children, source }: { children: string; source?: DataSource }) {
  return (
    <Group gap="xs" mt="sm" mb={4} wrap="nowrap">
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        {children}
      </Text>
      {source && <SourceBadge kind="pulled" source={source} />}
    </Group>
  );
}

export function SiteSummary({ site }: SiteSummaryProps) {
  const src = site.source;

  return (
    <Stack gap="xs">
      <Title order={4}>Site summary</Title>

      <CollapsibleSection title={REGRID_SCHEMA_CATEGORIES.identification} source={src}>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextDataField
              label="Regrid ID"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.ll_uuid}
              value={site.regridId}
              readOnly
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextDataField
              label="Parcel number (APN)"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.parcelnumb}
              value={site.parcelId}
              readOnly
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12 }}>
            <TextDataField
              label="Owner"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.owner}
              value={site.owner ?? ''}
              readOnly
            />
          </Grid.Col>
        </Grid>
      </CollapsibleSection>

      <Divider my="xs" />

      <CollapsibleSection title={REGRID_SCHEMA_CATEGORIES.geometry} source={src}>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <NumberDataField
              label="Acreage"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.ll_gisacre}
              value={site.acreage || undefined}
              readOnly
              suffix=" ac"
              decimalScale={1}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <NumberDataField
              label="Area"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.ll_gissqft}
              value={site.sqFt}
              readOnly
              suffix=" SF"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <NumberDataField
              label="Latitude"
              kind="pulled"
              source={src}
              description="EPSG:4326"
              value={site.lat}
              readOnly
              decimalScale={5}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <NumberDataField
              label="Longitude"
              kind="pulled"
              source={src}
              description="EPSG:4326"
              value={site.lon}
              readOnly
              decimalScale={5}
            />
          </Grid.Col>
        </Grid>
      </CollapsibleSection>

      <Divider my="xs" />

      <CollapsibleSection title={REGRID_SCHEMA_CATEGORIES.geographies} source={src}>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <TextDataField
              label="City"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.scity}
              value={site.city ?? ''}
              readOnly
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <TextDataField
              label="County"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.county}
              value={site.county ?? ''}
              readOnly
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <TextDataField
              label="State"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.state2}
              value={site.state ?? ''}
              readOnly
            />
          </Grid.Col>
        </Grid>
      </CollapsibleSection>

      <Divider my="xs" />

      <SectionBadgeProvider kind="pulled" source={src}>
        <SectionTitle source={src}>{REGRID_SCHEMA_CATEGORIES.landUse}</SectionTitle>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextDataField
              label="Land use"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.lbcs_function_desc}
              value={site.landUse}
              readOnly
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextDataField
              label="Zoning code"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.zoning}
              value={site.zoning}
              readOnly
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextDataField
              label="Zoning type"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.zoning_type}
              value={site.zoningType}
              readOnly
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextDataField
              label="Zoning subtype"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.zoning_subtype}
              value={site.zoningSubtype}
              readOnly
            />
          </Grid.Col>
        </Grid>
      </SectionBadgeProvider>

      <Divider my="xs" />

      <SectionBadgeProvider kind="pulled" source={src}>
        <SectionTitle source={src}>{REGRID_SCHEMA_CATEGORIES.assessment}</SectionTitle>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberDataField
              label="Total parcel value"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.parval}
              value={site.taxValuation || undefined}
              readOnly
              prefix="$"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberDataField
              label="Land value"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.landval}
              value={site.landValue}
              readOnly
              prefix="$"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberDataField
              label="Improvement value"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.improvval}
              value={site.improvementValue}
              readOnly
              prefix="$"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberDataField
              label="Annual tax"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.taxamt}
              value={site.annualTax}
              readOnly
              prefix="$"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextDataField
              label="Valuation type"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.parvaltype}
              value={site.valuationType ?? ''}
              readOnly
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextDataField
              label="Tax year"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.taxyear}
              value={site.taxYear ?? ''}
              readOnly
            />
          </Grid.Col>
        </Grid>
      </SectionBadgeProvider>

      <Divider my="xs" />

      <SectionBadgeProvider kind="pulled" source={src}>
        <SectionTitle source={src}>{REGRID_SCHEMA_CATEGORIES.environment}</SectionTitle>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextDataField
              label="FEMA flood zone"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.fema_flood_zone}
              value={site.floodZone}
              readOnly
              rating={parseFloodZoneRating(site.floodZone)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextDataField
              label="Natural hazard risk"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.fema_nri_risk_rating}
              value={site.floodRisk ?? ''}
              readOnly
              rating={parseNriRiskRating(site.floodRisk)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextDataField
              label="Terrain roughness"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.roughness_rating}
              value={site.terrainRoughness ?? ''}
              readOnly
              rating={parseRoughnessRating(site.terrainRoughness)}
            />
          </Grid.Col>
        </Grid>
      </SectionBadgeProvider>
    </Stack>
  );
}
