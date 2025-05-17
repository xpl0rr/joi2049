// This is a patch for the missing withErrorOverlay function
// It creates a simple implementation that works with newer React Native versions

export default function withErrorOverlay(Component) {
  // This is a simple passthrough implementation
  return Component;
}
