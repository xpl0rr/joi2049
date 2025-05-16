// This file provides mock implementations for native modules
// that might be causing issues with Expo Go

export const createMockStorage = () => {
  let data = {};
  
  return {
    set: (key, value) => {
      data[key] = value;
      return true;
    },
    getString: (key) => {
      return data[key] || null;
    },
    getBoolean: (key) => {
      return data[key] === 'true' ? true : data[key] === true ? true : false;
    },
    getNumber: (key) => {
      return Number(data[key]) || 0;
    },
    delete: (key) => {
      delete data[key];
      return true;
    },
    clearAll: () => {
      data = {};
      return true;
    },
    getAllKeys: () => {
      return Object.keys(data);
    }
  };
};

// Add any other mock implementations for problematic native modules here
