import { Button, Group } from '@mantine/core';

interface StepNextButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

export function StepNextButton({ onClick, label = 'Next →', disabled }: StepNextButtonProps) {
  return (
    <Group justify="flex-end">
      <Button variant="light" onClick={onClick} disabled={disabled}>
        {label}
      </Button>
    </Group>
  );
}
