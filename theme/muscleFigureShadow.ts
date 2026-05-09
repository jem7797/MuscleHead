import { Platform, StyleSheet } from "react-native";
import { accent } from "./colors";

/** Warm orange glow around muscle figure SVGs (matches brand accent). */
export const muscleFigureShadowStyles = StyleSheet.create({
  wrapper: {
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 18,
      },
      android: {
        elevation: 16,
        shadowColor: accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      default: {},
    }),
  },
});
