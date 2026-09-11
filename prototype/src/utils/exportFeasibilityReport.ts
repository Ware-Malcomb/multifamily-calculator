/** Prints the shared FeasibilityReportDocument (same output from Costs and Summary). */
export function exportFeasibilityReport() {
  const report = document.getElementById('feasibility-report-document');
  if (!report) return;
  window.print();
}
