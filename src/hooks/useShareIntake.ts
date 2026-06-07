/**
 * Web / default stub. Share-sheet intake only runs on native dev builds; this
 * no-op keeps the web bundle from importing the native module.
 */
export function useShareIntake(_onAdded?: (title: string) => void) {}
