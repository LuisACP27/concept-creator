/**
 * Utility to clear all localStorage data for the app
 */
export class StorageCleaner {
  /**
   * Clear all app data from localStorage
   */
  static clearAllData(): void {
    if (typeof window === 'undefined') {
      console.warn('Cannot clear storage: window is not available');
      return;
    }

    try {
      // Clear specific app keys
      const appKeys = ['albums', 'app-language'];
      
      appKeys.forEach(key => {
        window.localStorage.removeItem(key);
        console.log(`🗑️ Cleared localStorage key: ${key}`);
      });

      console.log('✅ All app data cleared from localStorage');
      
      // Force page reload to reset all state
      window.location.reload();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Get current storage usage
   */
  static getStorageInfo(): { used: number; usedMB: string; keys: string[] } {
    if (typeof window === 'undefined') {
      return { used: 0, usedMB: '0 MB', keys: [] };
    }

    let totalSize = 0;
    const keys: string[] = [];

    for (let key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        const value = window.localStorage.getItem(key);
        if (value) {
          totalSize += value.length;
          keys.push(key);
        }
      }
    }

    const usedMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    return {
      used: totalSize,
      usedMB: `${usedMB} MB`,
      keys
    };
  }
}
