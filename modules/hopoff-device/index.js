const { requireOptionalNativeModule } = require('expo-modules-core');

/** Null when native module is not in the binary (Expo Go, or pre-rebuild dev client). */
const HopoffDevice = requireOptionalNativeModule('HopoffDevice') ?? null;

module.exports = { default: HopoffDevice };
