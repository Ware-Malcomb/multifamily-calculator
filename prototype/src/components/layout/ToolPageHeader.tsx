import { Anchor, Group, Text, Title } from '@mantine/core';

export interface ToolPageHeaderProps {
  title: string;
  subtitle?: string;
  /** Extra space below the title block (e.g. before workflow timeline). */
  withBottomPadding?: boolean;
  /** Called when the logomark is activated (home / beginning). */
  onHomeClick?: () => void;
}

export function ToolPageHeader({
  title,
  subtitle = 'Powered by WM Digital Transformation',
  withBottomPadding = true,
  onHomeClick,
}: ToolPageHeaderProps) {
  return (
    <Group gap="sm" pb={withBottomPadding ? 'md' : 0}>
      <Anchor
        href="/"
        aria-label="Go to home"
        underline="never"
        c="inherit"
        display="flex"
        onClick={(e) => {
          if (!onHomeClick) return;
          e.preventDefault();
          onHomeClick();
        }}
      >
        <img
          className="development-tools-logo"
          src="/brand/development-tools-logo.png"
          alt=""
          aria-hidden="true"
        />
      </Anchor>
      <div>
        <Title order={3} className="logo-title logo-title--suite" py={4}>
          {title}
        </Title>
        <Text size="xs" c="dimmed">
          {subtitle}
        </Text>
      </div>
    </Group>
  );
}
