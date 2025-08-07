import { Authenticated, GitHubBanner, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  RefineSnackbarProvider,
  useNotificationProvider,
} from "@refinedev/mui";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Route, Routes } from "react-router";
import authProvider from "./authProvider";
import { AnonymousLogin } from "./components/auth/anonymous-login";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { UserPublicList } from "./pages/lists/user-public-list.page";
import { NewWishPage } from "./pages/wishes/new-wish.page";
import { EditWishListPage } from "./pages/wishes/wish-list-edit.page";
import { supabaseClient } from "./utility";

function App() {
  return (
    <BrowserRouter>
      <GitHubBanner />
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
              <Refine
                dataProvider={dataProvider(supabaseClient)}
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
                          <Route path="/wishes" element={<EditWishListPage />} />
                          <Route path="/new-wish" element={<NewWishPage />} />
                          {/* <Route path="/:slug/:id" element={<WishShow />} /> */}
                          {/* <Route path="/wishes/:id/edit" element={<WishEdit />} /> */}
                      </Routes>
                    </Authenticated>
                    <Routes>
                      <Route path="/l/:slug" element={<UserPublicList />} />
                    </Routes>
                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
          </RefineSnackbarProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
