import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbar } from "@refinedev/kbar";
import routerBindings, { UnsavedChangesNotifier } from "@refinedev/react-router";
import { liveProvider } from "@refinedev/supabase";
import { useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router";
import authProvider from "../authProvider";
import { AnonymousLogin } from "../components/auth/anonymous-login";
import { smartDataProvider } from "../providers/smartDataProvider";
import { supabaseClient } from "../utility";
import { fallbackLng, Locale, supportedLngs } from "./config";
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
      {/* Nested routes are defined in App.tsx; render them via <Outlet /> */}
      <Outlet />
      <RefineKbar />
      <UnsavedChangesNotifier />
    </Refine>
  );
};

export const ProtectedOutlet: React.FC = () => (
  <Authenticated key="protected" fallback={<AnonymousLogin />}>
    <Outlet />
  </Authenticated>
);
