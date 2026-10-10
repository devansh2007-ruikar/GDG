/**
 * Date and Time utilities for GDG Events Platform
 * Always displays and interprets dates in Indian Standard Time (Asia/Kolkata / IST, UTC+05:30)
 */

/**
 * Formats an ISO date string or Date object in Asia/Kolkata timezone with IST label.
 * Example outputs:
 * - "Sat, Oct 17, 2026, 10:00 AM IST" (full)
 * - "Sat, Oct 17, 10:00 AM IST" (compact)
 * - "Oct 17, 2026, 10:00 AM IST" (date + time)
 *
 * @param {string | number | Date} dateInput
 * @param {object} [options]
 * @param {boolean} [options.includeYear=true]
 * @param {'short' | 'long' | 'narrow'} [options.weekday='short']
 * @param {boolean} [options.showWeekday=true]
 * @returns {string}
 */
export function formatDateTimeIST(dateInput, options = {}) {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (!date || isNaN(date.getTime())) return '';

  const {
    includeYear = true,
    weekday = 'short',
    showWeekday = true,
  } = options;

  const intlOptions = {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  if (includeYear) {
    intlOptions.year = 'numeric';
  }
  if (showWeekday) {
    intlOptions.weekday = weekday;
  }

  const formatter = new Intl.DateTimeFormat('en-IN', intlOptions);
  const formatted = formatter.format(date).replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
  return `${formatted} IST`;
}

/**
 * Converts a UTC ISO string to "YYYY-MM-DDTHH:mm" strictly represented in Asia/Kolkata (UTC+05:30)
 * For datetime-local input fields so inputs reflect the IST time.
 *
 * @param {string} [isoString]
 * @returns {string}
 */
export function isoToISTInputString(isoString) {
  if (!isoString) {
    // Tomorrow at 10:00 AM in IST
    const now = new Date();
    // Offset for IST in ms (+05:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);
    istNow.setDate(istNow.getDate() + 1);
    const pad = (n) => String(n).padStart(2, '0');
    return `${istNow.getFullYear()}-${pad(istNow.getMonth() + 1)}-${pad(istNow.getDate())}T10:00`;
  }

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type) => parts.find((p) => p.type === type)?.value || '00';
  return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`;
}

/**
 * Converts a datetime-local input value (e.g. "2026-10-18T10:00") INTERPRETED AS IST to an ISO UTC string.
 *
 * @param {string} localInputStr
 * @returns {string}
 */
export function istInputToISO(localInputStr) {
  if (!localInputStr) return '';
  // Ensure seconds are included before timezone offset
  const normalized = localInputStr.length === 16 ? `${localInputStr}:00` : localInputStr;
  const withOffset = `${normalized}+05:30`;
  const date = new Date(withOffset);
  if (isNaN(date.getTime())) {
    return new Date(localInputStr).toISOString();
  }
  return date.toISOString();
}
