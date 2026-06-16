import { fetchBooks, saveBook, editBook, removeBook,
         fetchLendings, saveLending, updateLendingStatus, removeLending,
         fetchNotifications, saveNotification, markAllNotificationsRead,
         subscribeToBooks, subscribeToLendings, subscribeToNotifications
} from "../services/firestoreService.js";
import { categoryOptions, locationOptions } from "../utils/bookOptions.js";

const state = {
  books: [],
  notifications: [],
  borrowRecords: [],
  dashboardStats: {}
};

const listeners = new Set();
const NOTIFICATION_LIMIT = 10;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let realtimeStarted = false;

export async function initStore() {
  const [books, borrowRecords, notifications] = await Promise.all([
    fetchBooks(),
    fetchLendings(),
    fetchNotifications()
  ]);
  setState({ books, borrowRecords, notifications });
  startRealtimeSubscriptions();
}

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setState(updater) {
  const updates = typeof updater === "function" ? updater(state) : updater;
  if (updates.notifications) {
    updates.notifications = normalizeNotifications(updates.notifications);
  }
  Object.assign(state, updates);
  state.dashboardStats = buildDashboardStats(state.books);
  listeners.forEach((listener) => listener(state));
}

export async function markNotificationsRead() {
  await markAllNotificationsRead();
  setState((currentState) => ({
    notifications: currentState.notifications.map((n) => ({ ...n, read: true }))
  }));
}

export async function addBook(bookData) {
  const book = await saveBook(bookData);
  const notification = await createNotification("added", "Book added", `${book.title || "New book"} was added to the catalog.`);
  setState((currentState) => ({
    books: [book, ...currentState.books],
    notifications: limitNotifications([
      notification,
      ...currentState.notifications
    ])
  }));
  return book;
}

export async function updateBook(bookId, bookData) {
  await editBook(bookId, bookData);
  const notification = await createNotification("updated", "Book edited", `${bookData.title || "A book"} details were updated.`);
  let updatedBook;
  setState((currentState) => ({
    books: currentState.books.map((book) => {
      if (book.id !== bookId) return book;
      updatedBook = { ...book, ...bookData, id: book.id, editedAt: bookData.editedAt || book.editedAt };
      return updatedBook;
    }),
    notifications: limitNotifications([
      notification,
      ...currentState.notifications
    ])
  }));
  return updatedBook;
}

export async function deleteBook(bookId) {
  const book = state.books.find((item) => item.id === bookId);
  await removeBook(bookId);
  const notification = await createNotification("deleted", "Book deleted", `${book?.title || "A book"} was removed from the catalog.`);
  setState((currentState) => ({
    books: currentState.books.filter((item) => item.id !== bookId),
    notifications: limitNotifications([
      notification,
      ...currentState.notifications
    ])
  }));
}

export async function addPdfNotification(label) {
  const notification = await createNotification("pdf", "PDF exported", `${label} PDF was generated.`);
  setState((currentState) => ({
    notifications: limitNotifications([
      notification,
      ...currentState.notifications
    ])
  }));
}

export async function addBorrowRecord(recordData) {
  const record = await saveLending(recordData);
  const notification = await createNotification("borrowed", "Book borrowed", `${record.borrowerName} borrowed ${record.books?.length ?? 1} book record(s).`);
  setState((currentState) => ({
    borrowRecords: [record, ...currentState.borrowRecords],
    notifications: limitNotifications([
      notification,
      ...currentState.notifications
    ])
  }));
  return record;
}

export async function updateBorrowStatus(recordId, status) {
  await updateLendingStatus(recordId, status);
  setState((currentState) => ({
    borrowRecords: currentState.borrowRecords.map((record) =>
      record.id === recordId ? { ...record, status } : record
    )
  }));
}

export async function deleteBorrowRecord(recordId) {
  await removeLending(recordId);
  const notification = await createNotification("deleted", "Borrow record deleted", "A lending record was removed.");
  setState((currentState) => ({
    borrowRecords: currentState.borrowRecords.filter((record) => record.id !== recordId),
    notifications: limitNotifications([
      notification,
      ...currentState.notifications
    ])
  }));
}

export function buildDashboardStats(books, borrowRecords = state.borrowRecords) {
  const currentYear = new Date().getFullYear();

  return {
    totalBooks: books.length,
    totalBorrowRecords: borrowRecords.length,
    byLocation: countByOptions(books, "location", locationOptions),
    byCategory: countByOptions(books, "category", categoryOptions),
    addedOverTime: books.reduce((totals, book) => {
      const addedDate = parseDate(book.addedAt);
      if (!addedDate || addedDate.getFullYear() !== currentYear) {
        return totals;
      }

      const monthLabel = MONTH_LABELS[addedDate.getMonth()];
      totals[monthLabel] = (totals[monthLabel] || 0) + 1;
      return totals;
    }, Object.fromEntries(MONTH_LABELS.map((month) => [month, 0]))),
    currentYear
  };
}

async function createNotification(type, title, message) {
  const now = new Date();
  return saveNotification({
    type, title, message,
    createdAt: now.toLocaleString(),
    createdAtValue: now.toISOString(),
    read: false
  });
}

function countByOptions(items, key, validOptions) {
  const totals = Object.fromEntries(validOptions.map((option) => [option, 0]));
  items.forEach((item) => {
    const value = item[key];
    if (Object.prototype.hasOwnProperty.call(totals, value)) {
      totals[value] += 1;
    }
  });
  return totals;
}

function limitNotifications(notifications) {
  return notifications.slice(0, NOTIFICATION_LIMIT);
}

function normalizeNotifications(notifications) {
  return limitNotifications(notifications.map((notification) => ({ ...notification })));
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startRealtimeSubscriptions() {
  if (realtimeStarted) {
    return;
  }

  realtimeStarted = true;
  subscribeToBooks((books) => setState({ books }));
  subscribeToLendings((borrowRecords) => setState({ borrowRecords }));
  subscribeToNotifications((notifications) => setState({ notifications }));
}
