import { NavLink } from "react-router-dom";
import { navigation } from "../../navigation";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__mark">TE</div>
        <div>
          <div className="sidebar__title">Tu Espacio</div>
          <div className="sidebar__caption">Workspace personal</div>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Navegacion principal">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `sidebar__link${isActive ? " sidebar__link--active" : ""}`
            }
          >
            <span className="sidebar__badge">{item.badge}</span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
