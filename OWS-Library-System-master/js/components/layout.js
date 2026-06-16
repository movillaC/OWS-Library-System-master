import { renderNotifications } from "./notifications.js";
import { renderAdminDropdown } from "./profileMenu.js";

const navItems = [
  { id: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "home.png" },
  { id: "add-book", label: "Add New Book", href: "add-book.html", icon: "book-plus.png" },
  { id: "lending", label: "Book Lending", href: "lending.html", icon: "book-open-cover.png" },
  { id: "book-list", label: "Book List", href: "book-list.html", icon: "list.png" }
];

const printPages = {
  dashboard: "dashboard-print.html",
  "book-list": "book-list-print.html"
};

export function renderAppLayout({ activePage, content }) {
  const layoutRoot = document.getElementById("appLayout");
  layoutRoot.innerHTML = `
    ${renderSidebar(activePage)}
    <section class="main-shell">
      <header class="topbar">
        <h1 class="topbar-title">OWS, Inc Library System</h1>
        <div class="topbar-actions">
          ${printPages[activePage] ? `
            <a class="utility-button" href="${printPages[activePage]}" aria-label="Open print preview">
              <img src="../assets/print.png" alt="" class="utility-icon">
            </a>
          ` : ""}
          <div id="notificationMount"></div>
          <div id="profileMount"></div>
        </div>
      </header>
      <main class="page-content">${content}</main>
    </section>
  `;

  renderNotifications(document.getElementById("notificationMount"));
  renderAdminDropdown(document.getElementById("profileMount"));
}

function renderSidebar(activePage) {
  return `
    <aside class="sidebar" aria-label="Primary navigation">
      <div class="sidebar-brand">
        <div class="sidebar-seal-wrap">
          <img src="../assets/logo_192 (2).png" alt="Olongapo Wesley School Seal">
        </div>
        <p class="sidebar-title">Olongapo Wesley<br>School, Inc.</p>
      </div>
      <nav class="side-nav">
        ${navItems.map((item) => `
          <a class="nav-link ${activePage === item.id ? "is-active" : ""}" href="${item.href}" aria-current="${activePage === item.id ? "page" : "false"}">
            <img src="../assets/${item.icon}" alt="" class="nav-icon">
            <span>${item.label}</span>
          </a>
        `).join("")}
      </nav>
    </aside>
  `;
}
