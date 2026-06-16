import { renderAppLayout } from "../components/layout.js";
import { openModal } from "../components/modal.js";
import { addBorrowRecord, deleteBorrowRecord, getState, subscribe, updateBorrowStatus } from "../state/store.js";
import { escapeHtml } from "../utils/html.js";
import { initStore } from "../state/store.js";
await initStore();

const statuses = ["Borrowed", "Returned", "For Replacement"];
const pageState = {
  search: "",
  filter: "",
  selectedBooks: new Map()
};

renderAppLayout({
  activePage: "lending",
  content: `
    <header class="page-header">
      <div>
        <h2>Book Lending</h2>
        <p>Manage borrowed books with searchable, status-ready mock records.</p>
      </div>
    </header>

    <section class="toolbar" aria-label="Lending tools">
      <label class="search-box">
        <span class="sr-only">Search lending records</span>
        <input id="lendingSearch" type="search" placeholder="Search borrower, section, or book...">
      </label>
      <label class="filter-box">
        <span class="sr-only">Filter status</span>
        <select id="statusFilter">
          <option value="">All Status</option>
          ${statuses.map((status) => `<option value="${status}">${status}</option>`).join("")}
        </select>
      </label>
      <button id="openBorrowModal" class="primary-button toolbar-button" type="button">Add</button>
    </section>

    <section class="table-card" aria-label="Borrow records">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Borrower Name</th>
              <th>Student Info</th>
              <th>Books Borrowed</th>
              <th>Call Numbers</th>
              <th>Quantity</th>
              <th>Date Borrowed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="borrowTableBody"></tbody>
        </table>
      </div>
    </section>
  `
});

const searchInput = document.getElementById("lendingSearch");
const filterSelect = document.getElementById("statusFilter");
const tableBody = document.getElementById("borrowTableBody");

searchInput.addEventListener("input", debounce((event) => {
  pageState.search = event.target.value.trim().toLowerCase();
  renderBorrowTable();
}, 180));

filterSelect.addEventListener("change", (event) => {
  pageState.filter = event.target.value;
  renderBorrowTable();
});

document.getElementById("openBorrowModal").addEventListener("click", openBorrowModal);

tableBody.addEventListener("change", (event) => {
  const statusSelect = event.target.closest("[data-status-select]");
  if (!statusSelect) {
    return;
  }

  updateBorrowStatus(statusSelect.dataset.recordId, statusSelect.value);
});

tableBody.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-record]");
  if (!deleteButton) {
    return;
  }

  deleteBorrowRecord(deleteButton.dataset.recordId);
});

subscribe(renderBorrowTable);
renderBorrowTable();

function renderBorrowTable() {
  const records = getFilteredRecords();

  tableBody.innerHTML = records.length
    ? records.map(renderBorrowRow).join("")
    : `<tr><td colspan="8" class="empty-table">No lending records found.</td></tr>`;
}

function getFilteredRecords() {
  return getState().borrowRecords.filter((record) => {
    const searchableText = [
      record.borrowerName,
      record.studentInfo,
      record.dateBorrowed,
      record.status,
      ...record.books.flatMap((book) => [book.title, book.callNumber])
    ].join(" ").toLowerCase();

    const matchesSearch = !pageState.search || searchableText.includes(pageState.search);
    const matchesFilter = !pageState.filter || normalizeStatus(record.status) === pageState.filter;
    return matchesSearch && matchesFilter;
  });
}

function renderBorrowRow(record) {
  const totalQuantity = record.books.reduce((total, book) => total + book.quantity, 0);
  const status = normalizeStatus(record.status);

  return `
    <tr>
      <td><strong>${escapeHtml(record.borrowerName)}</strong></td>
      <td>${escapeHtml(record.studentInfo)}</td>
      <td>${record.books.map((book) => `${escapeHtml(book.title)} (${book.quantity})`).join("<br>")}</td>
      <td>${record.books.map((book) => escapeHtml(book.callNumber || "Unassigned")).join("<br>")}</td>
      <td>${totalQuantity}</td>
      <td>${escapeHtml(record.dateBorrowed)}</td>
      <td>
        <select class="status-select ${getStatusClass(status)}" data-status-select data-record-id="${escapeHtml(record.id)}" aria-label="Update status for ${escapeHtml(record.borrowerName)}">
          ${statuses.map((option) => `<option value="${option}" ${status === option ? "selected" : ""}>${option}</option>`).join("")}
        </select>
      </td>
      <td>
        <button class="delete-button" type="button" data-delete-record data-record-id="${escapeHtml(record.id)}" aria-label="Delete ${escapeHtml(record.borrowerName)} record">x</button>
      </td>
    </tr>
  `;
}

