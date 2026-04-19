import type { ComponentType, LazyExoticComponent } from "react";
import { lazy } from "react";

export type NavigationItem = {
  path: string;
  label: string;
  description: string;
  badge: string;
};

export type AppRoute = NavigationItem & {
  component: LazyExoticComponent<ComponentType>;
  index?: boolean;
};

// Lazy load pages for code-splitting
const HomePage = lazy(() => import("./pages/HomePage").then(m => ({ default: m.HomePage })));
const CalendarPage = lazy(() => import("./pages/CalendarPage").then(m => ({ default: m.CalendarPage })));
const AssignmentsPage = lazy(() => import("./pages/AssignmentsPage").then(m => ({ default: m.AssignmentsPage })));
const ContactsPage = lazy(() => import("./pages/ContactsPage").then(m => ({ default: m.ContactsPage })));
const MarketsPage = lazy(() => import("./pages/MarketsPage").then(m => ({ default: m.MarketsPage })));
const NewsPage = lazy(() => import("./pages/NewsPage").then(m => ({ default: m.NewsPage })));
const AssistantPage = lazy(() => import("./pages/AssistantPage").then(m => ({ default: m.AssistantPage })));
const PrayersPage = lazy(() => import("./pages/PrayersPage").then(m => ({ default: m.PrayersPage })));

export const appRoutes: AppRoute[] = [
  {
    path: "/",
    label: "Inicio",
    description: "Resumen del sistema",
    badge: "IN",
    component: HomePage,
    index: true
  },
  {
    path: "/calendario",
    label: "Calendario",
    description: "Agenda y eventos",
    badge: "CA",
    component: CalendarPage
  },
  {
    path: "/universidad",
    label: "Universidad",
    description: "Tareas y progreso",
    badge: "UN",
    component: AssignmentsPage
  },
  {
    path: "/contactos",
    label: "Contactos",
    description: "Red personal y laboral",
    badge: "CO",
    component: ContactsPage
  },
  {
    path: "/mercados",
    label: "Mercados",
    description: "Seguimiento financiero",
    badge: "ME",
    component: MarketsPage
  },
  {
    path: "/noticias",
    label: "Noticias",
    description: "Fuentes y titulares",
    badge: "NO",
    component: NewsPage
  },
  {
    path: "/asistente",
    label: "Asistente",
    description: "Respuestas con contexto",
    badge: "AS",
    component: AssistantPage
  },
  {
    path: "/oraciones",
    label: "Oraciones",
    description: "Registro personal",
    badge: "OR",
    component: PrayersPage
  }
];

// Navigation items without component (for display only)
export const navigation: NavigationItem[] = appRoutes.map(({ component, index, ...item }) => item);