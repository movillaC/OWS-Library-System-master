import { renderAppLayout } from "../components/layout.js";

const pageMap = {
  "add-book": {
    title: "Add New Book",
    text: "This Phase 1 placeholder preserves shared navigation for the next implementation phase."
  },
  lending: {
    title: "Book Lending",
    text: "This Phase 1 placeholder preserves shared navigation for the next implementation phase."
  },
  "book-list": {
    title: "Book List",
    text: "This Phase 1 placeholder preserves shared navigation for the next implementation phase."
  }
};

const activePage = document.getElementById("appLayout").dataset.activePage;
const page = pageMap[activePage];

renderAppLayout({
  activePage,
  content: `
    <section class="placeholder-card">
      <h2>${page.title}</h2>
      <p>${page.text}</p>
    </section>
  `
});
