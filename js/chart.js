// ============================================================
// CHART — mini graphique en barres SVG, sans dépendance externe.
// Utilisé pour le graphique de revenus du tableau de bord.
// ============================================================

// series: [{ label, income, expense }, ...] (un point par mois)
export function renderMonthlyBarChart(series, { incomeLabel, expenseLabel } = {}) {
  const width = 320;
  const height = 160;
  const padBottom = 22;
  const padTop = 10;
  const chartHeight = height - padBottom - padTop;
  const maxVal = Math.max(1, ...series.map((s) => Math.max(s.income, s.expense)));
  const groupWidth = width / series.length;
  const barWidth = Math.min(16, groupWidth / 3.2);

  const bars = series.map((s, i) => {
    const groupX = i * groupWidth + groupWidth / 2;
    const incomeH = (s.income / maxVal) * chartHeight;
    const expenseH = (s.expense / maxVal) * chartHeight;
    const incomeX = groupX - barWidth - 2;
    const expenseX = groupX + 2;
    return `
      <rect x="${incomeX}" y="${padTop + chartHeight - incomeH}" width="${barWidth}" height="${Math.max(1, incomeH)}" rx="3" fill="var(--success)"></rect>
      <rect x="${expenseX}" y="${padTop + chartHeight - expenseH}" width="${barWidth}" height="${Math.max(1, expenseH)}" rx="3" fill="var(--danger)"></rect>
      <text x="${groupX}" y="${height - 4}" text-anchor="middle" font-size="9" fill="var(--text-muted)">${s.label}</text>
    `;
  }).join("");

  return `
    <div class="chart-wrap">
      <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:auto; max-width:400px;">
        <line x1="0" y1="${padTop + chartHeight}" x2="${width}" y2="${padTop + chartHeight}" stroke="var(--border)" stroke-width="1"></line>
        ${bars}
      </svg>
      <div class="chart-legend">
        <span><i style="background:var(--success)"></i>${incomeLabel || "Entrées"}</span>
        <span><i style="background:var(--danger)"></i>${expenseLabel || "Sorties"}</span>
      </div>
    </div>
  `;
}
