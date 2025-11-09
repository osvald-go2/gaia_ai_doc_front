"use client";

import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";
import { useTheme } from "../ThemeProvider";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme === 'claude' ? 'light' : 'dark'}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
