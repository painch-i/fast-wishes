import { RefineKbarProvider } from "@refinedev/kbar";

import { RefineThemes } from "@refinedev/mui";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import { ConfigProvider } from "antd";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import i18n from "./i18n";
import { LocaleGate, ProtectedOutlet } from "./i18n/LocaleGate";
import { fallbackLng } from "./i18n/config";
import { WishesListPage } from "./pages/wishes/WishesListPage";
import { PublicWishlistPage } from "./pages/wishes/public-wishlist.page";
import { theme } from "./theme";

function RootRedirect() {
  const { pathname, search, hash } = useLocation();
  const target = i18n.language || fallbackLng;
  const suffix = pathname === "/" ? "/wishes" : pathname;
  return <Navigate to={`/${target}${suffix}${search}${hash}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <ConfigProvider theme={theme}>
          <RefineKbarProvider>
            <ThemeProvider theme={RefineThemes.Blue}>
              <CssBaseline />
              <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto", colorScheme: "light" } }} />
              <Routes>
                <Route path=":locale" element={<LocaleGate />}>
                  <Route element={<ProtectedOutlet />}>
                    <Route path="wishes" element={<WishesListPage />} />
                    <Route path="l/:slug" element={<PublicWishlistPage />} />
                  </Route>
                </Route>
                <Route path="*" element={<RootRedirect />} />
              </Routes>
            </ThemeProvider>
          </RefineKbarProvider>
        </ConfigProvider>
      </I18nextProvider>
    </BrowserRouter>
  );
}

export default App;
