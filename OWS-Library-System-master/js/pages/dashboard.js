import { renderAppLayout } from "../components/layout.js";
import { renderDashboardCharts } from "../components/charts.js";
import { getState, initStore, subscribe } from "../state/store.js";

await initStore();

renderAppLayout({
  activePage: "dashboard",
  content: `
    <header class="page-header">
      <div>
        <h2>Dashboard</h2>
        <p>Live overview of library records.</p>
      </div>
    </header>

    <section class="stats-grid" aria-label="Library totals">
      <article class="stat-card">
        <p class="stat-label">Total Books</p>
        <p id="totalBooks" class="stat-value">0</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">Total Borrow Records</p>
        <p id="totalBorrowRecords" class="stat-value">0</p>
      </article>
    </section>

    <section class="dashboard-grid" aria-label="Dashboard charts">
      <article class="chart-card">
        <h3>Books By Location</h3>
        <div class="chart-frame"><canvas id="locationChart"></canvas></div>
      </article>
      <article class="chart-card">
        <h3>Books By Category</h3>
        <div class="chart-frame"><canvas id="categoryChart"></canvas></div>
      </article>
      <article class="chart-card is-wide">
        <h3 id="timelineHeading">Newly Added Books Over Time</h3>
        <div class="chart-frame"><canvas id="timelineChart"></canvas></div>
      </article>
    </section>
  `
});

function renderDashboard() {
  const { books, dashboardStats } = getState();

  document.getElementById("totalBooks").textContent = String(dashboardStats.totalBooks);
  document.getElementById("totalBorrowRecords").textContent = String(dashboardStats.totalBorrowRecords);
  document.getElementById("timelineHeading").textContent = `Newly Added Books Over Time (${dashboardStats.currentYear})`;

  renderDashboardCharts({
    ...dashboardStats,
    totalBooks: books.length
  });
}

subscribe(renderDashboard);
renderDashboard();
