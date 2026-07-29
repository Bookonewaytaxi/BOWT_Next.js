// Next.js has no equivalent to React Router's navigate(path, { state }) /
// location.state. This module replaces that pattern with sessionStorage so
// data (selected route, vehicle, customer details, etc.) survives client-side
// navigation between /booking/* pages without being put in the URL.

const KEY = 'bowt_booking_state';

export function getBookingState() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Merges with whatever is already stored, so each step of the booking flow
// only needs to set the fields it owns.
export function setBookingState(patch) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getBookingState();
    window.sessionStorage.setItem(KEY, JSON.stringify({ ...existing, ...patch }));
  } catch (e) {
    // sessionStorage can throw in private-browsing / storage-full edge cases;
    // failing silently matches the previous best-effort behavior.
  }
}

export function clearBookingState() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch (e) {}
}
