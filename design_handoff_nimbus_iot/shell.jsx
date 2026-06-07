// shell.jsx — sidebar, topbar, layout primitives
const { useState, useEffect, useRef, useMemo } = React;

const Sidebar = ({ route, setRoute, alertCount }) => {
  const items = [
    { id: "overview", icon: "dashboard", label: "Обзор" },
    { id: "devices", icon: "devices", label: "Устройства", badge: 14 },
    { id: "device", icon: "thermometer", label: "Климат · Гостиная", indent: true, hidden: true },
    { id: "automation", icon: "automation", label: "Автоматизация", badge: 6 },
    { id: "alerts", icon: "alerts", label: "Алерты", alert: alertCount },
  ];
  const adminItems = [
    { id: "users", icon: "users", label: "Пользователи" },
    { id: "settings", icon: "settings", label: "Настройки" },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"></div>
        <div>
          <div className="brand-name">Nimbus IoT</div>
          <div className="brand-sub">главный хаб · v3.4.0</div>
        </div>
      </div>

      <div className="nav-section">Управление</div>
      {items.map(i => i.hidden ? null : (
        <div key={i.id} className={`nav-item ${route === i.id ? "active" : ""}`}
             style={i.indent ? { marginLeft: 22 } : null}
             onClick={() => setRoute(i.id)}>
          <Icon name={i.icon} size={16} className="icon" />
          <span>{i.label}</span>
          {i.badge ? <span className="badge mono">{i.badge}</span> : null}
          {i.alert ? <span className="alert-dot" /> : null}
        </div>
      ))}

      <div className="nav-section">Администрирование</div>
      {adminItems.map(i => (
        <div key={i.id} className={`nav-item ${route === i.id ? "active" : ""}`}
             onClick={() => setRoute(i.id)}>
          <Icon name={i.icon} size={16} className="icon" />
          <span>{i.label}</span>
        </div>
      ))}

      <div className="nav-foot">
        <div className="row-flex" style={{ padding: "8px 10px", gap: 10 }}>
          <div className="avatar">КС</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>Кирилл Соколов</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>admin@home</div>
          </div>
          <Icon name="chevron-right" size={14} className="muted" />
        </div>
      </div>
    </aside>
  );
};

const ROUTE_TITLES = {
  overview: { crumbs: ["Обзор"], title: "Обзор системы", sub: "Сводка по устройствам, климату и энергии" },
  devices: { crumbs: ["Устройства"], title: "Устройства", sub: "14 устройств · 12 онлайн · 1 предупреждение · 1 offline" },
  device: { crumbs: ["Устройства", "DEV-A1F2"], title: "Климат-датчик · Гостиная", sub: "DEV-A1F2 · Z-Wave · прошивка 2.4.1" },
  automation: { crumbs: ["Автоматизация"], title: "Сценарии и правила", sub: "6 сценариев · 18 триггеров активны" },
  alerts: { crumbs: ["Алерты"], title: "Алерты и уведомления", sub: "3 активных · 6 за последние 24 часа" },
  users: { crumbs: ["Пользователи"], title: "Пользователи", sub: "" },
  settings: { crumbs: ["Настройки"], title: "Настройки", sub: "" },
};

const Topbar = ({ route, onRefresh, lastUpdate }) => {
  const t = ROUTE_TITLES[route] || ROUTE_TITLES.overview;
  return (
    <header className="topbar">
      <div className="crumbs">
        <Icon name="dashboard" size={14} />
        {t.crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <span className={i === t.crumbs.length - 1 ? "here" : ""}>{c}</span>
            {i < t.crumbs.length - 1 ? <span className="sep">/</span> : null}
          </React.Fragment>
        ))}
      </div>
      <div className="tb-actions">
        <span className="muted" style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}>
          обн. {lastUpdate}
        </span>
        <button className="icon-btn" onClick={onRefresh} title="Обновить">
          <Icon name="refresh" size={15} />
        </button>
        <button className="icon-btn" title="Уведомления"><Icon name="bell" size={15} /><span className="dot" /></button>
      </div>
    </header>
  );
};

const SectionHead = ({ title, sub, right }) => (
  <div className="section-head">
    <div>
      <h2>{title}</h2>
      {sub ? <div className="sub" style={{ marginTop: 4 }}>{sub}</div> : null}
    </div>
    {right ? <div className="right">{right}</div> : null}
  </div>
);

const StatusPill = ({ status, big }) => {
  const map = {
    online: { cls: "ok", label: "Онлайн", pulse: true },
    warn: { cls: "warn", label: "Предупреждение" },
    err: { cls: "err", label: "Тревога" },
    offline: { cls: "", label: "Offline" },
  }[status] || { cls: "", label: status };
  return (
    <span className={`pill ${map.cls}`} style={big ? { height: 26, padding: "0 12px", fontSize: 12 } : null}>
      {map.pulse ? <span className="pulse" /> : <span className="pill-dot" />}
      {map.label}
    </span>
  );
};

window.Shell = { Sidebar, Topbar, SectionHead, StatusPill, ROUTE_TITLES };
