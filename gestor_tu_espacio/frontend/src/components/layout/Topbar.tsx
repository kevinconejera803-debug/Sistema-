import { useLocation } from "react-router-dom";
import { navigation } from "../../navigation";

export function Topbar() {
  const location = useLocation();
  const activeItem =
    navigation.find((item) => item.path === location.pathname) ?? navigation[0];

  return (
    <header className="topbar">
      <div>
        <div className="topbar__label">SPA unificada</div>
        <div className="topbar__title">{activeItem.label}</div>
      </div>
      <div className="topbar__actions">
        <span className="button button--ghost" aria-label="Estado de interfaz">
          UI React + API Flask
        </span>
      </div>
    </header>
  );
}
