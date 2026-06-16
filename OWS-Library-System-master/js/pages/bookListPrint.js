import { getState, initStore } from "../state/store.js";
import { escapeHtml } from "../utils/html.js";

const tableBody = document.getElementById("printBookTableBody");

document.getElementById("generatedDate").textContent = `Generated ${new Date().toLocaleString()}`;

document.getElementById("printPage").addEventListener("click", () => {
  window.print();
});

async function init() {
  tableBody.innerHTML = `<tr><td colspan="10" class="empty-table">Loading books...</td></tr>`;
  await initStore();
  const books = getState().books;
  if (books.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="10" class="empty-table">No books found.</td></tr>`;
  } else {
    tableBody.innerHTML = books
      .sort((a, b) => getLatestRecordDate(b) - getLatestRecordDate(a))
      .map(renderPrintRow)
      .join("");
  }
}

init();

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

function getLatestRecordDate(book) {
  const date = new Date(book.editedAt || book.addedAt || 0);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}
