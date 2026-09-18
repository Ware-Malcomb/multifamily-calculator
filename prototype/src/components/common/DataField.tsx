import { ActionIcon, Group, NumberInput, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { IconArrowBackUp } from '@tabler/icons-react';
import type { DataSource } from '../../types';
import { NOT_IN_REGRID } from '../../services/regrid/mapParcelToSite';
import type { RatingSpec } from '../../utils/ratings';
import { RatingIndicator } from './RatingIndicator';
import { SourceBadge } from './SourceBadge';
import { useHideFieldSourceBadge, type FieldKind } from './SectionBadge';

const MISSING_PLACEHOLDER = 'Not in Regrid — enter manually';
const MISSING_INPUT_STYLES = {
  input: {
    borderColor: 'var(--color-pumpkin-spice)',
    backgroundColor: 'color-mix(in srgb, var(--color-pumpkin-spice) 8%, white)',
  },
};

function isBlankText(value: string | undefined): boolean {
  const v = value?.trim() ?? '';
  return v.length === 0 || v === NOT_IN_REGRID;
}

interface DataFieldProps {
  label: string;
  kind: FieldKind;
  source?: DataSource;
  overridden?: boolean;
  description?: string;
}

interface TextDataFieldProps extends DataFieldProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  rating?: RatingSpec | null;
  missing?: boolean;
}

interface NumberDataFieldProps extends DataFieldProps {
  value: number | undefined;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  prefix?: string;
  suffix?: string;
  decimalScale?: number;
  /** When set, shows a tiny undo control to restore the automated default */
  onResetToDefault?: () => void;
  missing?: boolean;
}

export function TextDataField({
  label,
  kind,
  source,
  overridden,
  description,
  value,
  onChange,
  readOnly,
  placeholder,
  rating,
  missing,
}: TextDataFieldProps) {
  const editable = kind !== 'computed' && onChange && !readOnly;
  const isMissing = missing ?? (editable && kind === 'pulled' && isBlankText(value));
  const hideSourceBadge = useHideFieldSourceBadge(kind, source, overridden) && !isMissing;
  const displayValue = value === NOT_IN_REGRID ? '' : value;

  return (
    <Stack gap={4}>
      <Group gap="xs" justify="space-between">
        <Text size="sm" fw={500}>
          {label}
        </Text>
        {!hideSourceBadge && (
          <SourceBadge kind={kind} source={source} overridden={overridden} missing={isMissing} />
        )}
      </Group>
      {description && (
        <Text size="xs" c="dimmed">
          {description}
        </Text>
      )}
      {rating && <RatingIndicator rating={rating} />}
      <TextInput
        value={displayValue}
        placeholder={isMissing ? MISSING_PLACEHOLDER : placeholder}
        onChange={(e) => onChange?.(e.currentTarget.value)}
        readOnly={!editable}
        variant={editable ? 'default' : 'filled'}
        styles={isMissing ? MISSING_INPUT_STYLES : undefined}
      />
    </Stack>
  );
}

export function NumberDataField({
  label,
  kind,
  source,
  overridden,
  description,
  value,
  onChange,
  readOnly,
  prefix,
  suffix,
  decimalScale = 0,
  onResetToDefault,
  missing,
}: NumberDataFieldProps) {
  const editable = kind !== 'computed' && onChange && !readOnly;
  const isMissing = missing ?? (editable && kind === 'pulled' && (value === undefined || Number.isNaN(value)));
  const hideSourceBadge = useHideFieldSourceBadge(kind, source, overridden) && !isMissing;

  return (
    <Stack gap={4}>
      <Group gap="xs" justify="space-between">
        <Text size="sm" fw={500}>
          {label}
        </Text>
        {!hideSourceBadge && (
          <SourceBadge kind={kind} source={source} overridden={overridden} missing={isMissing} />
        )}
      </Group>
      {description && (
        <Text size="xs" c="dimmed">
          {description}
        </Text>
      )}
      <Group gap={4} wrap="nowrap" align="flex-end">
        <NumberInput
          value={value}
          placeholder={isMissing ? MISSING_PLACEHOLDER : undefined}
          onChange={(v) => typeof v === 'number' && onChange?.(v)}
          readOnly={!editable}
          variant={editable ? 'default' : 'filled'}
          prefix={prefix}
          suffix={suffix}
          decimalScale={decimalScale}
          fixedDecimalScale={decimalScale > 0 && value !== undefined}
          thousandSeparator=","
          hideControls
          style={{ flex: 1 }}
          styles={isMissing ? MISSING_INPUT_STYLES : undefined}
        />
        {onResetToDefault && (
          <Tooltip label="Return to default" withArrow disabled={!overridden}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              disabled={!overridden}
              aria-label="Return to default"
              onClick={onResetToDefault}
              mb={2}
            >
              <IconArrowBackUp size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Stack>
  );
}
