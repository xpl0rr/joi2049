/**
 * API Service for interacting with the backend
 * Replaces AsyncStorage with server-based storage
 */

const API_URL = 'joi2049.xplorr.me';

/**
 * Get an item from the API
 * @param key The key to retrieve
 * @returns The retrieved value or null if not found
 */
export const getItem = async (key: string): Promise<any> => {
  try {
    const response = await fetch(`https://${API_URL}/storage/${encodeURIComponent(key)}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to get item ${key}:`, error);
    return null;
  }
};

/**
 * Set an item in the API
 * @param key The key to store
 * @param value The value to store
 */
export const setItem = async (key: string, value: any): Promise<void> => {
  try {
    const response = await fetch(`http://${API_URL}/storage/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to set item ${key}:`, error);
    throw error;
  }
};

/**
 * Get multiple items at once from the API
 * @param keys Array of keys to retrieve
 * @returns Object with keys and their values
 */
export const multiGet = async (keys: string[]): Promise<[string, any][]> => {
  try {
    const response = await fetch(`http://${API_URL}/storage/multi/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(keys),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    // Convert to format that matches AsyncStorage.multiGet: [key, value][]
    return Object.entries(result);
  } catch (error) {
    console.error('Failed to multi-get items:', error);
    // Return empty array for consistent error handling
    return [];
  }
};

/**
 * Set multiple items at once in the API
 * @param keyValuePairs Array of [key, value] pairs
 */
export const multiSet = async (keyValuePairs: [string, any][]): Promise<void> => {
  try {
    // Convert [key, value][] to {key: value}
    const data = Object.fromEntries(keyValuePairs);
    
    const response = await fetch(`http://${API_URL}/storage/multi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to multi-set items:', error);
    throw error;
  }
};

/**
 * Get all keys from the API
 * @returns Array of all keys
 */
export const getAllKeys = async (): Promise<string[]> => {
  try {
    const response = await fetch(`http://${API_URL}/storage`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return Object.keys(data);
  } catch (error) {
    console.error('Failed to get all keys:', error);
    return [];
  }
};

/**
 * Remove an item from the API
 * @param key The key to remove
 */
export const removeItem = async (key: string): Promise<void> => {
  try {
    const response = await fetch(`http://${API_URL}/storage/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok && response.status !== 404) {
      throw new Error(`API error: ${response.status}`);
    }
  } catch (error) {
    console.error(`Failed to remove item ${key}:`, error);
    throw error;
  }
};

// Export a default object that mimics AsyncStorage API
export default {
  getItem,
  setItem,
  multiGet,
  multiSet,
  getAllKeys,
  removeItem,
};
