import { createPortal } from 'react-dom';
import { useCalculator } from '../../hooks/useCalculatorContext';
import { SiteMapPreview } from '../steps/SiteMapPreview';
import { FeasibilityDecision } from './FeasibilityDecision';
import { FeasibilitySummaryContent } from './FeasibilitySummaryContent';

export function FeasibilityReportDocument() {
  const { state, feasibility, blended } = useCalculator();
  const { site, rentHurdlePerSf } = state;

  if (!site || !feasibility) return null;

  const generated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const hurdleSet = rentHurdlePerSf !== null && rentHurdlePerSf > 0;

  return createPortal(
    <div className="feasibility-report-print">
      <div className="feasibility-report-hero">
        <SiteMapPreview site={site} variant="report" />
      </div>

      <div className="feasibility-report-body">
        <header className="feasibility-report-header">
          <div className="feasibility-report-header__main">
            <div className="feasibility-report-address">{site.address}</div>
            <div className="feasibility-report-site-meta">
              {site.acreage} ac · {site.zoning} · {site.landUse}
            </div>
          </div>
          {hurdleSet && (
            <FeasibilityDecision
              isGo={blended.avgRentPerSf >= rentHurdlePerSf}
              variant="badge"
            />
          )}
        </header>

        <FeasibilitySummaryContent layout="print" hideDecision />
      </div>

      <footer className="feasibility-report-footer">
        <div className="feasibility-report-footer__copy">
          <div className="feasibility-report-footer__title">Feasibility Report</div>
          <div className="feasibility-report-footer__meta">
            Ware Malcomb · {generated} · {site.address}
          </div>
        </div>
        <img
          className="feasibility-report-footer__logo"
          src="/brand/wm-logo.png"
          alt="Ware Malcomb"
        />
      </footer>
    </div>,
    document.body,
  );
}
