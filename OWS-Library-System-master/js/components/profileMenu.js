import { logoutAdmin } from "../services/authService.js";

export function renderAdminDropdown(mount) {
  mount.innerHTML = `
    <button id="profileButton" class="utility-button profile-button" type="button" aria-label="Open admin menu" aria-expanded="false">
      <span class="profile-avatar" aria-hidden="true">A</span>
      <span>Admin User</span>
      <span aria-hidden="true">v</span>
    </button>
    <section id="profileDropdown" class="dropdown profile-menu" aria-label="Admin profile menu">
      <p class="profile-label">Admin</p>
      <button id="logoutButton" class="logout-button" type="button">Logout</button>
    </section>
  `;

  const button = mount.querySelector("#profileButton");
  const dropdown = mount.querySelector("#profileDropdown");

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = dropdown.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });

  mount.querySelector("#logoutButton").addEventListener("click", logoutAdmin);

  document.addEventListener("click", (event) => {
    if (!mount.contains(event.target)) {
      dropdown.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    }
  });
}
