import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * ScrollToTop component ensuring:
 * 1. window.history.scrollRestoration = "manual"
 * 2. Navigating forward (PUSH / REPLACE) scrolls instantly to top { top: 0, left: 0, behavior: "instant" }
 * 3. Navigating back (POP) restores previous list scroll position for /events (saved in sessionStorage)
 */
export function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType();
  const prevPathRef = useRef(location.pathname);

  // Set scrollRestoration to manual on mount
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Track and save current scroll position for the current path
  useEffect(() => {
    const handleScroll = () => {
      // Save scroll position for the active path
      sessionStorage.setItem(`scroll_${location.pathname}`, window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  // Handle route changes
  useEffect(() => {
    const isPop = navType === 'POP';
    const isNavigatingToEvents = location.pathname === '/events' || location.pathname === '/';
    const comingFromDetails = prevPathRef.current.startsWith('/events/');

    if (isPop && isNavigatingToEvents && comingFromDetails) {
      // Back button was pressed from event details to events list!
      // Let EventsPage restore scroll after verifying cache/data
      const savedY = parseInt(sessionStorage.getItem('scroll_/events') || '0', 10);
      if (savedY > 0) {
        // Immediate attempt in case cached events are already rendered
        requestAnimationFrame(() => {
          window.scrollTo({ top: savedY, left: 0, behavior: 'instant' });
        });
      }
    } else {
      // Forward navigation (PUSH/REPLACE) or other routes: always scroll to top instantly
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    prevPathRef.current = location.pathname;
  }, [location.pathname, navType]);

  return null;
}

/**
 * Helper to explicitly restore scroll position for a given path once async data has loaded
 * @param {string} pathname
 */
export function restorePathScroll(pathname) {
  try {
    const saved = sessionStorage.getItem(`scroll_${pathname}`);
    if (saved) {
      const y = parseInt(saved, 10);
      if (!isNaN(y) && y > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, left: 0, behavior: 'instant' });
        });
      }
    }
  } catch {
    // SessionStorage access may fail in restricted sandboxes
  }
}
