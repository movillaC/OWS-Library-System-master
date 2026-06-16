import { getState, initStore } from "../state/store.js";
import { escapeHtml } from "../utils/html.js";

const tableBody = document.getElementById("printBookTableBody");
const generatedDateEl = document.getElementById("generatedDate");
const reportTitleEl = document.getElementById("reportTitle");
const filterSummaryEl = document.getElementById("filterSummary");

const params = new URLSearchParams(window.location.search);
const filterSearch      = params.get("search")      || "";
const filterCategory    = params.get("category")    || "";
const filterLocation    = params.get("location")    || "";
const filterArrangement = params.get("arrangement") || "date";

generatedDateEl.textContent = Generated ${new Date().toLocaleString()};

document.getElementById("printPage").addEventListener("click", () => {
  window.print();
});

async function init() {
  tableBody.innerHTML = <tr><td colspan="10" class="empty-table">Loading books...</td></tr>;
  await initStore();

  const filtered = getFilteredBooks(getState().books);

  // Build report title & filter summary
  if (filterSearch || filterCategory || filterLocation || filterArrangement !== "date") {
    const parts = [];
    if (filterSearch)   parts.push(Search: "${filterSearch}");
    if (filterCategory) parts.push(Category: ${filterCategory});
    if (filterLocation) parts.push(Location: ${filterLocation});

    const arrangementLabels = {
      date:   "Date Added",
      newest: "Newest to Oldest",
      oldest: "Oldest to Newest",
      alpha:  "Alphabetical"
    };
    parts.push(Sorted by: ${arrangementLabels[filterArrangement] || filterArrangement});

    reportTitleEl.textContent = "Filtered Book List Report";
    filterSummaryEl.textContent = parts.join(" · ");
    filterSummaryEl.hidden = false;
  }

  if (filtered.length === 0) {
    tableBody.innerHTML = <tr><td colspan="10" class="empty-table">No books match the selected filters.</td></tr>;
  } else {
    tableBody.innerHTML = filtered.map(renderPrintRow).join("");
  }
}

init();

function getFilteredBooks(books) {
  const searchLower = filterSearch.toLowerCase();

  const filtered = books.filter((book) => {
    const searchTarget = ${book.title || ""} ${book.callNumber || ""}.toLowerCase();
    const matchesSearch   = !searchLower   || searchTarget.includes(searchLower);
    const matchesCategory = !filterCategory || book.category === filterCategory;
    const matchesLocation = !filterLocation || book.location === filterLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return sortBooks(filtered);
}

function sortBooks(books) {
  const sorted = [...books];

  if (filterArrangement === "alpha") {
    return sorted.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
  }
  if (filterArrangement === "oldest") {
    return sorted.sort((a, b) => getPublicationYear(a) - getPublicationYear(b));
  }
  if (filterArrangement === "newest") {
    return sorted.sort((a, b) => getPublicationYear(b) - getPublicationYear(a));
  }
  // default: "date" — sort by latest record date
  return sorted.sort((a, b) => getLatestRecordDate(b) - getLatestRecordDate(a));
}

function renderPrintRow(book) {
  return `
    <tr>
      <td>${display(book.title)}</td>
      <td>${display(book.responsibility)}</td>
      <td>${display(book.publisher)}</td>
      <td>${display(book.publicationDate)}</td>
      <td>${display(book.callNumber)}</td>
      <td>${display(book.isbn)}</td>
      <td>${display(book.location)}</td>
      <td>${display(book.category)}</td>
      <td>${display(book.onShelf)}</td>
      <td>${display(book.editedAt || book.addedAt)}</td>
    </tr>
  `;
}

function display(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  return escapeHtml(value);
}

function getPublicationYear(book) {
  const rawYear = String(book.publicationDate || "").slice(0, 4);
  const year = Number(rawYear);
  return Number.isFinite(year) ? year : 0;
}

function getLatestRecordDate(book) {
  const date = new Date(book.editedAt || book.addedAt || 0);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}