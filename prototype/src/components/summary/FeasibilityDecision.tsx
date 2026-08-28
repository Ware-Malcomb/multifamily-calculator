import { Text } from '@mantine/core';
import type { CSSProperties } from 'react';
import { palette } from '../../theme/palette';

interface FeasibilityDecisionProps {
  isGo: boolean;
  variant?: 'compact' | 'badge';
}

export function FeasibilityDecision({ isGo, variant = 'compact' }: FeasibilityDecisionProps) {
  const color = isGo ? palette.lemonLimeContrast : palette.lobsterPink;
  const label = isGo ? 'GO' : 'NO-GO';
  const detail = isGo ? 'Above hurdle' : 'Below hurdle';

  if (variant === 'badge') {
    return (
      <span
        className={`feasibility-decision feasibility-decision--badge feasibility-decision--${isGo ? 'go' : 'no-go'}`}
        style={{ '--feasibility-decision-color': color } as CSSProperties}
      >
        <span className="feasibility-decision__label">{label}</span>
        <span className="feasibility-decision__detail">{detail}</span>
      </span>
    );
  }

  return (
    <Text
      size="sm"
      fw={700}
      className="feasibility-decision feasibility-decision--compact"
      style={{ color }}
    >
      {label} — {detail.toLowerCase()}
    </Text>
  );
}
