import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { PageLoader } from "./components/common/PageLoader";
import { AppShell } from "./components/layout/AppShell";
import { appRoutes } from "./navigation";

const HomePage = lazy(() => import("./pages/HomePage").then(m => ({ default: m.HomePage })));
const CalendarPage = lazy(() => import("./pages/CalendarPage").then(m => ({ default: m.CalendarPage })));
const AssignmentsPage = lazy(() => import("./pages/AssignmentsPage").then(m => ({ default: m.AssignmentsPage })));
const ContactsPage = lazy(() => import("./pages/ContactsPage").then(m => ({ default: m.ContactsPage })));
const MarketsPage = lazy(() => import("./pages/MarketsPage").then(m => ({ default: m.MarketsPage })));
const NewsPage = lazy(() => import("./pages/NewsPage").then(m => ({ default: m.NewsPage })));
const AssistantPage = lazy(() => import("./pages/AssistantPage").then(m => ({ default: m.AssistantPage })));
const PrayersPage = lazy(() => import("./pages/PrayersPage").then(m => ({ default: m.PrayersPage })));

const routeMap: Record<string, ReturnType<typeof lazy>> = {
  "/": HomePage,
  "/calendario": CalendarPage,
  "/universidad": AssignmentsPage,
  "/contactos": ContactsPage,
  "/mercados": MarketsPage,
  "/noticias": NewsPage,
  "/asistente": AssistantPage,
  "/oraciones": PrayersPage,
};

function PageWrapper({ path }: { path: string }) {
  const Component = routeMap[path];
  return Component ? (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  ) : (
    <Suspense fallback={<PageLoader />}>
      <HomePage />
    </Suspense>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            {appRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path === "/" ? undefined : route.path.slice(1)}
                element={
                  route.index ? (
                    <Suspense fallback={<PageLoader />}>
                      <HomePage />
                    </Suspense>
                  ) : (
                    <PageWrapper path={route.path} />
                  )
                }
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}