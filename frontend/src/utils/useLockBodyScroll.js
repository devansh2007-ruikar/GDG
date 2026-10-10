import { useEffect } from 'react';

let lockCount = 0;
let originalOverflow = '';

/**
 * Hook to lock body scroll when a modal or drawer is open.
 * Maintains a reference count so nested or multiple modals don't prematurely unlock scroll.
 * Uses html { scrollbar-gutter: stable } to avoid layout jump.
 *
 * @param {boolean} isLocked
 */
export function useLockBodyScroll(isLocked) {
  useEffect(() => {
    if (!isLocked) return;

    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    lockCount++;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow || '';
      }
    };
  }, [isLocked]);
}
