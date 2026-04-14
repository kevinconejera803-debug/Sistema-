import type { ComponentType } from "react";
import { AssistantPage } from "./pages/AssistantPage";
import { AssignmentsPage } from "./pages/AssignmentsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ContactsPage } from "./pages/ContactsPage";
import { HomePage } from "./pages/HomePage";
import { MarketsPage } from "./pages/MarketsPage";
import { NewsPage } from "./pages/NewsPage";
import { PrayersPage } from "./pages/PrayersPage";

export type NavigationItem = {
  path: string;
  label: string;
  description: string;
  badge: string;
};

export type AppRoute = NavigationItem & {
  component: ComponentType;
  index?: boolean;
};

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

export const navigation: NavigationItem[] = appRoutes.map(({ component, index, ...item }) => item);
