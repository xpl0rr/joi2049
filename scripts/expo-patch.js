// This script helps fix the @expo/metro-runtime issue
const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

console.log('Running Expo dependencies patch...');

// Create a clean environment
try {
  console.log('Cleaning Metro cache...');
  if (fs.existsSync(path.join(__dirname, '../node_modules/.cache'))) {
    fs.rmSync(path.join(__dirname, '../node_modules/.cache'), { recursive: true, force: true });
  }
} catch (err) {
  console.error('Error clearing cache:', err);
}

// Ensure @expo/metro-runtime is properly installed
try {
  console.log('Reinstalling @expo/metro-runtime...');
  execSync('npm install @expo/metro-runtime@5.0.4 --force', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
} catch (err) {
  console.error('Error reinstalling @expo/metro-runtime:', err);
}

console.log('Patch complete.');