function getStatusClass(status) {
  return `status-${String(status || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function normalizeStatus(status) {
  return status === "Still Borrowed" ? "Borrowed" : status;
}

function openBorrowModal() {
  pageState.selectedBooks = new Map();

  const modal = openModal({
    title: "Add Borrow Record",
    size: "large",
    content: `
      <form id="borrowForm" class="data-form modal-form">
        <div class="form-grid">
          ${renderField("Borrower Name", "borrowerName", "text", true)}
          ${renderField("Grade & Section", "studentInfo", "text", true)}
          ${renderField("Date Borrowed", "dateBorrowed", "date", true)}
          ${renderField("Lend By", "lendBy", "text", true)}
        </div>

        <div class="field-group">
          <label>Books Borrowed</label>
          <button id="openBookSelection" class="secondary-button" type="button">Select Books Borrowed</button>
          <div id="selectedBooksDisplay" class="chip-list" aria-live="polite"></div>
        </div>

        <div class="modal-actions">
          <button class="secondary-button" type="button" data-modal-close>Cancel</button>
          <button class="primary-button modal-submit" type="submit">Add Borrow</button>
        </div>
      </form>
    `
  });

  const borrowForm = modal.root.querySelector("#borrowForm");
  const selectedBooksDisplay = modal.root.querySelector("#selectedBooksDisplay");

  modal.root.querySelector("#openBookSelection").addEventListener("click", () => {
    openBookSelectionModal(selectedBooksDisplay);
  });

  selectedBooksDisplay.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-book]");
    if (!removeButton) {
      return;
    }

    pageState.selectedBooks.delete(removeButton.dataset.bookId);
    renderSelectedBooks(selectedBooksDisplay);
  });

  borrowForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (pageState.selectedBooks.size === 0) {
      selectedBooksDisplay.innerHTML = `<span class="form-error">Select at least one book.</span>`;
      return;
    }

    const formData = new FormData(borrowForm);
    await addBorrowRecord({
      borrowerName: String(formData.get("borrowerName") || "").trim(),
      studentInfo: String(formData.get("studentInfo") || "").trim(),
      dateBorrowed: String(formData.get("dateBorrowed") || ""),
      lendBy: String(formData.get("lendBy") || "").trim(),
      books: Array.from(pageState.selectedBooks.values())
    });

    modal.close();
  });
}

function openBookSelectionModal(selectedBooksDisplay) {
  let query = "";
  const draftSelection = new Map(pageState.selectedBooks);

  const modal = openModal({
    title: "Select Books",
    size: "medium",
    content: `
      <div class="book-picker">
        <label class="search-box full-width">
          <span class="sr-only">Search books</span>
          <input id="bookPickerSearch" type="search" placeholder="Search title or call number...">
        </label>
        <div id="bookPickerList" class="book-picker-list"></div>
        <div class="modal-actions">
          <button class="secondary-button" type="button" data-modal-close>Cancel</button>
          <button id="confirmBookSelection" class="primary-button modal-submit" type="button">Confirm</button>
        </div>
      </div>
    `
  });

  const list = modal.root.querySelector("#bookPickerList");

  const renderBooks = () => {
    const books = getState().books.filter((book) => {
      const text = `${book.title} ${book.callNumber || ""}`.toLowerCase();
      return !query || text.includes(query);
    });

    list.innerHTML = books.map((book) => {
      const selected = draftSelection.get(book.id);
      return `
        <button class="book-option ${selected ? "is-selected" : ""}" type="button" data-book-id="${escapeHtml(book.id)}">
          <span>
            <strong>${escapeHtml(book.title)}</strong>
            <small>${escapeHtml(book.callNumber || "No call number")}</small>
          </span>
          <span class="quantity-badge">${selected ? selected.quantity : 0}</span>
        </button>
      `;
    }).join("");
  };

  modal.root.querySelector("#bookPickerSearch").addEventListener("input", debounce((event) => {
    query = event.target.value.trim().toLowerCase();
    renderBooks();
  }, 120));

  list.addEventListener("click", (event) => {
    const option = event.target.closest("[data-book-id]");
    if (!option) {
      return;
    }

    const book = getState().books.find((item) => item.id === option.dataset.bookId);
    const currentSelection = draftSelection.get(book.id);
    draftSelection.set(book.id, {
      bookId: book.id,
      title: book.title,
      callNumber: book.callNumber || "Unassigned",
      quantity: currentSelection ? currentSelection.quantity + 1 : 1
    });
    renderBooks();
  });

  modal.root.querySelector("#confirmBookSelection").addEventListener("click", () => {
    pageState.selectedBooks = draftSelection;
    renderSelectedBooks(selectedBooksDisplay);
    modal.close();
  });

  renderBooks();
}

function renderSelectedBooks(container) {
  const books = Array.from(pageState.selectedBooks.values());

  container.innerHTML = books.length
    ? books.map((book) => `
      <span class="chip">
        ${escapeHtml(book.title)} <strong>x${book.quantity}</strong>
        <button type="button" data-remove-book data-book-id="${escapeHtml(book.bookId)}" aria-label="Remove ${escapeHtml(book.title)}">x</button>
      </span>
    `).join("")
    : "";
}

function renderField(label, name, type = "text", required = false) {
  return `
    <div class="field-group">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="${type}" ${required ? "required" : ""}>
    </div>
  `;
}

function debounce(callback, wait) {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), wait);
  };
}
