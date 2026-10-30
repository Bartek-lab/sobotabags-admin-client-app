import {
  type PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";
import { ConfigProvider, theme } from "antd";

// Same "leather" accent as shop-client's oklch(0.56 0.105 51) / oklch(0.7 0.115 54)
// tokens (app/globals.css), converted to sRGB hex for antd.
const LEATHER = { light: "#A56137", dark: "#D68A56" };

type ColorModeContextType = {
  mode: string;
  setMode: (mode: string) => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
  {} as ColorModeContextType
);

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const colorModeFromLocalStorage = localStorage.getItem("colorMode");
  const isSystemPreferenceDark = window?.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const systemPreference = isSystemPreferenceDark ? "dark" : "light";
  const [mode, setMode] = useState(
    colorModeFromLocalStorage || systemPreference
  );

  useEffect(() => {
    window.localStorage.setItem("colorMode", mode);
  }, [mode]);

  const setColorMode = () => {
    if (mode === "light") {
      setMode("dark");
    } else {
      setMode("light");
    }
  };

  const { darkAlgorithm, defaultAlgorithm } = theme;

  return (
    <ColorModeContext.Provider
      value={{
        setMode: setColorMode,
        mode,
      }}
    >
      <ConfigProvider
        theme={{
          token: { colorPrimary: mode === "light" ? LEATHER.light : LEATHER.dark },
          algorithm: mode === "light" ? defaultAlgorithm : darkAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ColorModeContext.Provider>
  );
};
