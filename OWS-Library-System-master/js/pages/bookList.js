import { renderAppLayout } from "../components/layout.js";
import { openModal } from "../components/modal.js";
import { deleteBook, getState, subscribe, updateBook } from "../state/store.js";
import { bookFieldGroups, categoryOptions, locationOptions } from "../utils/bookOptions.js";
import { escapeHtml } from "../utils/html.js";
import { initStore } from "../state/store.js";
await initStore();

const arrangementOptions = [
  { value: "date", label: "Date Added" },
  { value: "newest", label: "Newest to Oldest" },
  { value: "oldest", label: "Oldest to Newest" },
  { value: "alpha", label: "Alphabetical" }
];

const pageState = {
  search: "",
  category: "",
  location: "",
  arrangement: "date"
};

renderAppLayout({
  activePage: "book-list",
  content: `
    <header class="page-header">
      <div>
        <h2>Book List</h2>
        <p>Search, filter, arrange, edit, and export the complete catalog.</p>
      </div>
    </header>

    <section class="toolbar book-list-toolbar" aria-label="Book list tools">
      <label class="search-box">
        <span class="sr-only">Search books</span>
        <input id="bookSearch" type="search" placeholder="Search title or call number...">
      </label>
      <label class="filter-box">
        <span class="sr-only">Filter by category</span>
        <select id="categoryFilter">
          <option value="">All Categories</option>
          ${categoryOptions.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}
        </select>
      </label>
      <label class="filter-box">
        <span class="sr-only">Filter by location</span>
        <select id="locationFilter">
          <option value="">All Locations</option>
          ${locationOptions.map((location) => `<option value="${escapeHtml(location)}">${escapeHtml(location)}</option>`).join("")}
        </select>
      </label>
      <label class="filter-box">
        <span class="sr-only">Arrange books</span>
        <select id="arrangementSelect">
          ${arrangementOptions.map((option) => `<option value="${option.value}">${option.label}</option>`).join("")}
        </select>
      </label>
    </section>

    <section class="table-card book-list-card" aria-label="Books">
      <div class="table-scroll vertical-table-scroll">
        <table class="data-table book-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Publisher</th>
              <th>Year</th>
              <th>Call Number</th>
              <th>ISBN</th>
              <th>Location</th>
              <th>Category</th>
              <th>On Shelf</th>
              <th>Date Added / Date Edited</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="bookTableBody"></tbody>
        </table>
      </div>
    </section>
  `
});

const tableBody = document.getElementById("bookTableBody");

document.getElementById("bookSearch").addEventListener("input", debounce((event) => {
  pageState.search = event.target.value.trim().toLowerCase();
  renderBookTable();
}, 180));

document.getElementById("categoryFilter").addEventListener("change", (event) => {
  pageState.category = event.target.value;
  renderBookTable();
});

document.getElementById("locationFilter").addEventListener("change", (event) => {
  pageState.location = event.target.value;
  renderBookTable();
});

document.getElementById("arrangementSelect").addEventListener("change", (event) => {
  pageState.arrangement = event.target.value;
  renderBookTable();
});

tableBody.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-book]");
  const deleteButton = event.target.closest("[data-delete-book]");

  if (editButton) {
    openEditBookModal(editButton.dataset.bookId);
    return;
  }

  if (deleteButton) {
    deleteBook(deleteButton.dataset.bookId);
  }
});

subscribe(renderBookTable);
renderBookTable();

// Intercept the print button to pass current filter/sort state as URL params
document.addEventListener("click", (event) => {
  const printLink = event.target.closest('a[href*="book-list-print.html"]');
  if (!printLink) return;
  event.preventDefault();

  const params = new URLSearchParams();
  if (pageState.search)      params.set("search", pageState.search);
  if (pageState.category)    params.set("category", pageState.category);
  if (pageState.location)    params.set("location", pageState.location);
  if (pageState.arrangement) params.set("arrangement", pageState.arrangement);

  const base = printLink.getAttribute("href");
  window.open(`${base}?${params.toString()}`, "_blank");
});

function renderBookTable() {
  const books = getFilteredBooks();

  tableBody.innerHTML = books.length
    ? books.map(renderBookRow).join("")
    : `<tr><td colspan="11" class="empty-table">No books found.</td></tr>`;
}

