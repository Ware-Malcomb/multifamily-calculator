import { Button, Group } from '@mantine/core';
import { IconFileExport } from '@tabler/icons-react';
import { semanticColors } from '../../theme/palette';

interface StepExportButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

export function StepExportButton({
  onClick,
  label = 'Export feasibility report',
  disabled,
}: StepExportButtonProps) {
  return (
    <Group justify="flex-end">
      <Button
        variant="light"
        color={semanticColors.pulled}
        leftSection={<IconFileExport size={16} />}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </Button>
    </Group>
  );
}
