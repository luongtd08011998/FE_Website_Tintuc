import { createTheme } from "@mui/material/styles";

export const palette = {
  primary: "#1677ff",
  primaryDark: "#0958d9",
  bgDefault: "#f4f6f8",
  bgPaper: "#ffffff",
};

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: palette.primary,
      dark: palette.primaryDark,
    },
    background: {
      default: palette.bgDefault,
      paper: palette.bgPaper,
    },
  },
  typography: {
    fontFamily: "var(--font-geist-sans), Roboto, Arial, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 6,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export const antdTheme = {
  token: {
    colorPrimary: palette.primary,
    colorBgContainer: palette.bgPaper,
    colorBgLayout: palette.bgDefault,
    borderRadius: 6,
    fontFamily: "var(--font-geist-sans), Roboto, Arial, sans-serif",
  },
};
