import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistenceHelper } from './persistenceHelper';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(),
  removeItem: jest.fn(() => Promise.resolve()),
  multiSet: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn()
}));

describe('PersistenceHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('saveData', () => {
    test('saves data successfully', async () => {
      const testKey = 'test-key';
      const testData = { id: 1, name: 'Test' };
      
      // Setup mock implementation
      AsyncStorage.setItem.mockImplementation(() => Promise.resolve());
      
      // Call the method
      const result = await PersistenceHelper.saveData(testKey, testData);
      
      // Verify results
      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(testKey, JSON.stringify(testData));
    });
    
    test('handles errors correctly', async () => {
      const testKey = 'test-key';
      const testData = { id: 1, name: 'Test' };
      
      // Setup mock to throw error
      AsyncStorage.setItem.mockImplementation(() => Promise.reject(new Error('Test error')));
      
      // Call the method
      const result = await PersistenceHelper.saveData(testKey, testData);
      
      // Verify results
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('loadData', () => {
    test('loads data successfully', async () => {
      const testKey = 'test-key';
      const testData = { id: 1, name: 'Test' };
      const defaultValue = { id: 0, name: 'Default' };
      
      // Setup mock implementation
      AsyncStorage.getItem.mockImplementation(() => Promise.resolve(JSON.stringify(testData)));
      
      // Call the method
      const result = await PersistenceHelper.loadData(testKey, defaultValue);
      
      // Verify results
      expect(result).toEqual(testData);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(testKey);
    });
    
    test('returns default value when no data exists', async () => {
      const testKey = 'test-key';
      const defaultValue = { id: 0, name: 'Default' };
      
      // Setup mock implementation
      AsyncStorage.getItem.mockImplementation(() => Promise.resolve(null));
      
      // Call the method
      const result = await PersistenceHelper.loadData(testKey, defaultValue);
      
      // Verify results
      expect(result).toEqual(defaultValue);
    });
    
    test('handles errors correctly', async () => {
      const testKey = 'test-key';
      const defaultValue = { id: 0, name: 'Default' };
      
      // Setup mock to throw error
      AsyncStorage.getItem.mockImplementation(() => Promise.reject(new Error('Test error')));
      
      // Call the method
      const result = await PersistenceHelper.loadData(testKey, defaultValue);
      
      // Verify results
      expect(result).toEqual(defaultValue);
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('batchSave and batchLoad', () => {
    test('batch saves multiple items correctly', async () => {
      const entries = [
        ['key1', { id: 1 }],
        ['key2', { id: 2 }]
      ];
      
      // Call the method
      const result = await PersistenceHelper.batchSave(entries);
      
      // Verify results
      expect(result).toBe(true);
      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        ['key1', JSON.stringify({ id: 1 })],
        ['key2', JSON.stringify({ id: 2 })]
      ]);
    });
    
    test('batch loads multiple items correctly', async () => {
      const keys = ['key1', 'key2'];
      const mockData = [
        ['key1', JSON.stringify({ id: 1 })],
        ['key2', JSON.stringify({ id: 2 })]
      ];
      
      // Setup mock implementation
      AsyncStorage.multiGet.mockImplementation(() => Promise.resolve(mockData));
      
      // Call the method
      const result = await PersistenceHelper.batchLoad(keys);
      
      // Verify results
      expect(result).toEqual({
        key1: { id: 1 },
        key2: { id: 2 }
      });
    });
  });
});
