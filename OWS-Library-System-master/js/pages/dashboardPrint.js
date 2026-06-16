import { renderDashboardCharts } from "../components/charts.js";
import { getState, initStore } from "../state/store.js";

await initStore();

const { dashboardStats } = getState();

document.getElementById("generatedDate").textContent = `Generated ${new Date().toLocaleString()}`;
document.getElementById("printTotalBooks").textContent = String(dashboardStats.totalBooks);
document.getElementById("printTimelineHeading").textContent = `Newly Added Books Over Time (${dashboardStats.currentYear})`;

renderDashboardCharts(dashboardStats);

document.getElementById("printPage").addEventListener("click", () => {
  window.print();
});
