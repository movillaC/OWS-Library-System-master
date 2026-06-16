import { getState, initStore } from "../state/store.js";
import { escapeHtml } from "../utils/html.js";

const tableBody = document.getElementById("printBookTableBody");

document.getElementById("generatedDate").textContent = `Generated ${new Date().toLocaleString()}`;

document.getElementById("printPage").addEventListener("click", () => {
  window.print();
});

// Read filters/sort from URL query params passed by bookList.js
const params = new URLSearchParams(window.location.search);
const printState = {
  search: params.get("search") || "",
  category: params.get("category") || "",
  location: params.get("location") || "",
  arrangement: params.get("arrangement") || "date",
};

async function init() {
  tableBody.innerHTML = `<tr><td colspan="10" class="empty-table">Loading books...</td></tr>`;
  await initStore();

  const books = getFilteredBooks();

  if (books.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="10" class="empty-table">No books found.</td></tr>`;
  } else {
    tableBody.innerHTML = books.map(renderPrintRow).join("");
  }
}

init();

function getFilteredBooks() {
  const books = [...getState().books].filter((book) => {
    const searchTarget = `${book.title || ""} ${book.callNumber || ""}`.toLowerCase();
    const matchesSearch = !printState.search || searchTarget.includes(printState.search);
    const matchesCategory = !printState.category || book.category === printState.category;
    const matchesLocation = !printState.location || book.location === printState.location;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return sortBooks(books);
}

function sortBooks(books) {
  const sorted = [...books];

  if (printState.arrangement === "alpha") {
    return sorted.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
  }
  if (printState.arrangement === "oldest") {
    return sorted.sort((a, b) => getPublicationYear(a) - getPublicationYear(b));
  }
  if (printState.arrangement === "newest") {
    return sorted.sort((a, b) => getPublicationYear(b) - getPublicationYear(a));
  }

  // Default: "date" — sort by latest record date
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