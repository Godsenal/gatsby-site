import React, { useCallback, useEffect, useState } from 'react';

const ThemeToggler = ({ children }) => {
  const [theme, setTheme] = useState(typeof window !== 'undefined' ? window.__theme : null);

  const handleToggleTheme = useCallback((newTheme) => {
    window.__setPreferredTheme(newTheme);
  }, []);

  useEffect(() => {
    window.__onThemeChange = () => {
      setTheme(window.__theme);
    };
  }, []);

  return <>{children({ theme, toggleTheme: handleToggleTheme })}</>;
};

export default ThemeToggler;
