export function formatTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");

  const datePart = [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-");
  const timePart = [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join("-");

  return `${datePart}_${timePart}`;
}

export function withTimestamp(baseName, extension = "pdf") {
  return `${baseName}_${formatTimestamp()}.${extension}`;
}

export async function downloadElementAsPdf(element, filename) {
  if (!window.html2pdf) {
    window.print();
    return Promise.resolve();
  }

  // Switch to a layout that mirrors @media print (full-width table, no
  // horizontal scroll container) so html2canvas captures the whole report
  // instead of clipping the right-hand columns.
  document.body.classList.add("is-exporting-pdf");

  try {
    await window.html2pdf()
      .set({
        margin: 0.35,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          windowWidth: element.scrollWidth,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
        pagebreak: { mode: ["css", "legacy"], avoid: [".chart-card", ".stat-card", ".print-table tr"] }
      })
      .from(element)
      .save();
  } finally {
    document.body.classList.remove("is-exporting-pdf");
  }
}