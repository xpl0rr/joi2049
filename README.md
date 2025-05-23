# Joi - Your Personal Life Dashboard 👋

This is a React Native app built with [Expo](https://expo.dev) that helps you track important aspects of your life including finances, activities, and more.

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the development server

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Testing and Linting

### Running Tests

This project uses Jest for testing. Run the tests with:

```bash
npm test
```

Write tests in files with `.test.ts` or `.test.tsx` extensions in the same directory as the code being tested.

### Linting

Lint your code to ensure it follows our style guidelines:

```bash
npm run lint
```

Fix automatically fixable issues:

```bash
npm run lint:fix
```

## Building for iOS

This project uses EAS Build to create iOS builds. Always use the development profile for iOS builds unless explicitly requested otherwise.

### Create a Development Build

```bash
eas build --platform ios --profile development
```

### Install on Your Device

After the build completes, EAS will provide a URL to download and install the app on your device.

## Project Structure

- `app/` - Main application screens using Expo Router
  - `(tabs)/` - Tab-based navigation screens
- `components/` - Reusable UI components
  - `widgets/` - Dashboard widgets
  - `ui/` - Basic UI elements
  - `helpers/` - Helper components and hooks
- `contexts/` - React Context providers
- `constants/` - App-wide constants and theme settings
- `helpers/` - Utility functions

## Learn More

- [Expo documentation](https://docs.expo.dev/)
- [React Native documentation](https://reactnative.dev/)
- [Expo Router documentation](https://docs.expo.dev/router/introduction/)
