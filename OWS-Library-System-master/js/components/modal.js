const modalStack = [];
let modalRoot;

export function openModal({ title, content, size = "medium", onClose }) {
  ensureModalRoot();

  const modalId = `modal-${Date.now()}-${modalStack.length}`;
  const modalNode = document.createElement("section");
  modalNode.className = `modal-layer modal-${size}`;
  modalNode.dataset.modalId = modalId;
  modalNode.innerHTML = `
    <div class="modal-backdrop" data-modal-close></div>
    <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="${modalId}-title">
      <header class="modal-header">
        <h2 id="${modalId}-title">${title}</h2>
        <button class="icon-button modal-close" type="button" aria-label="Close modal" data-modal-close>x</button>
      </header>
      <div class="modal-body">${content}</div>
    </div>
  `;

  modalRoot.appendChild(modalNode);
  modalStack.push({ id: modalId, node: modalNode, onClose });
  document.body.classList.add("is-modal-open");

  requestAnimationFrame(() => modalNode.classList.add("is-open"));

  modalNode.addEventListener("click", (event) => {
    if (event.target.closest("[data-modal-close]")) {
      closeModal(modalId);
    }
  });

  const focusTarget = modalNode.querySelector("input, button, select, textarea, [tabindex]:not([tabindex='-1'])");
  if (focusTarget) {
    focusTarget.focus();
  }

  return {
    id: modalId,
    root: modalNode,
    close: () => closeModal(modalId)
  };
}

export function closeModal(modalId) {
  const modalIndex = modalStack.findIndex((modal) => modal.id === modalId);
  if (modalIndex === -1) {
    return;
  }

  const [modal] = modalStack.splice(modalIndex, 1);
  modal.node.classList.remove("is-open");

  window.setTimeout(() => {
    modal.node.remove();

    if (modal.onClose) {
      modal.onClose();
    }

    if (modalStack.length === 0) {
      document.body.classList.remove("is-modal-open");
    }
  }, 180);
}

export function closeTopModal() {
  const topModal = modalStack[modalStack.length - 1];
  if (topModal) {
    closeModal(topModal.id);
  }
}

function ensureModalRoot() {
  if (modalRoot) {
    return;
  }

  modalRoot = document.createElement("div");
  modalRoot.id = "modalRoot";
  document.body.appendChild(modalRoot);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeTopModal();
  }
});
