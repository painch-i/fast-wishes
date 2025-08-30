import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { RefineThemes } from "@refinedev/mui";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
  import { liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router";
import { ConfigProvider } from "antd";
import authProvider from "./authProvider";
import { AnonymousLogin } from "./components/auth/anonymous-login";
import { PublicWishlistPage } from "./pages/wishes/public-wishlist.page";
import { NewWishPage } from "./pages/wishes/new-wish.page";
import { theme } from "./theme";
import { supabaseClient } from "./utility";
import { smartDataProvider } from "./providers/smartDataProvider";
import { WishesListPage } from "./pages/wishes/WishesListPage";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { LocaleGate } from "./i18n/LocaleGate";
import { fallbackLng } from "./i18n/config";

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
                <Route path=":locale/*" element={<LocaleGate />} />
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
