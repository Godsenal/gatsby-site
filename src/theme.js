import React, { createContext, useState, useContext } from "react";
import { Global, css } from "@emotion/core";

const baseTheme = {
  background: "#fefefe",
  bodyColor: "#2f3e54",
  primaryColor: "#444494",
  contrastColor: "#fefefe"
};

const themes = {};

const createCss = ({
  background,
  bodyColor,
  primaryColor,
  contrastColor
}) => css`
  body {
    background: ${background};
    color: ${bodyColor};
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  a {
    color: ${primaryColor};
  }
  button {
    color: ${contrastColor}
    background-color: ${primaryColor}
  }
`;

export const ThemeContext = createContext({
  theme: {},
  setTheme: themeName => {}
});

export const useTheme = () => {
  return useContext(ThemeContext);
};

const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState("");
  const currentTheme = {
    ...baseTheme,
    ...themes[themeName]
  };
  return (
    <>
      <Global styles={createCss(currentTheme)}></Global>
      <ThemeContext.Provider
        value={{ theme: currentTheme, setTheme: setThemeName }}
      >
        {children}
      </ThemeContext.Provider>
    </>
  );
};

export default function wrapRootElement({ element }) {
  return <ThemeProvider>{element}</ThemeProvider>;
}
