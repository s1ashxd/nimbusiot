import { ReactNode, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  SpeedometerMax,
  Cpu,
  Programming,
  Notebook,
  UsersGroupRounded,
  Settings as SettingsIcon,
  Logout,
} from "@solar-icons/react";
import { useAuth } from "../lib/auth";

export function Shell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (open) document.body.dataset.sidebar = "open";
    else delete document.body.dataset.sidebar;
    return () => { delete document.body.dataset.sidebar; };
  }, [open]);

  const closeOnNav = () => setOpen(false);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" />
          <div className="brand-name">Nimbus IoT</div>
        </div>
        <div className="nav-section">Основное</div>
        <NavLink to="/" end onClick={closeOnNav} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <SpeedometerMax size={18} weight="Linear" /> Обзор
        </NavLink>
        <NavLink to="/devices" onClick={closeOnNav} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Cpu size={18} weight="Linear" /> Устройства
        </NavLink>
        <NavLink to="/automation" onClick={closeOnNav} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Programming size={18} weight="Linear" /> Сценарии
        </NavLink>
        <NavLink to="/activity" onClick={closeOnNav} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Notebook size={18} weight="Linear" /> Журнал
        </NavLink>
        <div className="nav-section">Управление</div>
        <NavLink to="/users" onClick={closeOnNav} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <UsersGroupRounded size={18} weight="Linear" /> Пользователи
        </NavLink>
        <NavLink to="/settings" onClick={closeOnNav} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <SettingsIcon size={18} weight="Linear" /> Настройки
        </NavLink>
        <div className="spacer" />
        <button className="nav-item" onClick={logout}>
          <Logout size={18} weight="Linear" /> Выйти
        </button>
      </aside>
      <div
        className="sidebar-backdrop"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <header className="topbar">
        <button
          className="menu-btn"
          onClick={() => setOpen(true)}
          aria-label="Открыть меню"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
        <div className="spacer" />
        <div className="user-chip">
          <div className="user-avatar">{(user?.fullName ?? "?").slice(0, 1)}</div>
          <span>{user?.fullName}</span>
        </div>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
