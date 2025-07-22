export const cleanupStorage = () => {
  // Clear Redux Persist state
  const persistKeys = ['persist:resume', 'persist:coverLetter', 'persist:print', 'persist:jobFit'];
  persistKeys.forEach(key => localStorage.removeItem(key));
  
  // Clear popup-related storage
  const popupKeys = ['resumate_dashboard_welcome_seen', 'resumate_cover_letter_notice_seen'];
  popupKeys.forEach(key => localStorage.removeItem(key));
  
  // Force reload to ensure clean state
  window.location.reload();
};

// Add this to window for easy debugging
if (process.env.NODE_ENV === 'development') {
  (window as any).cleanupStorage = cleanupStorage;
} 