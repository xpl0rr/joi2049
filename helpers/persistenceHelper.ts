import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A utility for managing AsyncStorage operations with error handling and logging
 */
export class PersistenceHelper {
  /**
   * Save data to AsyncStorage
   * 
   * @param key Storage key
   * @param data Data to store (will be JSON stringified)
   * @returns Promise resolving to true if successful
   */
  static async saveData<T>(key: string, data: T): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonValue);
      console.log(`Saved data to ${key} successfully`);
      return true;
    } catch (error) {
      console.error(`Error saving data to ${key}:`, error);
      return false;
    }
  }

  /**
   * Load data from AsyncStorage
   * 
   * @param key Storage key
   * @param defaultValue Value to return if data not found or error occurs
   * @returns Promise resolving to parsed data or defaultValue
   */
  static async loadData<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue === null) {
        console.log(`No data found for ${key}, using default value`);
        return defaultValue;
      }
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error(`Error loading data from ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Remove data from AsyncStorage
   * 
   * @param key Storage key
   * @returns Promise resolving to true if successful
   */
  static async removeData(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`Removed data from ${key} successfully`);
      return true;
    } catch (error) {
      console.error(`Error removing data from ${key}:`, error);
      return false;
    }
  }

  /**
   * Batch save multiple key-value pairs
   * 
   * @param entries Array of [key, value] tuples
   * @returns Promise resolving to true if successful
   */
  static async batchSave(entries: [string, any][]): Promise<boolean> {
    try {
      // Convert values to strings
      const stringEntries = entries.map(([key, value]) => [
        key, 
        typeof value === 'string' ? value : JSON.stringify(value)
      ]);
      
      await AsyncStorage.multiSet(stringEntries as [string, string][]);
      console.log(`Batch saved ${entries.length} items successfully`);
      return true;
    } catch (error) {
      console.error('Error during batch save operation:', error);
      return false;
    }
  }

  /**
   * Batch load multiple keys
   * 
   * @param keys Array of storage keys
   * @returns Promise resolving to Record of key-value pairs (parsed from JSON)
   */
  static async batchLoad(keys: string[]): Promise<Record<string, any>> {
    try {
      const results = await AsyncStorage.multiGet(keys);
      const parsed: Record<string, any> = {};
      
      results.forEach(([key, value]) => {
        if (value) {
          try {
            parsed[key] = JSON.parse(value);
          } catch {
            // If value isn't valid JSON, store as-is
            parsed[key] = value;
          }
        }
      });
      
      return parsed;
    } catch (error) {
      console.error('Error during batch load operation:', error);
      return {};
    }
  }
}
