// pages-overview.jsx
const { Sparkline, AreaChart, BarChart, Donut, SignalBars, BatteryIndicator } = window.Charts;

const KPI = ({ label, val, unit, delta, deltaDir = "up", icon, tone = "accent", spark }) => (
  <div className={`kpi ${tone}`}>
    <div className="ico"><Icon name={icon} size={14} /></div>
    <div className="label">{label}</div>
    <div className="row" style={{ alignItems: "baseline", gap: 4 }}>
      <div className="val">{val}</div>
      {unit ? <span className="unit">{unit}</span> : null}
    </div>
    <div className="row">
      {delta ? (
        <span className={`delta ${deltaDir}`}>
          <Icon name={deltaDir === "up" ? "arrow-up" : "arrow-down"} size={12} />
          {delta}
        </span>
      ) : null}
      {spark ? <div className="spark" style={{ marginLeft: "auto", color: "var(--accent)" }}>
        <Sparkline data={spark} w={88} h={22} />
      </div> : null}
    </div>
  </div>
);

const OverviewPage = ({ onOpenDevice }) => {
  const { DEVICES, ALERTS, SERIES, SCENES, ACTIVITY } = window.MOCK;
  const online = DEVICES.filter(d => d.status === "online").length;
  const warns = DEVICES.filter(d => d.status === "warn").length;
  const offline = DEVICES.filter(d => d.status === "offline").length;
  const errs = DEVICES.filter(d => d.status === "err").length;

  const [chartTab, setChartTab] = useState("temp");
  const [range, setRange] = useState("24h");

  const series = useMemo(() => {
    if (chartTab === "temp") return [
      { id: "liv", label: "Гостиная", data: window.MOCK.SERIES.temp, color: "#00d4ff" },
      { id: "bed", label: "Спальня", data: window.MOCK.makeSeries(48, 20, 0.5, 41), color: "#a78bfa" },
      { id: "kit", label: "Кухня", data: window.MOCK.makeSeries(48, 23, 0.7, 53), color: "#fbbf24" },
    ];
    if (chartTab === "humid") return [
      { id: "h", label: "Влажность %", data: window.MOCK.SERIES.humidity, color: "#6ee7ff" },
    ];
    if (chartTab === "power") return [
      { id: "p", label: "Мощность кВт", data: window.MOCK.SERIES.power, color: "#22c55e" },
    ];
    return [{ id: "n", label: "Сеть", data: window.MOCK.SERIES.network, color: "#a78bfa" }];
  }, [chartTab]);

  const energyByRoom = [
    { label: "Гост.", value: 4.2, color: "#00d4ff" },
    { label: "Кухня", value: 6.8, color: "#00d4ff" },
    { label: "Спал.", value: 2.1, color: "#00d4ff" },
    { label: "Каб.", value: 3.4, color: "#00d4ff" },
    { label: "Гараж", value: 7.9, color: "#00d4ff" },
    { label: "Ванн.", value: 1.6, color: "#00d4ff" },
    { label: "Прих.", value: 0.8, color: "#00d4ff" },
    { label: "Двор", value: 2.3, color: "#00d4ff" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionHead
        title="Обзор системы"
        sub="Состояние всех устройств, климат, энергопотребление и активные сценарии"
        right={
          <>
            <div className="seg">
              {["24ч", "7д", "30д"].map((r, i) => (
                <button key={r} className={i === 0 ? "active" : ""}>{r}</button>
              ))}
            </div>
            <button className="btn"><Icon name="download" size={13} /> Экспорт</button>
          </>
        }
      />

      {/* KPIs */}
      <div className="kpi-grid">
        <KPI label="Устройства онлайн" val={online} unit={`/ ${DEVICES.length}`} delta="+1 за 24ч" deltaDir="up" icon="devices" tone="" spark={[10,11,12,11,12,12,12]} />
        <KPI label="Активные алерты" val={errs + warns} unit="" delta="2 новых" deltaDir="up" icon="alerts" tone="err" spark={[0,1,1,0,2,3,3]} />
        <KPI label="Энергопотребление" val="29.1" unit="кВт·ч" delta="−4.2% к вчера" deltaDir="down" icon="bolt" tone="ok" spark={SERIES.power.slice(-12)} />
        <KPI label="Сценариев активно" val="5" unit="/ 6" delta="2 запуска сегодня" deltaDir="up" icon="automation" tone="" spark={[2,3,3,4,5,5,5]} />
      </div>

      {/* Main grid: chart + status donut */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-hd">
            <h3>Метрики в реальном времени</h3>
            <div className="right">
              <div className="seg">
                {[["temp","Температура"],["humid","Влажность"],["power","Мощность"],["network","Сеть"]].map(([id,l]) => (
                  <button key={id} className={chartTab === id ? "active" : ""} onClick={() => setChartTab(id)}>{l}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="card-bd">
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 8 }}>
              <div>
                <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Текущее значение</div>
                <div className="mono" style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.02em" }}>
                  {chartTab === "temp" && "22.4"}
                  {chartTab === "humid" && "47.8"}
                  {chartTab === "power" && "1.84"}
                  {chartTab === "network" && "98.2"}
                  <span style={{ fontSize: 14, color: "var(--text-dim)", marginLeft: 4, fontFamily: "var(--font-sans)" }}>
                    {chartTab === "temp" && "°C"}
                    {chartTab === "humid" && "%"}
                    {chartTab === "power" && "кВт"}
                    {chartTab === "network" && "% uptime"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, marginLeft: "auto" }}>
                {series.map(s => (
                  <div key={s.id} className="row-flex" style={{ fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, background: s.color, borderRadius: 2, display: "inline-block" }} />
                    <span className="muted">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <AreaChart series={series} h={240} />
          </div>
        </div>

        <div className="card">
          <div className="card-hd">
            <h3>Состояние сети</h3>
            <div className="right"><span className="pill accent"><span className="pulse" />live</span></div>
          </div>
          <div className="card-bd">
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center" }}>
              <Donut value={online} total={DEVICES.length} size={120} stroke={11}
                color="var(--accent)" label={`${online}/${DEVICES.length}`} sub="онлайн" />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <NetRow color="var(--ok)" label="Онлайн" count={online} />
                <NetRow color="var(--warn)" label="Предупреждение" count={warns} />
                <NetRow color="var(--err)" label="Тревога" count={errs} />
                <NetRow color="var(--text-faint)" label="Offline" count={offline} />
              </div>
            </div>
            <hr className="hr" style={{ margin: "16px 0" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <MiniStat label="Средний RSSI" val="-58 дБм" sub="хорошо" tone="ok" />
              <MiniStat label="Задержка" val="12 мс" sub="по MQTT" tone="ok" />
              <MiniStat label="Пакеты потеряны" val="0.04%" sub="за час" tone="ok" />
              <MiniStat label="Z-Wave устр." val="12 / 14" sub="через хаб" />
            </div>
          </div>
        </div>
      </div>

      {/* Energy + Scenes + Alerts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1.2fr", gap: 16 }}>
        <div className="card">
          <div className="card-hd">
            <h3>Энергопотребление</h3>
            <span className="sub">по комнатам · сегодня</span>
            <div className="right">
              <span className="mono" style={{ fontSize: 13 }}>29.1 кВт·ч</span>
            </div>
          </div>
          <div className="card-bd">
            <BarChart data={energyByRoom} h={180} />
          </div>
        </div>

        <div className="card">
          <div className="card-hd">
            <h3>Сценарии</h3>
            <div className="right"><button className="btn ghost sm">Все →</button></div>
          </div>
          <div className="card-bd" style={{ padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {SCENES.slice(0, 5).map(s => (
              <div key={s.id} className="row-flex" style={{
                padding: "10px 8px", borderRadius: 8, gap: 12,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center",
                  background: s.color + "22", color: s.color, flexShrink: 0,
                }}><Icon name={s.icon} size={16} /></div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>{s.trigger} · {s.actions} действий</div>
                </div>
                <div className={`toggle ${s.on ? "on" : ""}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-hd">
            <h3>Активность</h3>
            <span className="sub">последние события</span>
            <div className="right"><button className="btn ghost sm">Журнал →</button></div>
          </div>
          <div className="card-bd" style={{ padding: 0 }}>
            <div style={{ maxHeight: 280, overflow: "auto" }}>
              {ACTIVITY.slice(0, 8).map((a, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "auto auto 1fr", gap: 10, alignItems: "start",
                  padding: "10px 14px", borderTop: i ? "1px solid var(--line)" : "none", fontSize: 12.5,
                }}>
                  <span className="mono muted" style={{ fontSize: 11 }}>{a.time}</span>
                  <span className={`pill ${a.level}`} style={{ height: 18, fontSize: 10, padding: "0 6px" }}>
                    <span className="pill-dot" /> {a.scope}
                  </span>
                  <span style={{ lineHeight: 1.4 }}>{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Devices snapshot */}
      <div className="card">
        <div className="card-hd">
          <h3>Устройства</h3>
          <span className="sub">актуальные значения</span>
          <div className="right">
            <button className="btn ghost sm"><Icon name="filter" size={12} /> Фильтр</button>
            <button className="btn ghost sm" onClick={() => onOpenDevice && onOpenDevice()}>Все устройства →</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", padding: 12, gap: 10 }}>
          {window.MOCK.DEVICES.slice(0, 8).map(d => (
            <DeviceMiniCard key={d.id} d={d} onOpen={() => onOpenDevice && onOpenDevice(d.id)} />
          ))}
        </div>
      </div>
    </div>
  );
};

const NetRow = ({ color, label, count }) => (
  <div className="row-flex" style={{ justifyContent: "space-between" }}>
    <div className="row-flex">
      <span style={{ width: 8, height: 8, borderRadius: 50, background: color }} />
      <span style={{ fontSize: 13 }}>{label}</span>
    </div>
    <span className="mono" style={{ fontSize: 13, color: "var(--text-dim)" }}>{count}</span>
  </div>
);

const MiniStat = ({ label, val, sub, tone }) => (
  <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--line)" }}>
    <div className="muted" style={{ fontSize: 11 }}>{label}</div>
    <div className="mono" style={{ fontSize: 16, fontWeight: 500, marginTop: 2 }}>{val}</div>
    {sub ? <div style={{ fontSize: 11, color: tone === "ok" ? "var(--ok)" : "var(--text-dim)", marginTop: 2 }}>{sub}</div> : null}
  </div>
);

const DeviceMiniCard = ({ d, onOpen }) => {
  const meta = window.MOCK.TYPES_META[d.type] || {};
  const tone = d.status === "err" ? "err" : d.status === "warn" ? "warn" : d.status === "offline" ? "" : "ok";
  return (
    <div onClick={onOpen} style={{
      padding: 14, borderRadius: 10, border: "1px solid var(--line)",
      background: "var(--bg-2)", display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div className="row-flex" style={{ justifyContent: "space-between" }}>
        <div className="row-flex">
          <div style={{
            width: 28, height: 28, borderRadius: 7, display: "grid", placeItems: "center",
            background: tone === "ok" ? "var(--accent-soft)" : tone === "err" ? "var(--err-soft)" : tone === "warn" ? "var(--warn-soft)" : "var(--bg-3)",
            color: tone === "ok" ? "var(--accent)" : tone === "err" ? "var(--err)" : tone === "warn" ? "var(--warn)" : "var(--text-dim)",
          }}>
            <Icon name={meta.icon || "cpu"} size={14} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }}>{d.room}</div>
            <div className="muted" style={{ fontSize: 11 }}>{meta.label}</div>
          </div>
        </div>
        <StatusPill status={d.status} />
      </div>
      <div className="row-flex" style={{ alignItems: "baseline", gap: 4 }}>
        <span className="mono" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>
          {d.value}
        </span>
        {d.unit ? <span className="muted" style={{ fontSize: 12 }}>{d.unit}</span> : null}
      </div>
      <div className="row-flex" style={{ justifyContent: "space-between", color: "var(--text-dim)", fontSize: 11 }}>
        <span className="row-flex" style={{ gap: 4 }}><SignalBars level={d.signal} size={11} /> сигнал</span>
        {d.battery != null ? <BatteryIndicator pct={d.battery} /> : <span className="mono">{d.fw}</span>}
      </div>
    </div>
  );
};

const { SectionHead, StatusPill } = window.Shell;
window.Pages = window.Pages || {};
window.Pages.Overview = OverviewPage;
window.Pages.DeviceMiniCard = DeviceMiniCard;
