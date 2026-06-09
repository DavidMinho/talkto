import { darkTheme } from "./dark";
import { lightTheme } from "./light";

export function createAppTheme(mode: "light" | "dark") {
  return mode === "dark" ? darkTheme : lightTheme;
}
