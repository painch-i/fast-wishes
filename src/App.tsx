import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  RefineSnackbarProvider,
  useNotificationProvider,
} from "@refinedev/mui";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
  import { liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Route, Routes } from "react-router";
import { ConfigProvider } from "antd";
import authProvider from "./authProvider";
import { AnonymousLogin } from "./components/auth/anonymous-login";
import { PublicWishlistPage } from "./pages/wishes/public-wishlist.page";
import { NewWishPage } from "./pages/wishes/new-wish.page";
import { theme } from "./theme";
import { supabaseClient } from "./utility";
import { smartDataProvider } from "./providers/smartDataProvider";
import { WishesListPage } from "./pages/wishes/WishesListPage";
import { RefineThemes } from "@refinedev/mui";

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider theme={theme}>
      <RefineKbarProvider>
        <ThemeProvider theme={RefineThemes.Blue}>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto", colorScheme: "light" } }} />
          <RefineSnackbarProvider>
              <Refine
                  dataProvider={smartDataProvider}
                  liveProvider={liveProvider(supabaseClient)}
                authProvider={authProvider}
                routerProvider={routerBindings}
                notificationProvider={useNotificationProvider}
                options={{
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  liveMode: 'auto',
                  projectId: "wPUVlS-YutdNT-PBBtUI",
                }}
                resources={[
                  {
                    name: "wishes",
                    list: "/wishes",
                    create: "/new-wish",
                  },
                ]}
              >
                    <Authenticated key="protected" fallback={<AnonymousLogin/>}>
                      <Routes>
                            <Route path="/wishes" element={<WishesListPage />} />
                          <Route path="/new-wish" element={<NewWishPage />} />
                          {/* <Route path="/:slug/:id" element={<WishShow />} /> */}
                          {/* <Route path="/wishes/:id/edit" element={<WishEdit />} /> */}
                      </Routes>
                    </Authenticated>
                    <Routes>
                      <Route path="/l/:slug" element={<PublicWishlistPage />} />
                    </Routes>
                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
          </RefineSnackbarProvider>
        </ThemeProvider>
      </RefineKbarProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
