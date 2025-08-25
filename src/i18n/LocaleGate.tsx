import { Navigate, Route, Routes, useParams } from "react-router";
import { useEffect } from "react";
import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbar } from "@refinedev/kbar";
import routerBindings, { DocumentTitleHandler, UnsavedChangesNotifier } from "@refinedev/react-router";
import { liveProvider } from "@refinedev/supabase";
import authProvider from "../authProvider";
import { supabaseClient } from "../utility";
import { smartDataProvider } from "../providers/smartDataProvider";
import { WishesListPage } from "../pages/wishes/WishesListPage";
import { NewWishPage } from "../pages/wishes/new-wish.page";
import { PublicWishlistPage } from "../pages/wishes/public-wishlist.page";
import { AnonymousLogin } from "../components/auth/anonymous-login";
import { fallbackLng, supportedLngs, Locale } from "./config";
import { changeLocale } from "./index";

export const LocaleGate: React.FC = () => {
  const { locale } = useParams<{ locale: Locale }>();

  useEffect(() => {
    if (locale && supportedLngs.includes(locale)) {
      changeLocale(locale);
    }
  }, [locale]);

  if (!locale || !supportedLngs.includes(locale)) {
    return <Navigate to={`/${fallbackLng}`} replace />;
  }

  return (
    <Refine
      dataProvider={smartDataProvider}
      liveProvider={liveProvider(supabaseClient)}
      authProvider={authProvider}
      routerProvider={routerBindings}
      options={{
        warnWhenUnsavedChanges: true,
        useNewQueryKeys: true,
        liveMode: "auto",
        projectId: "wPUVlS-YutdNT-PBBtUI",
      }}
      resources={[
        {
          name: "wishes",
          list: "wishes",
          create: "new-wish",
        },
      ]}
    >
      <Authenticated key="protected" fallback={<AnonymousLogin />}>
        <Routes>
          <Route path="wishes" element={<WishesListPage />} />
          <Route path="new-wish" element={<NewWishPage />} />
        </Routes>
      </Authenticated>
      <Routes>
        <Route path="l/:slug" element={<PublicWishlistPage />} />
      </Routes>
      <RefineKbar />
      <UnsavedChangesNotifier />
      <DocumentTitleHandler />
    </Refine>
  );
};
