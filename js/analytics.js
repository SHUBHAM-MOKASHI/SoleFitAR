/**
 * SoleFit Retailer ROI & Analytics Dashboard
 * Visualizes return rate reductions, conversion lifts, and try-on session stats using SVG charts.
 */

class AnalyticsDashboard {
  constructor() {
    this.stats = {
      returnsReduction: 34.2,
      conversionLift: 24.8,
      tryOnSessions: 14820,
      sizeAccuracy: 97.4
    };
  }

  /**
   * Initializes interactive SVG analytics charts
   */
  initCharts() {
    this.renderConversionChart('conversionChartCanvas');
    this.renderSizeDistributionChart('sizeDistributionCanvas');
  }

  /**
   * Renders SVG Line Chart showing return rate reduction over time
   */
  renderConversionChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const dataBefore = [32, 31, 33, 30, 32, 34, 33];
    const dataAfter = [32, 26, 22, 19, 17, 16, 15];
    const labels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7'];

    const svgWidth = 600;
    const svgHeight = 240;

    let pointsBefore = dataBefore.map((val, i) => {
      const x = (i / (labels.length - 1)) * (svgWidth - 60) + 40;
      const y = svgHeight - (val / 40) * (svgHeight - 60) - 30;
      return `${x},${y}`;
    }).join(' ');

    let pointsAfter = dataAfter.map((val, i) => {
      const x = (i / (labels.length - 1)) * (svgWidth - 60) + 40;
      const y = svgHeight - (val / 40) * (svgHeight - 60) - 30;
      return `${x},${y}`;
    }).join(' ');

    container.innerHTML = `
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%;">
        <!-- Grid Lines -->
        <line x1="40" y1="40" x2="${svgWidth-20}" y2="40" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
        <line x1="40" y1="100" x2="${svgWidth-20}" y2="100" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
        <line x1="40" y1="160" x2="${svgWidth-20}" y2="160" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
        
        <!-- Y Axis Labels -->
        <text x="10" y="45" fill="#64748b" font-size="11">35%</text>
        <text x="10" y="105" fill="#64748b" font-size="11">25%</text>
        <text x="10" y="165" fill="#64748b" font-size="11">15%</text>

        <!-- Path Before SoleFit (Red line) -->
        <polyline fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="5,5" points="${pointsBefore}" />
        
        <!-- Path After SoleFit (Emerald Glow line) -->
        <polyline fill="none" stroke="#10b981" stroke-width="4" points="${pointsAfter}" filter="drop-shadow(0 0 8px rgba(16,185,129,0.4))" />

        <!-- Data points -->
        ${dataAfter.map((val, i) => {
          const x = (i / (labels.length - 1)) * (svgWidth - 60) + 40;
          const y = svgHeight - (val / 40) * (svgHeight - 60) - 30;
          return `<circle cx="${x}" cy="${y}" r="5" fill="#10b981" />`;
        }).join('')}
      </svg>
      <div style="display: flex; gap: 1.5rem; justify-content: center; font-size: 0.8rem; margin-top: 0.5rem; color: #94a3b8;">
        <span style="display: flex; align-items: center; gap: 0.4rem;">
          <span style="width: 12px; height: 3px; background: #ef4444; display: inline-block;"></span> Return Rate Before WebAR
        </span>
        <span style="display: flex; align-items: center; gap: 0.4rem;">
          <span style="width: 12px; height: 3px; background: #10b981; display: inline-block;"></span> Return Rate With SoleFit AR (-34.2%)
        </span>
      </div>
    `;
  }

  /**
   * Renders Bar Chart of Size Fit Distribution
   */
  renderSizeDistributionChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const sizes = [
      { size: 'US 7.5', pct: 12 },
      { size: 'US 8.5', pct: 24 },
      { size: 'US 9.5', pct: 38 },
      { size: 'US 10.5', pct: 18 },
      { size: 'US 11.5', pct: 8 }
    ];

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.85rem; padding-top: 0.5rem;">
        ${sizes.map(item => `
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #cbd5e1;">
              <span style="font-weight: 600;">${item.size}</span>
              <span style="color: #6366f1; font-weight: 700;">${item.pct}% of Try-Ons</span>
            </div>
            <div style="height: 8px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden;">
              <div style="width: ${item.pct}%; height: 100%; background: linear-gradient(90deg, #6366f1, #06b6d4); border-radius: 99px;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

window.AnalyticsDashboard = new AnalyticsDashboard();
