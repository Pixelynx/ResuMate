/**
 * Utility functions for handling common errors
 */

/**
 * Suppresses ResizeObserver loop errors that don't affect functionality
 * This is particularly useful for Material-UI components that use ResizeObserver
 * for auto-sizing, like TextField with multiline prop
 */
export const setupResizeObserverErrorHandler = () => {
  const resizeObserverErrHandler = (e: ErrorEvent) => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
        e.message.includes('ResizeObserver loop')) {
      e.stopImmediatePropagation();
      return;
    }
    console.error(e);
  };

  window.addEventListener('error', resizeObserverErrHandler);
  return () => window.removeEventListener('error', resizeObserverErrHandler);
}; 