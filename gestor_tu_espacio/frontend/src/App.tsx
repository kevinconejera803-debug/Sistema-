import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { appRoutes } from "./navigation";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          {appRoutes.map((route) => {
            const Component = route.component;

            if (route.index) {
              return <Route key={route.path} index element={<Component />} />;
            }

            return <Route key={route.path} path={route.path.slice(1)} element={<Component />} />;
          })}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
