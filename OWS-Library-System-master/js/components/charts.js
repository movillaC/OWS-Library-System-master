const chartInstances = new Map();

export const locationColors = {
  "OWS Elem": "#0055ff",
  "Learning Resource Center": "#12b981",
  "All Libraries": "#f59e0b"
};

export const categoryColors = {
  "C000 - Generalities": "#39FF14",
  "C100 - Philosophy/Psychology": "#ff498c",
  "C200 - Religion": "#ffa34c",
  "C300 - Social Sciences": "#1D55A8",
  "C400 - Language": "#E2FF03",
  "C500 - Natural Sciences": "#F25D1D",
  "C600 - Technology": "#EBA307",
  "C700 - Art": "#D5DDE0",
  "C800 - Literature": "#800000",
  "C900 - Geography History": "#502A57",
  "Filipiniana": "#000000",
  "Fiction": "#18dcff"
};

const valueLabelPlugin = {
  id: "valueLabelPlugin",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const dataset = chart.data.datasets[0];
    const total = dataset.data.reduce((sum, value) => sum + Number(value || 0), 0);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    chart.getDatasetMeta(0).data.forEach((element, index) => {
      const value = Number(dataset.data[index] || 0);
      if (!value || !total) return;

      const percentage = Math.round((value / total) * 100);
      const label = chart.data.labels[index];
      const lines = chart.config.type === "pie"
        ? getPieLabelLines(label, value, percentage)
        : [`${value} Books`, `${percentage}%`];
      if (lines.length === 0) return;

      const position = chart.config.type === "pie"
        ? element.tooltipPosition()
        : { x: element.x, y: element.y - 18 };
      const fontSize = chart.config.type === "pie" ? getPieFontSize(percentage) : 12;
      const lineHeight = fontSize + 2;

      ctx.font = `700 ${fontSize}px Segoe UI, Arial, sans-serif`;
      ctx.fillStyle = chart.config.type === "pie" ? "#111827" : "#1f2937";
      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, position.x, position.y + ((lineIndex - (lines.length - 1) / 2) * lineHeight));
      });
    });

    ctx.restore();
  }
};

export function renderDashboardCharts(stats) {
  renderPieChart("locationChart", "Books By Location", stats.byLocation);
  renderBarChart("categoryChart", "Books By Category", stats.byCategory);
  renderLineChart("timelineChart", `Newly Added Books - ${stats.currentYear}`, stats.addedOverTime);
}

function renderPieChart(canvasId, label, dataMap) {
  const entries = Object.entries(dataMap).filter(([, value]) => value > 0);
  const labels = entries.map(([name]) => name);
  const values = entries.map(([, value]) => value);
  const colors = labels.map((name) => locationColors[name] || "#64748b");

  createChart(canvasId, {
    type: "pie",
    data: {
      labels,
      datasets: [{ label, data: values, backgroundColor: colors }]
    },
    options: {
      ...baseOptions(false),
      layout: { padding: 18 }
    },
    plugins: [valueLabelPlugin]
  });

  renderLegend(canvasId, labels, colors);
}

function renderBarChart(canvasId, label, dataMap) {
  const entries = Object.entries(dataMap).filter(([, value]) => value > 0);
  const labels = entries.map(([name]) => name);
  const values = entries.map(([, value]) => value);
  const colors = labels.map((name) => categoryColors[name] || getPersistentColor(name));

  createChart(canvasId, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        backgroundColor: colors,
        borderRadius: 8
      }]
    },
    options: {
      ...baseOptions(false),
      layout: { padding: { top: 28, right: 8, bottom: 4, left: 8 } },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: getSuggestedMax(values),
          ticks: { precision: 0, stepSize: 5 }
        },
        x: { ticks: { display: false } }
      }
    },
    plugins: [valueLabelPlugin]
  });

  renderLegend(canvasId, labels, colors);
}

function renderLineChart(canvasId, label, dataMap) {
  const labels = Object.keys(dataMap);
  const values = labels.map((month) => dataMap[month]);

  createChart(canvasId, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        borderColor: "#0055ff",
        backgroundColor: "rgba(0, 85, 255, 0.12)",
        fill: true,
        tension: 0.36
      }]
    },
    options: {
      ...baseOptions(true),
      layout: { padding: { top: 12, right: 16, bottom: 4, left: 8 } },
      plugins: {
        legend: {
          display: false,
          position: "top"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: getSuggestedMax(values),
          ticks: { precision: 0, stepSize: 5 }
        }
      }
    }
  });
}

function getSuggestedMax(values) {
  const highestValue = Math.max(0, ...values.map((value) => Number(value || 0)));
  return Math.max(5, Math.ceil((highestValue + 1) / 5) * 5);
}

function getPieLabelLines(label, value, percentage) {
  if (percentage < 7) {
    return [`${percentage}%`];
  }

  const nameLines = label === "Learning Resource Center"
    ? ["Learning", "Resource", "Center"]
    : [label];

  if (percentage < 15) {
    return [`${value} Books`, `${percentage}%`];
  }

  return [...nameLines, `${value} Books`, `${percentage}%`];
}

function getPieFontSize(percentage) {
  if (percentage < 10) return 10;
  if (percentage < 20) return 11;
  return 12;
}

function createChart(canvasId, config) {
  const existingChart = chartInstances.get(canvasId);
  if (existingChart) {
    existingChart.destroy();
  }

  const chart = new Chart(document.getElementById(canvasId), config);
  chartInstances.set(canvasId, chart);
  return chart;
}

function renderLegend(canvasId, labels, colors) {
  const canvas = document.getElementById(canvasId);
  const frame = canvas.closest(".chart-frame");
  const oldLegend = frame.parentElement.querySelector(`[data-chart-legend="${canvasId}"]`);
  if (oldLegend) {
    oldLegend.remove();
  }

  const legend = document.createElement("div");
  legend.className = "chart-legend-list";
  legend.dataset.chartLegend = canvasId;
  labels.forEach((label, index) => {
    const item = document.createElement("div");
    const swatch = document.createElement("span");
    const text = document.createElement("span");

    item.className = "chart-legend-item";
    swatch.className = "chart-legend-swatch";
    swatch.style.backgroundColor = colors[index];
    text.textContent = label;

    item.append(swatch, text);
    legend.append(item);
  });

  frame.insertAdjacentElement("afterend", legend);
}

function baseOptions(showLegend) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 850,
      easing: "easeOutQuart"
    },
    plugins: {
      legend: {
        display: showLegend,
        position: "bottom",
        labels: { boxWidth: 12, boxHeight: 12 }
      }
    }
  };
}

function getPersistentColor(name) {
  const key = `ows.color.${name}`;
  const existingColor = window.localStorage.getItem(key);
  if (existingColor) {
    return existingColor;
  }

  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  const color = `hsl(${hue}, 76%, 44%)`;
  window.localStorage.setItem(key, color);
  return color;
}
