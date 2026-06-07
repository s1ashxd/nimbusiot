// icons.jsx — minimal stroke-icon set
const Icon = ({ name, size = 16, ...rest }) => {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round",
    ...rest,
  };
  switch (name) {
    case "dashboard": return (<svg {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>);
    case "devices": return (<svg {...p}><rect x="3" y="5" width="14" height="10" rx="1.5"/><path d="M7 19h10"/><path d="M19 9h2v10h-7"/></svg>);
    case "automation": return (<svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-7-7"/><path d="M5 12a7 7 0 0 0 7 7"/><path d="M19 12l2-2-2-2"/><path d="M5 12l-2 2 2 2"/></svg>);
    case "alerts": return (<svg {...p}><path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>);
    case "analytics": return (<svg {...p}><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16V11"/><path d="M12 16V8"/><path d="M16 16v-3"/></svg>);
    case "map": return (<svg {...p}><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v16"/><path d="M15 6v16"/></svg>);
    case "logs": return (<svg {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>);
    case "settings": return (<svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>);
    case "users": return (<svg {...p}><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 4a3.5 3.5 0 0 1 0 7"/><path d="M21 20a6 6 0 0 0-4-5.7"/></svg>);
    case "search": return (<svg {...p}><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>);
    case "bell": return (<svg {...p}><path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>);
    case "plus": return (<svg {...p}><path d="M12 5v14M5 12h14"/></svg>);
    case "filter": return (<svg {...p}><path d="M4 5h16l-6 8v6l-4-2v-4z"/></svg>);
    case "more": return (<svg {...p}><circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/></svg>);
    case "refresh": return (<svg {...p}><path d="M3 12a9 9 0 0 1 16-5.6"/><path d="M21 4v5h-5"/><path d="M21 12a9 9 0 0 1-16 5.6"/><path d="M3 20v-5h5"/></svg>);
    case "download": return (<svg {...p}><path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/></svg>);
    case "chevron-right": return (<svg {...p}><path d="M9 6l6 6-6 6"/></svg>);
    case "chevron-down": return (<svg {...p}><path d="M6 9l6 6 6-6"/></svg>);
    case "thermometer": return (<svg {...p}><path d="M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0z"/><path d="M12 7v9"/></svg>);
    case "drop": return (<svg {...p}><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/></svg>);
    case "wind": return (<svg {...p}><path d="M3 9h12a3 3 0 1 0-3-3"/><path d="M3 15h16a3 3 0 1 1-3 3"/></svg>);
    case "bolt": return (<svg {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>);
    case "wifi": return (<svg {...p}><path d="M5 12a10 10 0 0 1 14 0"/><path d="M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>);
    case "battery": return (<svg {...p}><rect x="3" y="8" width="16" height="8" rx="1.5"/><rect x="5" y="10" width="9" height="4" fill="currentColor" stroke="none"/><path d="M21 11v2"/></svg>);
    case "lock": return (<svg {...p}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></svg>);
    case "lightbulb": return (<svg {...p}><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10c1 1 1.5 2 1.5 3h5c0-1 .5-2 1.5-3a6 6 0 0 0-4-10z"/></svg>);
    case "camera": return (<svg {...p}><rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.5"/><path d="M9 6l1.5-2h3L15 6"/></svg>);
    case "cpu": return (<svg {...p}><rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>);
    case "play": return (<svg {...p}><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>);
    case "pause": return (<svg {...p}><rect x="6" y="5" width="4" height="14" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" fill="currentColor" stroke="none"/></svg>);
    case "arrow-up": return (<svg {...p}><path d="M12 19V5M5 12l7-7 7 7"/></svg>);
    case "arrow-down": return (<svg {...p}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>);
    case "check": return (<svg {...p}><path d="M5 12l5 5 9-11"/></svg>);
    case "x": return (<svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>);
    case "clock": return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
    case "edit": return (<svg {...p}><path d="M4 20h4l11-11-4-4L4 16z"/><path d="M14 6l4 4"/></svg>);
    case "trash": return (<svg {...p}><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>);
    case "eye": return (<svg {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>);
    case "shield": return (<svg {...p}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>);
    case "fan": return (<svg {...p}><circle cx="12" cy="12" r="2"/><path d="M12 2c2 3 2 6 0 8M12 22c-2-3-2-6 0-8M22 12c-3 2-6 2-8 0M2 12c3-2 6-2 8 0"/></svg>);
    case "smoke": return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="M7 11h3M14 11h3M7 14h10"/></svg>);
    case "motion": return (<svg {...p}><circle cx="12" cy="12" r="2"/><path d="M5 5l3 3M19 19l-3-3M19 5l-3 3M5 19l3-3"/></svg>);
    case "leaf": return (<svg {...p}><path d="M5 19c0-7 5-14 14-14 0 9-5 14-14 14z"/><path d="M5 19c4-3 7-6 9-9"/></svg>);
    case "github": return (<svg {...p}><path d="M9 19c-4 1.5-4-2-6-2"/><path d="M16 22v-4a3.5 3.5 0 0 0-1-2.7c3-.3 6-1.5 6-7a5.4 5.4 0 0 0-1.5-3.7 5 5 0 0 0-.1-3.7s-1.2-.3-4 1.4a13.4 13.4 0 0 0-7 0c-2.8-1.7-4-1.4-4-1.4a5 5 0 0 0-.1 3.7A5.4 5.4 0 0 0 3 8.3c0 5.5 3 6.7 6 7a3.5 3.5 0 0 0-1 2.7v4"/></svg>);
    case "send": return (<svg {...p}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>);
    case "globe": return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>);
    case "sun": return (<svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>);
    case "moon": return (<svg {...p}><path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10z"/></svg>);
    default: return (<svg {...p}><circle cx="12" cy="12" r="8"/></svg>);
  }
};

window.Icon = Icon;
