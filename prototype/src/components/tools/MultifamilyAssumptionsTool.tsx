import { Box } from '@mantine/core';
import { useEffect } from 'react';
import { AppLayout } from '../layout/AppLayout';
import { FeasibilityReportDocument } from '../summary/FeasibilityReportDocument';
import { CompsStep } from '../steps/CompsStep';
import { CostsStep } from '../steps/CostsStep';
import { ProgramStep } from '../steps/ProgramStep';
import { SiteStep } from '../steps/SiteStep';
import { CalculatorProvider, useCalculator } from '../../hooks/useCalculatorContext';

function scrollStepToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const main = document.querySelector('.mantine-AppShell-main');
  if (main instanceof HTMLElement) {
    main.scrollTop = 0;
  }
}

function StepContent() {
  const { state } = useCalculator();

  useEffect(() => {
    scrollStepToTop();
  }, [state.activeStep]);

  switch (state.activeStep) {
    case 'site':
      return <SiteStep />;
    case 'comps':
      return <CompsStep />;
    case 'program':
      return <ProgramStep />;
    case 'costs':
      return <CostsStep />;
  }
}

export function MultifamilyAssumptionsTool() {
  return (
    <CalculatorProvider>
      <Box className="tool-root no-print">
        <AppLayout>
          <StepContent />
        </AppLayout>
      </Box>
      <FeasibilityReportDocument />
    </CalculatorProvider>
  );
}
