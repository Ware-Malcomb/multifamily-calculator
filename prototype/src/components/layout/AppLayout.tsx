import { Box } from '@mantine/core';
import type { ReactNode } from 'react';
import { FeasibilityAside } from './FeasibilityAside';
import { WorkflowTimeline } from '../workflow/WorkflowTimeline';

interface AppLayoutProps {
  children: ReactNode;
  showWorkflow?: boolean;
  showFeasibility?: boolean;
  className?: string;
}

export function AppLayout({
  children,
  showWorkflow = true,
  showFeasibility = true,
  className,
}: AppLayoutProps) {
  return (
    <Box className={['tool-layout', className].filter(Boolean).join(' ')}>
      <Box className="tool-main">
        <Box className="tool-main-content">
          {showWorkflow ? (
            <Box pt="lg" pb="lg">
              <WorkflowTimeline />
            </Box>
          ) : (
            <Box pt="lg" />
          )}
          {children}
        </Box>
      </Box>

      {showFeasibility && <FeasibilityAside />}
    </Box>
  );
}
