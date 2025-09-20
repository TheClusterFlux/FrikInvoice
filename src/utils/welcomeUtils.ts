// Utility for managing welcome messages that should only show once per day

const WELCOME_STORAGE_KEY = 'frikinvoice_welcome_shown_date';

/**
 * Check if the welcome message has been shown today
 * @returns true if welcome message should be shown, false if already shown today
 */
export const shouldShowWelcomeToday = (): boolean => {
  try {
    const lastShownDate = localStorage.getItem(WELCOME_STORAGE_KEY);
    const today = new Date().toDateString(); // Format: "Mon Jan 01 2024"
    
    if (!lastShownDate) {
      // First time - show welcome and mark as shown today
      localStorage.setItem(WELCOME_STORAGE_KEY, today);
      return true;
    }
    
    if (lastShownDate !== today) {
      // Different day - show welcome and update date
      localStorage.setItem(WELCOME_STORAGE_KEY, today);
      return true;
    }
    
    // Same day - don't show welcome
    return false;
  } catch (error) {
    // If localStorage fails, default to showing welcome
    console.warn('Failed to access localStorage for welcome message:', error);
    return true;
  }
};

/**
 * Mark the welcome message as shown for today
 * This is called when the welcome message is displayed
 */
export const markWelcomeAsShownToday = (): void => {
  try {
    const today = new Date().toDateString();
    localStorage.setItem(WELCOME_STORAGE_KEY, today);
  } catch (error) {
    console.warn('Failed to save welcome message state to localStorage:', error);
  }
};

/**
 * Reset the welcome message state (useful for testing)
 */
export const resetWelcomeState = (): void => {
  try {
    localStorage.removeItem(WELCOME_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to reset welcome message state:', error);
  }
};