function getFilteredBooks() {
  const books = [...getState().books].filter((book) => {
    const searchTarget = `${book.title || ""} ${book.callNumber || ""}`.toLowerCase();
    const matchesSearch = !pageState.search || searchTarget.includes(pageState.search);
    const matchesCategory = !pageState.category || book.category === pageState.category;
    const matchesLocation = !pageState.location || book.location === pageState.location;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return sortBooks(books);
}

function sortBooks(books) {
  const sortedBooks = [...books];

  if (pageState.arrangement === "alpha") {
    return sortedBooks.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
  }

  if (pageState.arrangement === "oldest") {
    return sortedBooks.sort((a, b) => getPublicationYear(a) - getPublicationYear(b));
  }

  if (pageState.arrangement === "newest") {
    return sortedBooks.sort((a, b) => getPublicationYear(b) - getPublicationYear(a));
  }

  return sortedBooks.sort((a, b) => getLatestRecordDate(b) - getLatestRecordDate(a));
}

function renderBookRow(book) {
  return `
    <tr>
      <td><strong>${display(book.title)}</strong></td>
      <td>${display(book.responsibility)}</td>
      <td>${display(book.publisher)}</td>
      <td>${display(book.publicationDate)}</td>
      <td>${display(book.callNumber)}</td>
      <td>${display(book.isbn)}</td>
      <td>${display(book.location)}</td>
      <td>${display(book.category)}</td>
      <td>${display(book.onShelf)}</td>
      <td>${display(book.editedAt || book.addedAt)}</td>
      <td>
        <div class="row-actions">
          <button class="secondary-button compact-button" type="button" data-edit-book data-book-id="${escapeHtml(book.id)}">Edit</button>
          <button class="delete-button" type="button" data-delete-book data-book-id="${escapeHtml(book.id)}" aria-label="Delete ${escapeHtml(book.title)}">x</button>
        </div>
      </td>
    </tr>
  `;
}

function openEditBookModal(bookId) {
  const book = getState().books.find((item) => item.id === bookId);
  if (!book) {
    return;
  }

  const modal = openModal({
    title: "Edit Book",
    size: "large",
    content: `
      <form id="editBookForm" class="data-form modal-form">
        ${bookFieldGroups.map((group, index) => `
          <section class="form-section modal-form-section" aria-labelledby="editGroup${index}">
            <h3 id="editGroup${index}">${group.title}</h3>
            <div class="form-grid">
              ${group.fields.map((field) => renderEditField(field, book)).join("")}
            </div>
          </section>
        `).join("")}

        <div class="choice-block">
          <span class="choice-label">Library/Location</span>
          <div class="choice-group" role="radiogroup" aria-label="Edit library location">
            ${locationOptions.map((option) => renderChoice("location", option, book.location === option, "oval-choice")).join("")}
          </div>
        </div>

        <div class="choice-block">
          <span class="choice-label">Categories</span>
          <div class="choice-group category-choice-group" role="radiogroup" aria-label="Edit book category">
            ${categoryOptions.map((option) => renderChoice("category", option, book.category === option, "pill-choice")).join("")}
          </div>
        </div>

        <div class="modal-actions">
          <button class="secondary-button" type="button" data-modal-close>Cancel</button>
          <button class="primary-button modal-submit" type="submit">Save</button>
        </div>
      </form>
    `
  });

  modal.root.querySelector("#editBookForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await updateBook(bookId, {
      title: String(formData.get("title") || "").trim(),
      responsibility: String(formData.get("responsibility") || ""),
      corporateEntry: String(formData.get("corporateEntry") || ""),
      place: String(formData.get("place") || ""),
      publisher: String(formData.get("publisher") || ""),
      publicationDate: String(formData.get("publicationDate") || ""),
      extent: String(formData.get("extent") || ""),
      isbn: String(formData.get("isbn") || ""),
      url: String(formData.get("url") || ""),
      callNumber: String(formData.get("callNumber") || ""),
      accession: String(formData.get("accession") || ""),
      language: String(formData.get("language") || ""),
      enteredBy: String(formData.get("enteredBy") || ""),
      dateEntered: String(formData.get("dateEntered") || ""),
      updatedBy: String(formData.get("updatedBy") || ""),
      dateUpdated: String(formData.get("dateUpdated") || ""),
      volumeCopy: String(formData.get("volumeCopy") || ""),
      onShelf: Number(formData.get("onShelf") || 0),
      recordId: String(formData.get("recordId") || ""),
      location: String(formData.get("location") || book.location || ""),
      category: String(formData.get("category") || book.category || ""),
      editedAt: new Date().toISOString().slice(0, 10)
    });

    modal.close();
  });
}

function renderEditField(field, book) {
  const type = field.type || "text";
  return `
    <div class="field-group">
      <label for="edit-${field.name}">${field.label}</label>
      <input id="edit-${field.name}" name="${field.name}" type="${type}" value="${escapeHtml(book[field.name] || "")}" ${field.required ? "required" : ""}>
    </div>
  `;
}

function renderChoice(name, value, checked, className) {
  const id = `edit-${name}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return `
    <label class="${className}">
      <input type="radio" name="${name}" id="${id}" value="${escapeHtml(value)}" ${checked ? "checked" : ""}>
      <span>${escapeHtml(value)}</span>
    </label>
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

function debounce(callback, wait) {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), wait);
  };
}