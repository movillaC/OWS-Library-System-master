import { renderAppLayout } from "../components/layout.js";
import { openModal } from "../components/modal.js";
import { addBook } from "../state/store.js";
import { categoryOptions, locationOptions } from "../utils/bookOptions.js";
import { initStore } from "../state/store.js";
await initStore();

renderAppLayout({
  activePage: "add-book",
  content: `
    <header class="page-header">
      <div>
        <h2>Add New Book</h2>
        <p>Catalog entry form structured for future database integration.</p>
      </div>
    </header>

    <form id="addBookForm" class="data-form" novalidate>
      <section class="form-section" aria-labelledby="titleProperHeading">
        <h3 id="titleProperHeading">Title Proper</h3>
        <div class="form-grid">
          ${renderField("Title", "titleProper", "text", true)}
          ${renderField("Author/Responsibility", "responsibility", "text", true)}
          ${renderField("Added Entry: Corporate", "corporateEntry")}
        </div>
      </section>

      <section class="form-section" aria-labelledby="publicationHeading">
        <h3 id="publicationHeading">Publication</h3>
        <div class="form-grid">
          ${renderField("Place", "place")}
          ${renderField("Publisher", "publisher", "text", true)}
          ${renderField("Year", "publicationDate", "number", true)}
          ${renderField("Extent/Dimension", "extent")}
          ${renderField("ISBN", "isbn", "text", true)}
          ${renderField("URL", "url", "url")}
        </div>
      </section>

      <section class="form-section" aria-labelledby="localInfoHeading">
        <h3 id="localInfoHeading">Local Information</h3>
        <div class="form-grid">
          ${renderField("Call Number", "callNumber", "text", true)}
          ${renderField("Accession", "accession")}
          ${renderField("Language", "language")}
          ${renderField("Entered By", "enteredBy")}
          ${renderField("Date Entered", "dateEntered", "date")}
          ${renderField("Updated By", "updatedBy")}
          ${renderField("Date Updated", "dateUpdated", "date")}
          ${renderField("Volume/Copy", "volumeCopy")}
          ${renderField("On Shelf", "onShelf", "number", true)}
          ${renderField("ID", "recordId")}
        </div>

        <div class="choice-block">
          <span class="choice-label">Library/Location</span>
          <div class="choice-group" role="radiogroup" aria-label="Library location">
            ${locationOptions.map((option, index) => renderChoice("location", option, index === 0, "oval-choice")).join("")}
          </div>
        </div>

        <div class="choice-block">
          <span class="choice-label">Categories</span>
          <div class="choice-group category-choice-group" role="radiogroup" aria-label="Book category">
            ${categoryOptions.map((option, index) => renderChoice("category", option, index === 0, "pill-choice")).join("")}
          </div>
        </div>
      </section>

      <div class="form-actions">
        <button class="primary-button form-submit" type="submit">Add Book</button>
      </div>
    </form>
  `
});

const form = document.getElementById("addBookForm");
const focusableFields = Array.from(form.querySelectorAll("input:not([type='radio']), button.form-submit"));

form.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || !event.target.matches("input:not([type='radio'])")) {
    return;
  }

  event.preventDefault();
  const currentIndex = focusableFields.indexOf(event.target);
  const nextField = focusableFields[currentIndex + 1];
  if (nextField) {
    nextField.focus();
  }
});

form.addEventListener("input", (event) => {
  const field = event.target.closest("input");
  if (field) {
    clearFieldError(field);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateRequiredFields()) {
    return;
  }

  const formData = new FormData(form);
  const title = String(formData.get("titleProper") || "").trim();

  await addBook({
    title,
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
    onShelf: Number(formData.get("onShelf") || 1),
    recordId: String(formData.get("recordId") || ""),
    location: String(formData.get("location") || locationOptions[0]),
    category: String(formData.get("category") || categoryOptions[0]),
    addedAt: new Date().toISOString().slice(0, 10)
  });

  form.reset();
  resetDefaultChoices();
  showSuccessModal();
});

function renderField(label, name, type = "text", required = false) {
  return `
    <div class="field-group">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="${type}" ${required ? "required" : ""} ${name === "publicationDate" ? 'min="0"' : ""} ${name === "onShelf" ? 'min="0"' : ""}>
      <span class="field-error" aria-live="polite"></span>
    </div>
  `;
}

function renderChoice(name, value, checked, className) {
  const id = `${name}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return `
    <label class="${className} choice-color-${slugify(value)}">
      <input type="radio" name="${name}" id="${id}" value="${value}" ${checked ? "checked" : ""}>
      <span>${value}</span>
    </label>
  `;
}

function resetDefaultChoices() {
  form.querySelector("input[name='location']").checked = true;
  form.querySelector("input[name='category']").checked = true;
  form.querySelectorAll(".field-group.has-error").forEach((group) => group.classList.remove("has-error"));
  form.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
}

function showSuccessModal() {
  const modal = openModal({
    title: "Success",
    size: "small",
    content: `
      <div class="success-message">
        <div class="success-mark" aria-hidden="true">✓</div>
        <p>Book Added Successfully</p>
        <span>The new catalog record has been saved and is ready to appear across the system.</span>
      </div>
    `
  });

  window.setTimeout(() => modal.close(), 2000);
}

function validateRequiredFields() {
  const requiredFields = Array.from(form.querySelectorAll("input[required]"));
  let firstInvalidField = null;

  requiredFields.forEach((field) => {
    const value = String(field.value || "").trim();
    const isInvalid = !value || (field.type === "number" && Number(value) < 0);

    if (isInvalid) {
      showFieldError(field, "This field is required.");
      firstInvalidField ||= field;
    } else {
      clearFieldError(field);
    }
  });

  const location = form.querySelector("input[name='location']:checked");
  const category = form.querySelector("input[name='category']:checked");
  if (!location || !category) {
    firstInvalidField ||= form.querySelector("input[name='location'], input[name='category']");
  }

  if (firstInvalidField) {
    firstInvalidField.focus();
    return false;
  }

  return true;
}

function showFieldError(field, message) {
  const group = field.closest(".field-group");
  group.classList.add("has-error");
  group.querySelector(".field-error").textContent = message;
}

function clearFieldError(field) {
  const group = field.closest(".field-group");
  if (!group) return;
  group.classList.remove("has-error");
  const error = group.querySelector(".field-error");
  if (error) {
    error.textContent = "";
  }
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
