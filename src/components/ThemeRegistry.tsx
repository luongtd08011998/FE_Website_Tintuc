"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ConfigProvider, App } from "antd";
import { muiTheme, antdTheme } from "@/lib/themeConfig";

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ConfigProvider theme={antdTheme}>
        <App>{children}</App>
      </ConfigProvider>
    </ThemeProvider>
  );
}
