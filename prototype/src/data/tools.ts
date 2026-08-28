import {
  IconBuilding,
  IconBuildingCommunity,
  IconHome,
  IconReportMoney,
} from '@tabler/icons-react';
import type { TablerIcon } from '@tabler/icons-react';

export type ToolId = 'multifamily-assumptions' | 'office-feasibility' | 'industrial-feasibility' | 'retail-feasibility';

export interface SuiteTool {
  id: ToolId;
  name: string;
  description: string;
  practiceArea: string;
  icon: TablerIcon;
  status: 'active' | 'coming-soon';
}

export const SUITE_NAME = 'Practice Area Calculators';

export const SUITE_TOOLS: SuiteTool[] = [
  {
    id: 'multifamily-assumptions',
    name: 'Multifamily Assumptions Calculator',
    description: 'Site feasibility gut-check — comps, program, and cost collation.',
    practiceArea: 'Multifamily',
    icon: IconBuildingCommunity,
    status: 'active',
  },
  {
    id: 'office-feasibility',
    name: 'Office Feasibility Calculator',
    description: 'Office development assumptions and market read.',
    practiceArea: 'Office',
    icon: IconBuilding,
    status: 'coming-soon',
  },
  {
    id: 'industrial-feasibility',
    name: 'Industrial Feasibility Calculator',
    description: 'Industrial / logistics site and cost assumptions.',
    practiceArea: 'Industrial',
    icon: IconHome,
    status: 'coming-soon',
  },
  {
    id: 'retail-feasibility',
    name: 'Retail Feasibility Calculator',
    description: 'Retail pad and center feasibility modeling.',
    practiceArea: 'Retail',
    icon: IconReportMoney,
    status: 'coming-soon',
  },
];

export function getToolById(id: ToolId): SuiteTool | undefined {
  return SUITE_TOOLS.find((t) => t.id === id);
}
