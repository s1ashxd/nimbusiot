// charts.jsx — small inline SVG chart components

const Sparkline = ({ data, w = 80, h = 24, stroke = "currentColor", fill = "currentColor", fillOpacity = 0.15 }) => {
  if (!data || !data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, h - ((v - min) / range) * (h - 2) - 1]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const fillD = `${d} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <path d={fillD} fill={fill} fillOpacity={fillOpacity} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const AreaChart = ({ series, w = 600, h = 220, color = "#00d4ff", showAxes = true, yLabel = "", unit = "" }) => {
  const all = series.flatMap(s => s.data);
  const min = Math.min(...all), max = Math.max(...all);
  const pad = (max - min) * 0.1 || 1;
  const yMin = Math.max(0, min - pad), yMax = max + pad;
  const padL = 36, padR = 12, padT = 12, padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const xOf = (i, n) => padL + (i / (n - 1)) * innerW;
  const yOf = v => padT + innerH - ((v - yMin) / (yMax - yMin || 1)) * innerH;

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (i * (yMax - yMin)) / yTicks);
  const xTicks = ["00", "06", "12", "18", "24"];

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }} preserveAspectRatio="none">
      <defs>
        {series.map((s, i) => (
          <linearGradient key={i} id={`grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color || color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={s.color || color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {showAxes && ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={yOf(t)} y2={yOf(t)} stroke="currentColor" strokeOpacity="0.06" />
          <text x={padL - 6} y={yOf(t) + 3} fontSize="10" textAnchor="end" fill="currentColor" fillOpacity="0.5" fontFamily="var(--font-mono)">
            {t.toFixed(t > 100 ? 0 : 1)}
          </text>
        </g>
      ))}
      {showAxes && xTicks.map((t, i) => (
        <text key={i} x={padL + (i / (xTicks.length - 1)) * innerW} y={h - padB + 14}
          fontSize="10" textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontFamily="var(--font-mono)">
          {t}:00
        </text>
      ))}

      {series.map((s, si) => {
        const n = s.data.length;
        const pts = s.data.map((v, i) => [xOf(i, n), yOf(v)]);
        const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
        const fillD = `${d} L ${pts[pts.length - 1][0]} ${padT + innerH} L ${pts[0][0]} ${padT + innerH} Z`;
        return (
          <g key={si}>
            <path d={fillD} fill={`url(#grad-${s.id})`} />
            <path d={d} fill="none" stroke={s.color || color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            {/* last point dot */}
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill={s.color || color} />
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="6" fill={s.color || color} fillOpacity="0.25" />
          </g>
        );
      })}
    </svg>
  );
};

const BarChart = ({ data, w = 600, h = 180, color = "#00d4ff" }) => {
  const max = Math.max(...data.map(d => d.value));
  const padL = 32, padR = 12, padT = 8, padB = 24;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const bw = innerW / data.length;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }} preserveAspectRatio="none">
      {[0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1={padL} x2={w - padR} y1={padT + innerH * (1 - t)} y2={padT + innerH * (1 - t)}
          stroke="currentColor" strokeOpacity="0.06" />
      ))}
      {data.map((d, i) => {
        const bh = (d.value / max) * innerH;
        const x = padL + i * bw + 3;
        const y = padT + innerH - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw - 6} height={bh} rx="3" fill={d.color || color} fillOpacity="0.85" />
            <text x={x + (bw - 6) / 2} y={h - padB + 14} fontSize="10" textAnchor="middle"
              fill="currentColor" fillOpacity="0.55" fontFamily="var(--font-mono)">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

const Donut = ({ value, total = 100, size = 110, stroke = 10, color = "var(--accent)", track = "var(--bg-3)", label, sub }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / total));
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={`${c * pct} ${c}`} strokeDashoffset={c * 0.25}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: size * 0.22, fontWeight: 500, letterSpacing: "-0.02em" }}>{label}</div>
          {sub ? <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{sub}</div> : null}
        </div>
      </div>
    </div>
  );
};

const SignalBars = ({ level = 4, size = 14 }) => {
  const bars = 5;
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 1.5, height: size }}>
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} style={{
          width: 2.2, height: ((i + 1) / bars) * size,
          background: i < level ? "currentColor" : "currentColor",
          opacity: i < level ? 1 : 0.2, borderRadius: 1,
        }} />
      ))}
    </span>
  );
};

const BatteryIndicator = ({ pct = 80, size = "sm" }) => {
  const w = size === "sm" ? 22 : 30, h = size === "sm" ? 11 : 14;
  const color = pct < 20 ? "var(--err)" : pct < 40 ? "var(--warn)" : "var(--ok)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ position: "relative", width: w, height: h, border: "1px solid currentColor",
        borderRadius: 2, opacity: 0.7, display: "inline-block" }}>
        <span style={{ position: "absolute", inset: 1, width: `calc(${pct}% - 2px)`,
          background: color, borderRadius: 1 }} />
        <span style={{ position: "absolute", right: -3, top: 2, width: 2, height: h - 4,
          background: "currentColor", borderRadius: 1 }} />
      </span>
      <span className="mono" style={{ fontSize: 11, color: "var(--text-dim)" }}>{pct}%</span>
    </span>
  );
};

window.Charts = { Sparkline, AreaChart, BarChart, Donut, SignalBars, BatteryIndicator };
