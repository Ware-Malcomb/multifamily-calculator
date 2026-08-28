import { Box, Group, Text, Tooltip } from '@mantine/core';
import { IconAlertTriangle, IconInfoCircle, IconShieldCheck } from '@tabler/icons-react';
import type { RatingSpec } from '../../utils/ratings';
import { ratingSeverity } from '../../utils/ratings';

interface RatingIndicatorProps {
  rating: RatingSpec;
}

function RatingIcon({ rating }: RatingIndicatorProps) {
  const severity = ratingSeverity(rating);
  const color = rating.color!;
  const size = 16;
  const stroke = 1.75;

  if (severity === 'low') {
    return <IconShieldCheck size={size} stroke={stroke} color={color} />;
  }
  if (severity === 'moderate') {
    return <IconInfoCircle size={size} stroke={stroke} color={color} />;
  }
  return <IconAlertTriangle size={size} stroke={stroke} color={color} />;
}

export function RatingIndicator({ rating }: RatingIndicatorProps) {
  const max = rating.maxLevel ?? 5;
  const color = rating.color!;

  return (
    <Tooltip label={rating.label} withArrow position="top-start">
      <Group gap="xs" wrap="nowrap" mt={4} aria-label={rating.label}>
        <RatingIcon rating={rating} />
        <Group gap={4} wrap="nowrap">
          {Array.from({ length: max }, (_, i) => {
            const filled = i < rating.level;
            return (
              <Box
                key={i}
                w={filled ? 10 : 8}
                h={filled ? 6 : 5}
                style={{
                  borderRadius: 999,
                  backgroundColor: filled ? color : 'var(--mantine-color-gray-3)',
                  opacity: filled ? 1 : 0.55,
                  transition: 'width 150ms ease, height 150ms ease',
                }}
              />
            );
          })}
        </Group>
        <Text size="xs" c={color} fw={600} style={{ lineHeight: 1.2 }}>
          {rating.label}
        </Text>
      </Group>
    </Tooltip>
  );
}
