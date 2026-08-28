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
  onUpdate: <K extends keyof SiteData>(key: K, value: SiteData[K]) => void;
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

export function SiteSummary({ site, onUpdate }: SiteSummaryProps) {
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
              onChange={(v) => onUpdate('parcelId', v)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12 }}>
            <TextDataField
              label="Owner"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.owner}
              value={site.owner ?? ''}
              onChange={(v) => onUpdate('owner', v)}
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
              missing={site.acreage <= 0}
              onChange={(v) => onUpdate('acreage', v)}
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
              onChange={(v) => onUpdate('sqFt', v)}
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
              onChange={(v) => onUpdate('lat', v)}
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
              onChange={(v) => onUpdate('lon', v)}
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
              onChange={(v) => onUpdate('city', v)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <TextDataField
              label="County"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.county}
              value={site.county ?? ''}
              onChange={(v) => onUpdate('county', v)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <TextDataField
              label="State"
              kind="pulled"
              source={src}
              description={REGRID_FIELD_HINTS.state2}
              value={site.state ?? ''}
              onChange={(v) => onUpdate('state', v)}
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
            onChange={(v) => onUpdate('landUse', v)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextDataField
            label="Zoning code"
            kind="pulled"
            source={src}
            description={REGRID_FIELD_HINTS.zoning}
            value={site.zoning}
            onChange={(v) => onUpdate('zoning', v)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextDataField
            label="Zoning type"
            kind="pulled"
            source={src}
            description={REGRID_FIELD_HINTS.zoning_type}
            value={site.zoningType}
            onChange={(v) => onUpdate('zoningType', v)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextDataField
            label="Zoning subtype"
            kind="pulled"
            source={src}
            description={REGRID_FIELD_HINTS.zoning_subtype}
            value={site.zoningSubtype}
            onChange={(v) => onUpdate('zoningSubtype', v)}
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
            missing={site.taxValuation <= 0}
            onChange={(v) => onUpdate('taxValuation', v)}
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
            onChange={(v) => onUpdate('landValue', v)}
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
            onChange={(v) => onUpdate('improvementValue', v)}
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
            onChange={(v) => onUpdate('annualTax', v)}
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
            onChange={(v) => onUpdate('valuationType', v)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextDataField
            label="Tax year"
            kind="pulled"
            source={src}
            description={REGRID_FIELD_HINTS.taxyear}
            value={site.taxYear ?? ''}
            onChange={(v) => onUpdate('taxYear', v)}
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
            onChange={(v) => onUpdate('floodZone', v)}
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
            onChange={(v) => onUpdate('floodRisk', v)}
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
            onChange={(v) => onUpdate('terrainRoughness', v)}
            rating={parseRoughnessRating(site.terrainRoughness)}
          />
        </Grid.Col>
      </Grid>
      </SectionBadgeProvider>
    </Stack>
  );
}
